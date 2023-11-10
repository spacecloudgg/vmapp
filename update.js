let exec = require('child_process').exec;
module.exports = async function () {
    return new Promise((resolve, reject) => {
        console.log('checking for updates');
        exec(`cd ${__dirname} && git fetch && git status`, (err, stdout, stderr) => {
            if (stdout.includes('Your branch is up to date with \'origin/main\'.')) {
                console.log('up to date');
                resolve(false);
            } else {
                console.log('new version found');
                exec(`cd ${__dirname} && git reset --hard && git pull`, (err, stdout, stderr) => {
                    console.log(stdout);
                    if (stdout.includes('Already up to date.')) {
                        console.log('up to date');
                        resolve(false);
                    } else {
                        console.log('new version found');
                        exec(`cd ${__dirname} && npm install`, (err, stdout, stderr) => {
                            console.log(stdout);
                            console.log('restarting');
                            process.exit();
                            resolve(true);
                        });
                    }
                });
            }
        });
    });
}