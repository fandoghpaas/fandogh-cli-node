import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../../base'
import {deleteServiceHistory, getServiceHistories, getServiceList} from '../../../rest'

export default class Delete extends Command {
  static description = 'Delete an existing service deployment history';

  static flags = {
    ...Command.flags,
    ...cli.table.flags(),
    help: flags.help({char: 'h'}),
    service_name: flags.string({char: 'n', description: 'service name'}),
    history_id: flags.string({char: 'i', description: 'service history id'})
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

  async get_service_histories(service_name: string) {
    this.progress.start(chalk.bold.white('Trying to fetch service histories...'));
    let history_list = await getServiceHistories(service_name);
    this.progress.stop();
    if ([...history_list].length === 0) {
      this.progress.warn('You don\'t have any service history');
      return null
    }
    let history_choices = [];
    for (let histoy of history_list) {
      history_choices.push({name: histoy.id})
    }
    let histoy_id_prompt: any = await inquirer.prompt([{
      name: 'history_id',
      message: 'select a service history',
      type: 'list',
      choices: history_choices,
    }]);
    return histoy_id_prompt.history_id
  }

  async run() {
    const {flags} = this.parse(Delete);
    let service_name = flags.service_name || await this.get_services();
    if (service_name === null)
      return;
    let history_id = flags.history_id || await this.get_service_histories(service_name);
    if (history_id === null) {
      return
    }

    let confirm: any = await inquirer.prompt([{
      name: 'confirmed',
      message: chalk.redBright(`You are about to delete a service history with id ${chalk.yellowBright.bold(history_id)}, you cannot undo this action. Are sure?`),
      type: 'confirm',
      default: true,
    }]);
    if (confirm.confirmed) {
      this.progress.start(chalk.bold.white(`Trying to delete history id: ${history_id} of service: ${service_name}...`));
      let response = await deleteServiceHistory(service_name, history_id);
      await this.notifyIfNotFocused('Service Rollback command', `Service ${service_name} rollback history deleted successfully.`);
      this.progress.succeed(response.message)
    }
  }
}
