try {
  const builtin = require('node:electron');
  console.log('node:electron', typeof builtin, Object.keys(builtin));
} catch (error) {
  console.log('node:electron-error', error.message);
}

try {
  const plain = require('electron');
  console.log('electron', typeof plain, plain);
} catch (error) {
  console.log('electron-error', error.message);
}
