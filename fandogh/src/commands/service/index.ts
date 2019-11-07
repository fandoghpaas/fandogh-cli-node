import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import Apply from './apply'
import Destroy from './destroy'
import Details from './details'
import Dump from './dump'

import List from './list'
import Logs from './logs'
import Rollback from './rollback'
import History from './history'

export default class Index extends Command {
  static description = 'Service management commands';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    list: flags.help({char: 'l'})
  };

  async run() {
    cli.log('\nImage Commands:');
    let command_choices = [{
      name: `1) fandogh service:list => ${chalk.blueBright('list of services')}`
    }, {
      name: `2) fandogh service:apply => ${chalk.blueBright('create new service')}`
    }, {
      name: `3) fandogh service:details => ${chalk.blueBright('details of a service')}`
    }, {
      name: `4) fandogh service:destroy => ${chalk.blueBright('destroy service')}`
    }, {
      name: `5) fandogh service:logs => ${chalk.blueBright('logs of a service')}`
    }, {
      name: `6) fandogh service:dump => ${chalk.blueBright('dump a service manifest')}`
    }, {
      name: `7) fandogh service:rollback => ${chalk.blueBright('rollback a service to a specific history version')}`
    }, {
      name: `8) fandogh service:history => ${chalk.blueBright('service history commands')}`
    }];
    let volume_command: any = await inquirer.prompt([{
      name: 'command',
      message: 'select a command',
      type: 'list',
      choices: command_choices,
    }]);
    switch (volume_command.command) {
    case `1) fandogh service:list => ${chalk.blueBright('list of services')}`:
      await List.run([]);
      break;
    case `2) fandogh service:apply => ${chalk.blueBright('create new service')}`:
      await Apply.run([]);
      break;
    case `3) fandogh service:details => ${chalk.blueBright('details of a service')}`:
      await Details.run([]);
      break;
    case `4) fandogh service:destroy => ${chalk.blueBright('destroy service')}`:
      await Destroy.run([]);
      break;
    case `5) fandogh service:logs => ${chalk.blueBright('logs of a service')}`:
      await Logs.run([]);
      break;
    case `6) fandogh service:dump => ${chalk.blueBright('dump a service manifest')}`:
      await Dump.run([]);
      break;
    case `7) fandogh service:rollback => ${chalk.blueBright('rollback a service to a specific history version')}`:
      await Rollback.run([]);
      break;
    case `8) fandogh service:history => ${chalk.blueBright('service history commands')}`:
      await History.run([]);
      break;
    default:
    }
  }
}
