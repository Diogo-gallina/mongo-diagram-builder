const path = require('path');

function requireModule(modulePath) {
  return require(path.resolve(modulePath));
}

async function importModule(modulePath) {
  return import(path.resolve(modulePath));
}

module.exports = {
  require: requireModule,
  import: importModule,
};
