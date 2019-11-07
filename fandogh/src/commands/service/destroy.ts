import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import {destroyService, getServiceList} from '../../rest'

export default class Destroy extends Command {
  static description = 'Destroy an existing service';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
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
    const {flags} = this.parse(Destroy);

    let service_name = flags.service_name || await this.get_services();
    if (service_name === null)
      return;
    let confirm: any = await inquirer.prompt([{
      name: 'confirmed',
      message: chalk.redBright(`Are you sure you want to delete service: ${service_name}?`),
      type: 'confirm',
      default: true,
    }]);

    if (confirm.confirmed) {
      this.progress.start(`Trying to delete service: ${chalk.magentaBright(service_name)}`);
      let response = await destroyService(service_name);
      this.progress.succeed(response.message);
      await this.notifyIfNotFocused('Service command', `Service ${service_name} deleted successfully.`)
    }
  }
}
