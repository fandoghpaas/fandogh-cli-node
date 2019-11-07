import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../../base'
import Delete from './delete'
import List from './list'

export default class Index extends Command {
  static description = 'Service history management commands';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    list: flags.help({char: 'l'})
  };

  async run() {
    cli.log('\nService History Commands:');
    let command_choices = [{
      name: `1) fandogh service:history:list => ${chalk.blueBright('list of service histories')}`
    }, {
      name: `2) fandogh service:history:delete => ${chalk.blueBright('delete a service history')}`
    }];
    let volume_command: any = await inquirer.prompt([{
      name: 'command',
      message: 'select a command',
      type: 'list',
      choices: command_choices,
    }]);
    switch (volume_command.command) {
    case `1) fandogh service:history:list => ${chalk.blueBright('list of service histories')}`:
      await List.run([]);
      break;
    case `2) fandogh service:history:delete => ${chalk.blueBright('delete a service history')}`:
      await Delete.run([]);
      break;
    default:
    }
  }
}
