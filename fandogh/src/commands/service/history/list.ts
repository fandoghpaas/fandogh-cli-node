import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../../base'
import {getServiceHistories, getServiceList} from '../../../rest'
import {convert_datetime} from '../../../utils'

const yaml = require('js-yaml');

export default class List extends Command {
  static description = 'List of an existing service deployment histories';

  static flags = {
    ...Command.flags,
    ...cli.table.flags(),
    help: flags.help({char: 'h'}),
    service_name: flags.string({char: 'n', description: 'service name'})
  };

  async get_services() {
    this.progress.start(chalk.bold.white('Trying to fetch namespace services...'));
    let service_list = await getServiceList();
    this.progress.stop();
    if ([...service_list].length === 0) {
      this.progress.warn('You don\'t have any service in your namespace');
      this.log(`You can create new service using ${chalk.magentaBright('fandogh service:apply')} command`);
      return null
    }
    let service_choices = [];
    for (let service of service_list) {
      service_choices.push({name: service.name})
    }
    let service_name_prompt: any = await inquirer.prompt([{
      name: 'service_name',
      message: 'select a service',
      type: 'list',
      choices: service_choices,
    }]);
    return service_name_prompt.service_name
  }

  async run() {
    const {flags} = this.parse(List);
    let service_name = flags.service_name || await this.get_services();

    if (service_name === null)
      return;

    this.progress.start(chalk.bold.white(`Fetching service: ${service_name} histories...`));
    let service_histories = await getServiceHistories(service_name);
    this.progress.stop();
    cli.table([...service_histories], {
      id: {header: 'History Version  ', get: row => `${row.id}  `},
      name: {header: 'Service Name  ', get: row => `${row.name}  `},
      created_at: {header: 'Date Created  ', get: row => `${convert_datetime(row.created_at)}  `},
      manifest: {header: 'Manifest  ', get: row => `${chalk.white(yaml.safeDump(row.manifest, {flowLevel: -1}))}  `, extended: true},
    }, {
      printLine: this.log,
      ...flags,
    });

    await this.notifyIfNotFocused('Service Rollback command', `Service ${service_name} deployment history list fetched successfully.`)
  }
}
