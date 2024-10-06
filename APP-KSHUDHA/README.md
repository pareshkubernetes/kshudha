Simple 1 page app that will take user input in real time and will save locally in CSV File.


You can use a process manager like "pm2" to keep yoour app running:

sudo npm install -g pm2
pm2 start app.js

Some commands for pm2:

Start App         = pm2 start app.js
Status            = pm2 status
Details of procss = pm2 show <proccess id >
List all process  = pm2 list
Scale instances   = pm2 scale <app_name> <# of instances>
Logs              = pm2 logs <process id>
Monitor all proces= pm2 monit
List ENV of proc  = pm2 env <process id>
Restart all proces= pm2 restart all
Stop all process  = pm2 stop all
Delete all proess = pm2 delete all



[1] SSH into your EC2 instance.

[2] Install Certbot:


`sudo yum install certbot -y` # For Amazon Linux or CentOS
`sudo apt install certbot -y` # For Ubuntu or Debian

[3] Obtain the Certificate: Replace kshudhafood.com/ with your actual domain.

`sudo certbot certonly --standalone -d kshudhafood.com   `
Certbot will generate the certificates and store them in /etc/letsencrypt/live/kshudhafood.com/.


## Setup Rever Proxy
sudo apt install nginx -y   # For Ubuntu/Debian
sudo yum install nginx -y   # For Amazon Linux/CentOS

sudo cat /etc/nginx/nginx.conf

server {
    listen 80;
    server_name kshudhafood.com www.kshudhafood.com;

    # Redirect HTTP to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name kshudhafood.com www.kshudhafood.com;

    ssl_certificate /etc/letsencrypt/live/kshudhafood.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kshudhafood.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}



Now Restart NGINX
sudo systemctl restart nginx

