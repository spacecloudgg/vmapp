const Service = require('node-windows').Service;
//C:\Users\GAME-SYS\AppData\Local\SpaceCloud\vmapp\index.js

const svc = new Service({
    name: 'SpaceCloud System',
    description: 'SpaceCloud System',
    script: 'C:\\Users\\GAME-SYS\\AppData\\Local\\SpaceCloud\\vmapp\\resurrect.js',
  });
  svc.on('install', () => {
    svc.start();
  });
  svc.install();