import * as os from 'os'
import * as path from 'path'

const fs = require('fs-extra');
const yaml = require('js-yaml');

export class ConfigRepository {
  static _load_from_file(configuration_file: string): any {
    let config = {};
    try {
      config = yaml.load(fs.readFileSync(configuration_file, 'utf-8')) || {};
      return config
    } catch {
      fs.ensureFileSync(configuration_file);
      return config
    }
  }

  static _load_from_dict(configs: any): any {
    return configs || {}
  }

  configuration_file = '';
  configurations = '';
  configs: { [index: string]: any } = {};

  constructor(configuration_file: string, configurations?: any) {
    if (configuration_file !== null) {
      this.configuration_file = configuration_file;
      let _configurations = ConfigRepository._load_from_file(configuration_file);
      this.configs = ConfigRepository._load_from_dict(_configurations)
    }
    if (configurations !== null) {
      this.configs = ConfigRepository._load_from_dict(configurations)
    }

  }

  get(key: string, def?: any): void {
    return this.configs[key] || def
  }

  set(key: string, value: any, save = true): void {
    this.configs[key] = value;
    if (save) {
      this.save()
    }
  }

  get_dict() {
    return this.configs
  }

  save() {
    if (this.configuration_file !== '') {
      try {
        fs.outputFileSync(this.configuration_file, yaml.dump(this.configs))
      } catch (e) {
        throw e
      }
    }
  }

}

let configRepository: { [key: string]: any } = {};

export function get_project_config(): ConfigRepository {
  if (!configRepository['project']) {
    configRepository['project'] = new ConfigRepository(path.join(process.cwd(), '.fandogh', 'config.yml'), null)
  }
  return configRepository['project']
}

export function get_user_config(): ConfigRepository {
  if (!configRepository['user']) {
    configRepository['user'] = new ConfigRepository(path.join(os.homedir(), '.fandogh', 'credentials.yml'), null)
  }
  return configRepository['user']
}
