const io = require('socket.io-client');
const config = require('./config');
const robot = require('robotjs');
const jimp = require('jimp');
const notifier = require('node-notifier');
const path = require('path');

global.sockets = {};
global.sockets[0] = io(`${config.API}`, { transports: ['websocket'] });

global.sockets[0].on('connect', () => {
    console.log('connected');
});

global.sockets[0].on('disconnect', (reason) => {
    console.log(reason);
    if (reason === 'io server disconnect') {
        global.sockets[0].connect();
    }
});

setInterval(() => {
    global.sockets[0].emit('ping');
}, 1000);

setTimeout(() => {
    let exec = require('child_process').exec;
    // && pm2 restart spacecloud
    exec(`cd ${__dirname} && git pull`, (err, stdout, stderr) => {
        console.log(stdout);
        if (stdout.includes('Already up to date.')) {
            return;
        }
    });
}, 2000);
