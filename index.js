require('./defaults.js');
async function startSystem() {
    let update = await require('./update.js')();
    if (update) {
        return;
    } else {
        try {
            require('./system.js');
        } catch(e) {
            console.log(e);
            if (e.code === 'MODULE_NOT_FOUND') {
                let exec = require('child_process').exec;
                exec(`cd ${__dirname} && npm install`, (err, stdout, stderr) => {
                    console.log(stdout);
                    console.log('restarting');
                    process.exit();
                });
            }
        }   
    }
};
startSystem();