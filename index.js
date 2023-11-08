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

// auto update from github if version is different
setInterval(() => {
    //global.sockets[0].emit('checkversion', (data) => {
        let data = { version: '1.0.1' };
        if (data.version !== config.VERSION) {
            // update folder and restart pm2
            let exec = require('child_process').exec;
            exec(`cd ${__dirname} && git pull`, (err, stdout, stderr) => {
                if (err) {
                    console.log(err);
                }
                console.log(stdout);
            });
        }
    //});
});