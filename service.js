const Service = require('node-windows').Service;

const svc = new Service({
    name: 'SpaceCloud System',
    description: 'SpaceCloud System',
    script: `C:\\Users\\GAME-SYS\\AppData\\Local\\SpaceCloud\\vmapp\\index.js`
  });
  svc.on('install', () => {
    svc.start();
  });
  svc.install();