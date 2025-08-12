# Security Guide - GPU Monitor

This document outlines the security considerations, best practices, and implemented measures for the GPU Monitor application.

## 🛡️ Security Measures Implemented

### 1. Environment-Based Configuration
- **No Hardcoded Secrets**: All sensitive information moved to environment variables
- **Default Value Sanitization**: Safe fallback values for all configuration options
- **Environment Isolation**: Separate configurations for development/production

### 2. Input Validation & Sanitization
- **URL Validation**: Proper validation of host URLs before adding
- **CORS Protection**: Configurable cross-origin resource sharing
- **Request Validation**: Input sanitization on all API endpoints
- **Error Handling**: Safe error messages without information leakage

### 3. Infrastructure Security
- **Docker Isolation**: Containerized services with minimal attack surface
- **Network Segmentation**: Proper container networking with restricted access
- **File System Permissions**: Appropriate permissions for persistent data
- **Secret Management**: Environment-based secret management

## 🔐 Security Configuration

### Environment Variables
All security-sensitive configurations use environment variables:

```bash
# Required Security Settings
FLASK_SECRET_KEY=your-strong-secret-key-here
CORS_ORIGINS=http://localhost:8080,https://your-domain.com
FLASK_DEBUG=false

# Network Configuration
FLASK_HOST=0.0.0.0  # Consider 127.0.0.1 for localhost-only
FLASK_PORT=5000     # Change default port if needed
```

### Recommended Production Settings

```bash
# Production Environment
FLASK_DEBUG=false
FLASK_SECRET_KEY=generate-strong-random-key-here
CORS_ORIGINS=https://your-production-domain.com
FLASK_HOST=127.0.0.1  # Localhost only if behind reverse proxy

# Security Headers (if using reverse proxy)
SECURE_SSL_REDIRECT=true
SECURE_HSTS_ENABLED=true
```

## 🚨 Security Considerations

### 1. Network Security

#### Firewall Configuration
```bash
# Allow only necessary ports
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP (redirect to HTTPS)
sudo ufw allow 443/tcp     # HTTPS
sudo ufw deny 5000/tcp     # Block direct backend access
sudo ufw deny 8080/tcp     # Block direct frontend access
```

#### Reverse Proxy (Recommended)
Use nginx or similar for production:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. Authentication & Authorization

#### Basic Authentication (nginx)
```nginx
location / {
    auth_basic "GPU Monitor";
    auth_basic_user_file /etc/nginx/.htpasswd;
    proxy_pass http://localhost:8080;
}
```

#### OAuth Integration (Recommended)
Consider integrating with OAuth providers for production:
- Google OAuth
- GitHub OAuth
- Corporate SSO/SAML

### 3. Data Security

#### Host Data Protection
- Host configurations stored in localStorage (client-side)
- No sensitive data transmitted or stored on server
- URLs validated before storage

#### GPU Data Exposure
- GPU metrics are system information, not user data
- Consider access restrictions for sensitive environments
- Implement IP allowlisting for internal networks

## 🔒 Deployment Security

### 1. Docker Security

#### Dockerfile Best Practices
```dockerfile
# Use non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# Minimal base images
FROM node:18-alpine AS production

# Security scanning
RUN npm audit --audit-level=moderate
```

#### Docker Compose Security
```yaml
services:
  backend:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
    cap_drop:
      - ALL
    cap_add:
      - CAP_NET_BIND_SERVICE
```

### 2. HTTPS Configuration

#### SSL/TLS Setup
```bash
# Using Let's Encrypt
sudo certbot --nginx -d your-domain.com

# Or generate self-signed for testing
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/gpu-monitor.key \
  -out /etc/ssl/certs/gpu-monitor.crt
```

#### Security Headers
```nginx
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';";
```

### 3. Monitoring & Logging

#### Security Monitoring
```bash
# Log all access attempts
log_format security '$remote_addr - $remote_user [$time_local] '
                   '"$request" $status $body_bytes_sent '
                   '"$http_referer" "$http_user_agent" "$request_time"';

access_log /var/log/nginx/gpu-monitor-security.log security;
```

#### Intrusion Detection
```bash
# Install fail2ban
sudo apt install fail2ban

# Configure for nginx
sudo nano /etc/fail2ban/jail.local
```

## 🚫 Security Vulnerabilities to Avoid

### 1. Common Mistakes
- ❌ Hardcoding API keys or passwords in source code
- ❌ Using default passwords or weak secrets
- ❌ Exposing backend ports directly to internet
- ❌ Running containers as root user
- ❌ Disabling CORS without understanding implications

### 2. Sensitive Information Exposure
- ❌ Logging sensitive data (passwords, tokens)
- ❌ Returning detailed error messages to clients
- ❌ Exposing internal file paths or system information
- ❌ Including debug information in production builds

## 📋 Security Checklist

### Pre-Deployment
- [ ] All default passwords changed
- [ ] Environment variables configured properly
- [ ] CORS origins restricted to trusted domains
- [ ] Debug mode disabled in production
- [ ] Strong secret keys generated
- [ ] Input validation implemented
- [ ] Error handling sanitized

### Network Security
- [ ] Firewall configured to block unnecessary ports
- [ ] HTTPS enabled with valid certificates
- [ ] Reverse proxy configured (if applicable)
- [ ] Internal network segmentation implemented
- [ ] VPN access configured for remote monitoring

### Infrastructure
- [ ] Containers running as non-root users
- [ ] Security scanning performed on images
- [ ] Regular updates scheduled for dependencies
- [ ] Backup and recovery procedures tested
- [ ] Monitoring and alerting configured

### Access Control
- [ ] Authentication mechanism implemented
- [ ] User access levels defined
- [ ] Regular access reviews scheduled
- [ ] Session management configured
- [ ] Password policies enforced

## 🆘 Incident Response

### Security Incident Procedure
1. **Immediate Response**
   - Isolate affected systems
   - Preserve evidence and logs
   - Document timeline of events

2. **Assessment**
   - Determine scope of compromise
   - Identify affected data/systems
   - Assess potential impact

3. **Containment**
   - Stop ongoing attack
   - Patch vulnerabilities
   - Reset compromised credentials

4. **Recovery**
   - Restore from clean backups
   - Verify system integrity
   - Monitor for reinfection

5. **Lessons Learned**
   - Document incident details
   - Update security procedures
   - Implement additional controls

### Emergency Contacts
- IT Security Team: [contact-info]
- System Administrator: [contact-info]
- Incident Response Lead: [contact-info]

## 🔄 Security Updates

### Dependency Management
```bash
# Frontend dependencies
npm audit
npm audit fix

# Backend dependencies
pip-audit
safety check

# Docker image scanning
docker scout cves
```

### Update Schedule
- **Critical Patches**: Within 24 hours
- **Security Updates**: Within 1 week
- **Regular Updates**: Monthly maintenance window
- **Dependency Audit**: Weekly automated scans

## 📚 Additional Resources

### Security Standards
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [CIS Controls](https://www.cisecurity.org/controls/)

### Security Tools
- **Vulnerability Scanning**: Nessus, OpenVAS, Qualys
- **Container Security**: Clair, Anchore, Twistlock
- **Web Application Scanning**: OWASP ZAP, Burp Suite
- **Dependency Checking**: Snyk, WhiteSource, FOSSA

### Documentation
- [Flask Security Best Practices](https://flask.palletsprojects.com/en/2.0.x/security/)
- [React Security Guidelines](https://react.dev/learn/keeping-components-pure#side-effects-unintended-consequences)
- [Docker Security Best Practices](https://docs.docker.com/develop/security-best-practices/)

---

**Security is an ongoing process. Regular reviews and updates are essential for maintaining a secure system.**