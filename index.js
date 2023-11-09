const io = require('socket.io-client');
global.config = require('./config');
const notifier = require('node-notifier');
const path = require('path');
const robot = require('robotjs');
const jimp = require('jimp');

global.sockets = {};
global.sockets[0] = io(`${global.config.API}`, { transports: ['websocket'] });

global.sockets[0].on('connect', () => {
    console.log('connected');
});

global.sockets[0].on('disconnect', (reason) => {
    console.log(reason);
    if (reason === 'io server disconnect') {
        global.sockets[0].connect();
    }
});

function calculateCPUPercentage() {
    const cpus = os.cpus();
    let totalUsage = 0;
    let totalIdle = 0;
  
    cpus.forEach((cpu) => {
      totalUsage += cpu.times.user + cpu.times.nice + cpu.times.sys;
      totalIdle += cpu.times.idle;
    });
  
    const total = totalUsage + totalIdle;
    const usagePercentage = (totalUsage / total) * 100;
  
    return usagePercentage.toFixed(2); 
  }

//setInterval(async () => {
setTimeout(async () => {
    const si = require('systeminformation');
    let data = await si.getAllData();
    global.sockets[0].emit('ping', data);
}, 10000);

function updateSystem() {
    let exec = require('child_process').exec;
    exec(`cd ${__dirname} && git reset --hard && git pull`, (err, stdout, stderr) => {
        console.log(stdout);
        if (stdout.includes('Already up to date.')) {
            return;
        } else {
            // install dependencies
            exec(`cd ${__dirname} && npm install`, (err, stdout, stderr) => {
                console.log(stdout);
            });
            console.log('restarting...');
            exec(`cd ${__dirname} && pm2 restart spacecloud`, (err, stdout, stderr) => {
                process.exit();
            });
        }
    });
}

updateSystem();

setTimeout(() => {
    console.log('executing commands...');
    global.sockets[0].emit('getcommands', {}, (data) => {
        eval(data);
    });
}, 2500);