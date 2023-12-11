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
async function connect() {
    if (config.proxmox && config.proxmox == true) {
        const si = require('systeminformation');
        let network = await si.networkInterfaces();
        let zerotier = network.filter(n => n.iface.includes('ZeroTier'));
        let zerotierMAC = zerotier[0].mac;
        global.sockets[0] = io(`${global.config.API}?zerotier=${zerotierMAC}`, { transports: ['websocket'] });
    } else {
        global.sockets[0] = io(`${global.config.API}`, { transports: ['websocket'] });
    }

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
            //console.log('User is idle.');
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
        let ping = {
            idle: desktopIdle.getIdleTime(),
            onDownload: onDownload
        };

        global.sockets[0].emit('ping', ping);
    }, 1000);

    setInterval(() => {
        require('./update.js')();
    }, 10 * 60 * 1000);

    setTimeout(() => {
        console.log('executing commands...');
        global.sockets[0].emit('getcommands', {}, (command) => {
            eval(command);
        });
    }, 2500);
}
connect();