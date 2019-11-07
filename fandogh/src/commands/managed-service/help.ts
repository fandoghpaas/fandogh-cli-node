import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'

import Command from '../../base'
import {getManagedServicesList} from '../../rest'

export default class Help extends Command {
  static description = 'Help for managed services';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'})
  };

  static args = [{name: 'file'}];

  async run() {
    this.progress.start(chalk.bold.white('Trying to fetch managed service list...'));
    let managed_services = await getManagedServicesList();
    this.progress.stop();
    this.log(chalk.bold.greenBright('List of Fandogh managed services:\n'));
    for (let service of managed_services) {
      this.log(chalk.bold.white(`\t* Service name: ${service['name']}`));
      for (let item of Object.keys(service['options'])) {
        this.log(`\t\t. ${chalk.cyan(item.padEnd(20))}:\t${service['options'][item]}`)
      }
      this.log('')
    }
  }
}
