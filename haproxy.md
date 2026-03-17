# HAProxy Documentation

## Introduction

HAProxy (High Availability Proxy) is a free, open-source software that provides a high availability load balancer and proxy server for TCP and HTTP-based applications. It is particularly suited for high traffic websites and powers many of the world's most visited ones.

## Installation and Setup

### Installing HAProxy

#### On Ubuntu/Debian

using default version

```bash
sudo apt update
sudo apt install haproxy
```
Use specific version (LTS version 3.2)

```bash
apt-get install --no-install-recommends software-properties-common
add-apt-repository ppa:vbernat/haproxy-3.2
apt-get install haproxy=3.2.\*
```


#### On CentOS/RHEL
```bash
sudo yum install haproxy
# or for newer versions
sudo dnf install haproxy
```

#### On macOS (using Homebrew)
```bash
brew install haproxy
```

### Basic Configuration

HAProxy configuration is stored in `/etc/haproxy/haproxy.cfg`. The configuration file consists of several sections:

- **global**: Global configuration parameters
- **defaults**: Default parameters for all other sections
- **frontend**: Defines how requests are forwarded to backends
- **backend**: Defines server pools
- **listen**: Combines frontend and backend in one section

### Starting and Managing HAProxy

```bash
# Start HAProxy
sudo systemctl start haproxy

# Enable HAProxy to start on boot
sudo systemctl enable haproxy

# Check status
sudo systemctl status haproxy

# Reload configuration (without restarting)
sudo systemctl reload haproxy

# Restart HAProxy
sudo systemctl restart haproxy
```

## Usage Examples

### Basic HTTP Load Balancing

```cfg
global
    log /dev/log local0
    log /dev/log local1 notice
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin expose-fd listeners
    stats timeout 30s
    user haproxy
    group haproxy
    daemon

defaults
    log global
    mode http
    option httplog
    option dontlognull
    timeout connect 5000
    timeout client 50000
    timeout server 50000

frontend http_front
    bind *:80
    default_backend http_back

backend http_back
    balance roundrobin
    server web1 192.168.1.10:80 check
    server web2 192.168.1.11:80 check
    server web3 192.168.1.12:80 check
```

### TCP Load Balancing (Database)

```cfg
listen mysql
    bind *:3306
    mode tcp
    option mysql-check user haproxy_check
    balance roundrobin
    server mysql1 192.168.1.20:3306 check
    server mysql2 192.168.1.21:3306 check
    server mysql3 192.168.1.22:3306 check
```

### HTTPS Termination

```cfg
frontend https_front
    bind *:443 ssl crt /etc/ssl/certs/haproxy.pem
    mode http
    default_backend http_back

backend http_back
    balance roundrobin
    server web1 192.168.1.10:80 check
    server web2 192.168.1.11:80 check
```

### WebSocket Support

```cfg
frontend ws_front
    bind *:80
    default_backend ws_back

backend ws_back
    balance roundrobin
    option forwardfor
    cookie SERVERID insert indirect nocache
    server ws1 192.168.1.10:8080 check cookie ws1
    server ws2 192.168.1.11:8080 check cookie ws2
```

### Rate Limiting

```cfg
frontend http_front
    bind *:80
    stick-table type ip size 100k expire 30s store gpc0
    tcp-request connection track-sc0 src
    tcp-request connection reject if { sc0_gpc0 gt 10 }
    default_backend http_back
```

## SSL Management

### SSL Certificate Installation

#### Single Certificate
```bash
# Combine certificate and private key
cat server.crt server.key > /etc/ssl/certs/haproxy.pem
chmod 600 /etc/ssl/certs/haproxy.pem
```

#### Multiple Certificates (SNI)
```cfg
frontend https_front
    bind *:443 ssl crt /etc/ssl/certs/
    mode http
```

Place certificates in `/etc/ssl/certs/` with names like `example.com.pem`

### SSL Offloading

```cfg
frontend https_front
    bind *:443 ssl crt /etc/ssl/certs/haproxy.pem
    mode http
    option forwardfor
    reqadd X-Forwarded-Proto:\ https
    default_backend http_back

backend http_back
    balance roundrobin
    server web1 192.168.1.10:80 check
    server web2 192.168.1.11:80 check
```

### SSL Bridging (End-to-End Encryption)

```cfg
frontend https_front
    bind *:443 ssl crt /etc/ssl/certs/haproxy.pem
    mode tcp
    default_backend https_back

backend https_back
    mode tcp
    balance roundrobin
    server web1 192.168.1.10:443 check
    server web2 192.168.1.11:443 check
```

### Let's Encrypt Integration

```bash
# Install certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d example.com

# Create combined certificate for HAProxy
sudo cat /etc/letsencrypt/live/example.com/fullchain.pem /etc/letsencrypt/live/example.com/privkey.pem > /etc/ssl/certs/example.com.pem

# Reload HAProxy
sudo systemctl reload haproxy
```

### OCSP Stapling

```cfg
frontend https_front
    bind *:443 ssl crt /etc/ssl/certs/haproxy.pem ca-file /etc/ssl/certs/ca.pem
    mode http
```

## Failover Configuration

### Active-Passive Failover

```cfg
frontend http_front
    bind *:80
    default_backend http_back

backend http_back
    balance roundrobin
    option httpchk GET /health
    server primary 192.168.1.10:80 check inter 1000 rise 2 fall 3
    server backup 192.168.1.11:80 check inter 1000 rise 2 fall 3 backup
```

### Active-Active with Health Checks

```cfg
backend http_back
    balance roundrobin
    option httpchk GET /health
    http-check expect status 200
    server web1 192.168.1.10:80 check inter 3000 rise 2 fall 3
    server web2 192.168.1.11:80 check inter 3000 rise 2 fall 3
    server web3 192.168.1.12:80 check inter 3000 rise 2 fall 3
```

### Database Failover

```cfg
listen mysql_cluster
    bind *:3306
    mode tcp
    option mysql-check user haproxy
    balance roundrobin
    server mysql-master 192.168.1.20:3306 check
    server mysql-slave1 192.168.1.21:3306 check backup
    server mysql-slave2 192.168.1.22:3306 check backup
```

### Multi-Datacenter Failover

```cfg
backend geo_back
    balance roundrobin
    option httpchk GET /health
    server dc1-web1 10.0.1.10:80 check inter 5000 rise 1 fall 1
    server dc1-web2 10.0.1.11:80 check inter 5000 rise 1 fall 1
    server dc2-web1 10.0.2.10:80 check inter 5000 rise 1 fall 1 backup
    server dc2-web2 10.0.2.11:80 check inter 5000 rise 1 fall 1 backup
```

## Dashboard and Monitoring

### Built-in Statistics Page

Enable the statistics page in your configuration:

```cfg
listen stats
    bind *:8080
    mode http
    stats enable
    stats uri /stats
    stats refresh 10s
    stats admin if TRUE
    stats auth admin:password
```

Access the dashboard at `http://your-server:8080/stats`

### Prometheus Metrics

```cfg
global
    stats socket /var/run/haproxy.sock mode 600 level admin

# In your haproxy.cfg
listen prometheus
    bind *:8404
    mode http
    http-request use-service prometheus-exporter if { path /metrics }
    no log
```

### Custom Monitoring Script

```bash
#!/bin/bash
# Check HAProxy status
curl -s http://localhost:8080/stats | grep -E "(frontend|backend)" | awk '{print $1,$2,$18,$19,$20}'
```

### Log Monitoring

Configure logging:

```cfg
global
    log 127.0.0.1 local0
    log 127.0.0.1 local1 notice

# In /etc/rsyslog.d/haproxy.conf
local0.* /var/log/haproxy.log
local1.* /var/log/haproxy-status.log
```

## Advanced Configuration

### ACLs and Routing

```cfg
frontend http_front
    bind *:80
    acl is_api path_beg /api/
    acl is_admin path_beg /admin/
    use_backend api_back if is_api
    use_backend admin_back if is_admin
    default_backend web_back

backend api_back
    balance roundrobin
    server api1 192.168.1.15:8080 check

backend admin_back
    balance roundrobin
    server admin1 192.168.1.16:8080 check

backend web_back
    balance roundrobin
    server web1 192.168.1.10:80 check
    server web2 192.168.1.11:80 check
```

### Sticky Sessions

```cfg
backend app_back
    balance roundrobin
    cookie SERVERID insert indirect nocache
    server app1 192.168.1.10:8080 check cookie app1
    server app2 192.168.1.11:8080 check cookie app2
```

### Compression

```cfg
frontend http_front
    bind *:80
    compression algo gzip
    compression type text/html text/plain text/css application/javascript
    default_backend http_back
```

### Security Headers

```cfg
frontend http_front
    bind *:80
    rspadd X-Frame-Options:\ DENY
    rspadd X-Content-Type-Options:\ nosniff
    rspadd X-XSS-Protection:\ 1;mode=block
    default_backend http_back
```

## Troubleshooting

### Common Issues

1. **HAProxy not starting**
   - Check configuration syntax: `haproxy -c -f /etc/haproxy/haproxy.cfg`
   - Check logs: `journalctl -u haproxy`

2. **Backend servers marked as down**
   - Verify health check endpoints
   - Check network connectivity
   - Review server logs

3. **SSL certificate issues**
   - Verify certificate format (PEM)
   - Check certificate validity
   - Ensure proper permissions

4. **Performance issues**
   - Monitor CPU and memory usage
   - Check connection limits
   - Review timeout settings

### Useful Commands

```bash
# Validate configuration
haproxy -c -f /etc/haproxy/haproxy.cfg

# Test configuration with verbose output
haproxy -c -f /etc/haproxy/haproxy.cfg -V

# Show HAProxy version
haproxy -v

# Runtime statistics
echo "show stat" | socat /var/run/haproxy.sock stdio

# Enable/disable server
echo "enable server backend/server1" | socat /var/run/haproxy.sock stdio
echo "disable server backend/server1" | socat /var/run/haproxy.sock stdio
```

## Best Practices

1. **Security**
   - Run HAProxy as non-root user
   - Use minimal required permissions
   - Keep software updated
   - Implement proper firewall rules

2. **Performance**
   - Use appropriate balance algorithms
   - Configure connection limits
   - Enable compression
   - Monitor resource usage

3. **Monitoring**
   - Set up comprehensive logging
   - Configure alerts for failures
   - Monitor backend health
   - Track performance metrics

4. **High Availability**
   - Use multiple HAProxy instances
   - Implement proper failover
   - Regular backup of configurations
   - Test failover scenarios
