import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'

import Add from './add'
import Delete from './delete'
import List from './list'

export default class Index extends Command {
  static description = 'Volume management commands';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    list: flags.help({char: 'l'})
  };

  async run() {
    cli.log('\nImage Commands:');
    let command_choices = [{
      name: `1) fandogh volume:list => ${chalk.blueBright('list of volumes')}`
    },
      {
        name: `2) fandogh volume:add => ${chalk.blueBright('create a new volume')}`
      },
      {
        name: `3) fandogh volume:delete => ${chalk.blueBright('delete a specific volume')}`
      }];
    let volume_command: any = await inquirer.prompt([{
      name: 'command',
      message: 'select a command',
      type: 'list',
      choices: command_choices,
    }]);
    switch (volume_command.command) {
    case `1) fandogh volume:list => ${chalk.blueBright('list of volumes')}`:
      await List.run([]);
      break;
    case `2) fandogh volume:add => ${chalk.blueBright('create new volumes')}`:
      await Add.run([]);
      break;
    case `3) fandogh volume:delete => ${chalk.blueBright('delete a specific volume')}`:
      await Delete.run([]);
      break;
    default:
    }
  }
}
