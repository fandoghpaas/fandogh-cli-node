import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'

import Deploy from './deploy'
import Help from './help'

export default class Index extends Command {
  static description = 'Managed-Service management commands';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    list: flags.help({char: 'l'})
  };

  async run() {
    cli.log('\nManaged Service Commands:');
    let command_choices = [{
      name: `1) fandogh managed_service:deploy => ${chalk.blueBright('deploy a managed service')}`
    }, {
      name: `2) fandogh managed_service:help => ${chalk.blueBright('managed service help')}`
    }];
    let managed_service_command: any = await inquirer.prompt([{
      name: 'command',
      message: 'select a command',
      type: 'list',
      choices: command_choices,
    }]);
    switch (managed_service_command.command) {
    case `1) fandogh managed_service:deploy => ${chalk.blueBright('deploy a managed service')}`:
      await Deploy.run([]);
      break;
    case `2) fandogh managed_service:help => ${chalk.blueBright('managed service help')}`:
      await Help.run([]);
      break;
    default:
    }
  }
}
