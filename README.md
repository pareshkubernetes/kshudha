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