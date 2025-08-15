import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HostManager } from '../HostManager';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('HostManager', () => {
  const mockSetHosts = vi.fn();
  const mockOnHostStatusChange = vi.fn();
  
  const defaultProps = {
    hosts: [],
    setHosts: mockSetHosts,
    onHostStatusChange: mockOnHostStatusChange,
  };

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Host Addition', () => {
    it('should add a new host with valid URL', async () => {
      const { container } = render(<HostManager {...defaultProps} />);
      
      const urlInput = screen.getByPlaceholderText(/http:\/\/your-gpu-server/i);
      const nameInput = screen.getByPlaceholderText(/Main Server/i);
      const addButton = screen.getByText(/Add Host/i);

      fireEvent.change(urlInput, { target: { value: 'http://test-server:5000/nvidia-smi.json' } });
      fireEvent.change(nameInput, { target: { value: 'Test Server' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockSetHosts).toHaveBeenCalledWith([
          {
            url: 'http://test-server:5000/nvidia-smi.json',
            name: 'Test Server',
            isConnected: false,
          },
        ]);
      });
    });

    it('should validate URL format', async () => {
      const { toast } = await import('sonner');
      render(<HostManager {...defaultProps} />);
      
      const urlInput = screen.getByPlaceholderText(/http:\/\/your-gpu-server/i);
      const addButton = screen.getByText(/Add Host/i);

      fireEvent.change(urlInput, { target: { value: 'invalid-url' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining('valid URL format')
        );
        expect(mockSetHosts).not.toHaveBeenCalled();
      });
    });

    it('should prevent duplicate hosts', async () => {
      const { toast } = await import('sonner');
      const existingHost = {
        url: 'http://existing:5000/nvidia-smi.json',
        name: 'Existing',
        isConnected: true,
      };
      
      render(<HostManager {...defaultProps} hosts={[existingHost]} />);
      
      const urlInput = screen.getByPlaceholderText(/http:\/\/your-gpu-server/i);
      const addButton = screen.getByText(/Add Host/i);

      fireEvent.change(urlInput, { target: { value: existingHost.url } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Host already exists');
        expect(mockSetHosts).not.toHaveBeenCalled();
      });
    });

    it('should auto-generate name from URL if not provided', async () => {
      render(<HostManager {...defaultProps} />);
      
      const urlInput = screen.getByPlaceholderText(/http:\/\/your-gpu-server/i);
      const addButton = screen.getByText(/Add Host/i);

      fireEvent.change(urlInput, { target: { value: 'http://gpu-server:5000/nvidia-smi.json' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockSetHosts).toHaveBeenCalledWith([
          {
            url: 'http://gpu-server:5000/nvidia-smi.json',
            name: 'gpu-server:5000',
            isConnected: false,
          },
        ]);
      });
    });

    it('should test connection after adding host', async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({  // First call for backend API
          ok: false,
          status: 404,
        })
        .mockResolvedValueOnce({  // Second call for connection test
          ok: true,
          json: async () => ({ gpus: [] }),
        });

      const { toast } = await import('sonner');
      render(<HostManager {...defaultProps} />);
      
      const urlInput = screen.getByPlaceholderText(/http:\/\/your-gpu-server/i);
      const addButton = screen.getByText(/Add Host/i);

      fireEvent.change(urlInput, { target: { value: 'http://test:5000/nvidia-smi.json' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Added host: test:5000');
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('http://test:5000/nvidia-smi.json');
        expect(toast.success).toHaveBeenCalledWith('Successfully connected to test:5000');
        expect(mockOnHostStatusChange).toHaveBeenCalledWith('http://test:5000/nvidia-smi.json', true);
      });
    });
  });

  describe('Host Removal', () => {
    it('should remove host from list', async () => {
      const hosts = [
        { url: 'http://host1:5000/nvidia-smi.json', name: 'Host 1', isConnected: true },
        { url: 'http://host2:5000/nvidia-smi.json', name: 'Host 2', isConnected: false },
      ];

      render(<HostManager {...defaultProps} hosts={hosts} />);
      
      const removeButtons = screen.getAllByRole('button', { name: '' });
      fireEvent.click(removeButtons[0]);

      await waitFor(() => {
        expect(mockSetHosts).toHaveBeenCalledWith([hosts[1]]);
      });
    });

    it('should update localStorage on removal', async () => {
      const { toast } = await import('sonner');
      const host = { url: 'http://host1:5000/nvidia-smi.json', name: 'Host 1', isConnected: true };
      
      render(<HostManager {...defaultProps} hosts={[host]} />);
      
      const removeButton = screen.getByRole('button', { name: '' });
      fireEvent.click(removeButton);

      await waitFor(() => {
        expect(localStorage.getItem('gpu_monitor_hosts')).toBe('[]');
        expect(toast.success).toHaveBeenCalledWith('Host removed');
      });
    });
  });

  describe('UI State Management', () => {
    it('should show loading state while adding host', async () => {
      render(<HostManager {...defaultProps} />);
      
      const urlInput = screen.getByPlaceholderText(/http:\/\/your-gpu-server/i);
      const addButton = screen.getByText(/Add Host/i);

      fireEvent.change(urlInput, { target: { value: 'http://test:5000/nvidia-smi.json' } });
      fireEvent.click(addButton);

      expect(screen.getByText(/Adding.../i)).toBeInTheDocument();
      expect(addButton).toBeDisabled();
    });

    it('should display host count correctly', () => {
      const hosts = [
        { url: 'http://host1:5000/nvidia-smi.json', name: 'Host 1', isConnected: true },
        { url: 'http://host2:5000/nvidia-smi.json', name: 'Host 2', isConnected: false },
      ];

      render(<HostManager {...defaultProps} hosts={hosts} />);
      
      expect(screen.getByText(/Configured Hosts \(2\)/)).toBeInTheDocument();
    });

    it('should show connection status badges', () => {
      const hosts = [
        { url: 'http://host1:5000/nvidia-smi.json', name: 'Host 1', isConnected: true },
        { url: 'http://host2:5000/nvidia-smi.json', name: 'Host 2', isConnected: false },
      ];

      render(<HostManager {...defaultProps} hosts={hosts} />);
      
      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });
  });

  describe('Backend Integration', () => {
    it('should sync with backend API when available', async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ url: 'http://test:5000/nvidia-smi.json', name: 'Test' }),
      });

      render(<HostManager {...defaultProps} />);
      
      const urlInput = screen.getByPlaceholderText(/http:\/\/your-gpu-server/i);
      const addButton = screen.getByText(/Add Host/i);

      fireEvent.change(urlInput, { target: { value: 'http://test:5000/nvidia-smi.json' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/hosts'),
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: 'http://test:5000/nvidia-smi.json',
              name: 'test:5000',
            }),
          })
        );
      });
    });

    it('should fallback to localStorage if backend unavailable', async () => {
      global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));
      
      const { toast } = await import('sonner');
      render(<HostManager {...defaultProps} />);
      
      const urlInput = screen.getByPlaceholderText(/http:\/\/your-gpu-server/i);
      const addButton = screen.getByText(/Add Host/i);

      fireEvent.change(urlInput, { target: { value: 'http://test:5000/nvidia-smi.json' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockSetHosts).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Added host'));
      });
    });
  });
});