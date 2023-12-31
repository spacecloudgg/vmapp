const Service = require('node-windows').Service;
//C:\Users\GAME-SYS\AppData\Local\SpaceCloud\vmapp\index.js
const path = require('path');

const svc = new Service({
    name: 'SpaceCloud System',
    description: 'SpaceCloud System',
    script: path.join(__dirname, 'resurrect.js')
});
svc.on('install', () => {
    svc.start();
});
svc.install();

//uninstall
/*svc.on('uninstall', () => {
    console.log('Uninstall complete.');
    console.log('The service exists: ', svc.exists);
});

svc.uninstall();*/