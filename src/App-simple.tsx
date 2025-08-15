const App = () => (
  <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
    <h1>GPU Dashboard Test</h1>
    <p>This is a simple test to verify React is working.</p>
    <div style={{ 
      marginTop: '20px', 
      padding: '15px', 
      border: '1px solid #ccc', 
      borderRadius: '8px',
      backgroundColor: '#f5f5f5'
    }}>
      <h3>✅ Frontend Status</h3>
      <ul>
        <li>React: Working</li>
        <li>Container: Running</li>
        <li>Port: 8080</li>
        <li>Docker: Operational</li>
      </ul>
    </div>
  </div>
);

export default App;