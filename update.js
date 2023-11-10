let exec = require('child_process').exec;
module.exports = async function () {
    console.log('checking for updates');
    await exec(`cd ${__dirname} && git fetch && git status`, async (err, stdout, stderr) => {
        if (stdout.includes('Your branch is up to date with \'origin/main\'.')) {
            console.log('up to date');
            return false;
        } else {
            console.log('new version found');
            await exec(`cd ${__dirname} && git reset --hard && git pull`, async (err, stdout, stderr) => {
                console.log(stdout);
                if (stdout.includes('Already up to date.')) {
                    console.log('up to date');
                    return false;
                } else {
                    console.log('new version found');
                    await exec(`cd ${__dirname} && npm install`, async (err, stdout, stderr) => {
                        console.log(stdout);
                        console.log('restarting');
                        await process.exit();
                        return true;
                    });
                }
            });
        }
    });
}