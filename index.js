require('./defaults.js');
global.config = require('./config');
const exec = require('child_process').exec;
async function startSystem() {
    let update = await require('./update.js')();
    if (update) {
        return;
    } else {
        try {
            if (global.config?.vpn) {
                let vpndata = global.config.vpn;
                await disconnectVPN(vpndata.name);
                await connectVPN(vpndata.name, vpndata.username, vpndata.password);
                require('./system.js');
                reconnectLoop(vpndata.name, vpndata.username, vpndata.password);
            } else {
                require('./system.js');
            }            
        } catch (e) {
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

async function disconnectVPN(vpnName) {
    return new Promise(resolve => {
        exec(`rasdial ${vpnName} /disconnect`, (error, stdout, stderr) => {
            setTimeout(() => {
                resolve();
            }, 5000);
        });
    });
}

async function connectVPN(vpnName, vpnUsername, vpnPassword) {
    return new Promise(resolve => {
        exec(`rasdial ${vpnName} ${vpnUsername} ${vpnPassword}`, (error, stdout, stderr) => {
            if (error) {
                console.log('VPN Connection Failed');
            } else {
                console.log('VPN Connection Successful');
            }
            resolve();
        });
    });
}

async function reconnectLoop(vpnName, vpnUsername, vpnPassword) {
    while (true) {
        exec(`rasdial ${vpnName} ${vpnUsername} ${vpnPassword}`, (error, stdout, stderr) => {
            if (stdout.includes('J� est� conectado') || stdout.includes('Already connected')) {
                //console.log('Já está conectado');
            } else {
                console.log('Reconectando VPN');
                if (error) {
                    console.log('VPN Connection Failed');
                } else {
                    console.log('VPN Connection Successful');
                }
            }
        });

        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}
