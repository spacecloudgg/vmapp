let exec = require('child_process').exec;
module.exports = function () {
    console.log('checking for updates');

    //check if git has a new version
    exec(`cd ${__dirname} && git fetch && git status`, (err, stdout, stderr) => {
        if (stdout.includes('Your branch is up to date with \'origin/master\'.')) {
            console.log('up to date');
        } else {
            console.log('new version found');
            exec(`cd ${__dirname} && git reset --hard && git pull`, (err, stdout, stderr) => {
                console.log(stdout);
                if (stdout.includes('Already up to date.')) {
                    console.log('up to date');
                } else {
                    console.log('new version found');
                    exec(`cd ${__dirname} && npm install`, (err, stdout, stderr) => {
                        console.log(stdout);
                        console.log('restarting');
                        process.exit();
                    });
                }
            });
        }
    });
}