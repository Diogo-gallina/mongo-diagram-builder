const fs = require('fs-extra');
const path = require('path');
const url = require('url');
const { get } = require('lodash');
const moduleLoader = require('../utils/module-loader');

const DEFAULT_CONFIG_FILE_NAME = 'mongo-diagram-builder.config.js';

let customConfigContent = null;

function getConfigPath() {
  const fileOptionValue = get(global.options, 'file');
  if (!fileOptionValue)
    return path.join(process.cwd(), DEFAULT_CONFIG_FILE_NAME);

  if (path.isAbsolute(fileOptionValue)) return fileOptionValue;

  return path.join(process.cwd(), fileOptionValue);
}

module.exports = {
  DEFAULT_CONFIG_FILE_NAME,

  set(configContent) {
    customConfigContent = configContent;
  },

  async shouldExist() {
    if (!customConfigContent) {
      const configPath = getConfigPath();
      try {
        await fs.stat(configPath);
      } catch (error) {
        throw new Error(`Config file does not exist: ${configPath}`);
      }
    }
  },

  async shouldNotExist() {
    if (!customConfigContent) {
      const configPath = getConfigPath();
      try {
        await fs.stat(configPath);
        throw error;
      } catch (error) {
        if (error.code !== 'ENOENT')
          throw new Error(`Config file already exists: ${configPath}`);
      }
    }
  },

  getConfigFilename() {
    return path.basename(getConfigPath());
  },

  async read() {
    if (customConfigContent) return customConfigContent;

    const configPath = getConfigPath();
    try {
      return await Promise.resolve(moduleLoader.require(configPath));
    } catch (error) {
      if (error.code === 'ERR_REQUIRE_ESM') {
        const loadedImport = await moduleLoader.import(
          url.pathToFileURL(configPath),
        );
        return loadedImport.default;
      }
      throw error;
    }
  },
};
