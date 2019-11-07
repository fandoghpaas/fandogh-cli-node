import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'

import Active from './active'
import List from './list'
import Status from './status'

export default class Index extends Command {
  static description = 'Namespace management commands';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    list: flags.help({char: 'l'})
  };

  async run() {
    cli.log('\nNamespace Commands:');
    let command_choices = [{
      name: `1) fandogh namespace:list => ${chalk.blueBright('list of namespaces')}`
    }, {
      name: `2) fandogh namespace:status => ${chalk.blueBright('status of a namespace')}`
    }, {
      name: `3) fandogh namespace:active => ${chalk.blueBright('activating a namespace')}`
    }];
    let namespace_command: any = await inquirer.prompt([{
      name: 'command',
      message: 'select a command',
      type: 'list',
      choices: command_choices,
    }]);
    switch (namespace_command.command) {
    case `1) fandogh namespace:list => ${chalk.blueBright('list of namespaces')}`:
      await List.run([]);
      break;
    case `2) fandogh namespace:status => ${chalk.blueBright('status of a namespace')}`:
      await Status.run([]);
      break;
    case `3) fandogh namespace:active => ${chalk.blueBright('activating a namespace')}`:
      await Active.run([]);
      break;
    default:
    }
  }
}
