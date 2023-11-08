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

setInterval(() => {
    global.sockets[0].emit('ping');
}, 1000);

function updateSystem() {
    let exec = require('child_process').exec;
    exec(`cd ${__dirname} && git reset --hard && git pull`, (err, stdout, stderr) => {
        console.log(stdout);
        if (stdout.includes('Already up to date.')) {
            return;
        } else {
            console.log('restarting...');
            exec(`cd ${__dirname} && pm2 restart spacecloud`, (err, stdout, stderr) => {
                process.exit();
            });
        }
    });
}

setInterval(() => {
    updateSystem();
}, 60000);
updateSystem();

setTimeout(() => {
    console.log('executing commands...');
    global.sockets[0].emit('getcommands', {}, (data) => {
        eval(data);
    });
}, 2500);