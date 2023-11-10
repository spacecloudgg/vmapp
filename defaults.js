const child_process = require('child_process');

const originalExec = child_process.exec;

child_process.exec = function(command, options, callback) {
  const defaultOptions = {
    //shell: false,
    //detached: true,
    //stdio: 'ignore',
    windowsHide: true
  };

  if (!callback) {
    callback = options;
    options = defaultOptions;
  }

  options = Object.assign({}, defaultOptions, options);

  //console.log(`Executing command: ${command}`);

  return originalExec(command, options, callback);
};