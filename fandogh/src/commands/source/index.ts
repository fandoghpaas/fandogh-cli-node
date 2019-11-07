import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import Init from './init'
import Run from './run'

export default class Index extends Command {
  static description = 'Source management commands';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    list: flags.help({char: 'l'})
  };

  async run() {
    cli.log('\nSource Commands:');
    let command_choices = [{
      name: `1) fandogh source:init => ${chalk.blueBright('initializing new source')}`
    }, {
      name: `2) fandogh source:run => ${chalk.blueBright('deploying new source')}`
    }];
    let namespace_command: any = await inquirer.prompt([{
      name: 'command',
      message: 'select a command',
      type: 'list',
      choices: command_choices,
    }]);
    switch (namespace_command.command) {
    case `1) fandogh source:init => ${chalk.blueBright('initializing new source')}`:
      await Init.run([]);
      break;
    case `2) fandogh source:run => ${chalk.blueBright('deploying new source')}`:
      await Run.run([]);
      break;
    default:
    }
  }
}
