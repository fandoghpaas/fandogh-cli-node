import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import {getServiceList, getServiceLogs} from '../../rest'

export default class Logs extends Command {
  static description = 'Fetch logs of an existing service';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    service_name: flags.string({char: 'n', description: 'service name'}),
    follow: flags.boolean({char: 'f', default: false, description: 'Monitoring service real-time logs'}),
    max: flags.integer({char: 'm', name: 'max_logs', description: 'max log count from 100 to 2000', default: 100})
  };

  async get_services() {
    this.progress.start(chalk.bold.white('Trying to fetch namespace services...'));
    let service_list = await getServiceList();
    this.progress.stop().clear();
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
    const {flags} = this.parse(Logs);
    let service_name = flags.service_name || await this.get_services();
    let follow = flags.follow;
    let max_logs = flags.max;
    if (service_name === null)
      return;

    let last_logged_time = 0;
    while (true) {
      this.progress.start(`Trying to log service: ${service_name}`);
      let logs_response: any = await getServiceLogs(service_name, last_logged_time, max_logs);
      await this.notifyIfNotFocused('Service command', `Service ${service_name} logs fetched.`);
      this.progress.stop();

      if (logs_response['logs']) {
        (logs_response['logs'] as string).split('\n').forEach(function (log: string) {
          let temp = log.split('->', 2);
          cli.log(chalk.white(temp[0] + ' -> ').concat(temp[1]))
        })
      }

      if (follow) {
        last_logged_time = logs_response['last_logged_time']
      }

      if (!follow) {
        break
      }
      await cli.wait(3000)
    }
  }
}
