import Generator from 'yeoman-generator';
import fs from 'fs';
import path from 'path';
import { generateAttributes } from './scripts/generate-custom-attribute.js';
import { translateAttr } from './scripts/translate-attr.js';
import { generateDynamicAttribute } from './scripts/generate-attr-dynamic-component.js';
import { addPropToTSFiles } from './scripts/add-custom-prop.js';

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

    this.configObject = {};
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

  async prompting() {
    this.answers = await this.prompt([
      {
        type: 'checkbox',
        name: 'steps',
        message: 'Which steps would you like to run?',
        choices: [
          { name: 'Generate Attributes', value: 'generateAttributes' },
          { name: 'Translate Attributes', value: 'translateAttr' },
          { name: 'Generate Dynamic Attributes', value: 'generateDynamicAttribute' },
        ],
      },
    ]);
  }

  async writing() {
    const steps = this.answers.steps;

    if (steps.includes('generateAttributes')) {
      try {
        this.configObject.yoConfig["generator-cypress:0.0.1"].templateFolder.forEach(templateFolderPath => {
          generateAttributes(templateFolderPath);
        });
      } catch (err) {
        this.log('Error when reading template folder path');
      }
    }

    if (steps.includes('translateAttr')) {
      try {
        this.configObject.yoConfig["generator-cypress:0.0.1"].templateFolder.forEach(templateFolderPath => {
          translateAttr(templateFolderPath, this.configObject.yoConfig["generator-cypress:0.0.1"].translateJsonOutput);
        });
      } catch (err) {
        this.log('Error when translating attributes');
        this.log(err);
      }
    }

    if (steps.includes('generateDynamicAttribute')) {
      try {
        this.configObject.yoConfig["generator-cypress:0.0.1"].dynamicComponentsFolder.forEach(templateFolderPath => {
          generateDynamicAttribute(templateFolderPath);
        });
      } catch (err) {
        this.log('Error when generate dynamic component');
      }

      try {
        this.configObject.yoConfig["generator-cypress:0.0.1"].dynamicComponentsFolderScript.forEach(templateFolderPath => {
          addPropToTSFiles(templateFolderPath);
        });
      } catch (err) {
        this.log('Error when generate dynamic component');
      }
    }
  }

  end() {
    this.log('File processing complete.');
  }
}
