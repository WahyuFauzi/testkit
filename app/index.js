import Generator from 'yeoman-generator';
import fs from 'fs';
import path from 'path';
import { generateAttributes } from './scripts/generate-custom-attribute.js';

export default class extends Generator {
  configObject = {};
  constructor(args, opts) {
    super(args, opts);
    this.argument('dirPath', {
      type: String,
      required: false,
      default: './',
      desc: 'Directory path to look for yoConfig.json',
    });

    this.configObject = {}; // Initialize configObject
    this.configObject.rootDir = this.options.dirPath;

    const yoConfigPath = path.join(this.configObject.rootDir, '.yo-rc-testing.json');

    try {
      fs.accessSync(yoConfigPath, fs.constants.F_OK);
      this.log(`Found yoConfig.json in ${yoConfigPath}. Processing it...`);

      const data = fs.readFileSync(yoConfigPath, 'utf-8');
      try {
        const yoConfig = JSON.parse(data);
        this.configObject.yoConfig = yoConfig;
        this.log('yoConfig.json successfully parsed.');
      } catch (parseErr) {
        this.log(`Error parsing yoConfig.json: ${parseErr.message}`);
      }
    } catch (err) {
      this.log(`No yoConfig.json file found in ${yoConfigPath}`);
    }
  }

  async writing() {
    try {
      this.configObject.yoConfig["generator-cypress:0.0.1"].templateFolder.forEach(path => {
        generateAttributes(path);
      })
    } catch (err) {
      this.log('Error when reading template folder path');
    }
  }

  end() {
    this.log('File processing complete.');
  }
}
