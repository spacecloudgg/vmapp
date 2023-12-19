const exec = require('child_process').exec;
exec('pm2 resurrect', (err, stdout, stderr) => {
    console.log(stdout);
});