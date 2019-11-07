import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import Create from './create'
import Delete from './delete'

import List from './list'
import Put from './put'

export default class Index extends Command {
  static description = 'Secret management commands';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    list: flags.help({char: 'l'})
  };

  async run() {
    cli.log('\nNamespace Commands:');
    let command_choices = [{
      name: `1) fandogh secret:list => ${chalk.blueBright('list of secrets')}`
    }, {
      name: `2) fandogh secret:put => ${chalk.blueBright('edit an existing secret')}`
    }, {
      name: `3) fandogh secret:delete => ${chalk.blueBright('delete an existing secret')}`
    }, {
      name: `4) fandogh secret:create => ${chalk.blueBright('create new secret')}`
    }];
    let namespace_command: any = await inquirer.prompt([{
      name: 'command',
      message: 'select a command',
      type: 'list',
      choices: command_choices,
    }]);
    switch (namespace_command.command) {
    case `1) fandogh secret:list => ${chalk.blueBright('list of secrets')}`:
      await List.run([]);
      break;
    case `2) fandogh secret:put => ${chalk.blueBright('edit an existing secret')}`:
      await Put.run([]);
      break;
    case `3) fandogh secret:delete => ${chalk.blueBright('delete an existing secret')}`:
      await Delete.run([]);
      break;
    case `4) fandogh secret:create => ${chalk.blueBright('create new secret')}`:
      await Create.run([]);
      break;
    default:
    }
  }
}
