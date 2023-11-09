const child_process = require('child_process');

const originalExec = child_process.exec;

child_process.exec = function(command, options, callback) {
  const defaultOptions = {
    shell: false,
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  };

  options = { ...defaultOptions, ...options };

  return originalExec(command, options, callback);
};