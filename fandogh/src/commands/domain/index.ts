import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'

import Add from './add'
import Delete from './delete'
import Details from './details'
import List from './list'
import RequestCertificate from './request_certificate'
import RevokeCertificate from './revoke_certificate'
import Verify from './verify'

export default class Index extends Command {
  static description = 'Domain management commands';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'})
  };

  async run() {
    cli.log('\nDomain Commands:');
    let command_choices = [{
      name: `1) fandogh domain:list => ${chalk.blueBright('list of domains')}`
    }, {
      name: `2) fandogh domain:add => ${chalk.blueBright('add new domain')}`
    }, {
      name: `3) fandogh domain:verify => ${chalk.blueBright('verify a domain')}`
    }, {
      name: `4) fandogh domain:delete => ${chalk.blueBright('delete a domain')}`
    }, {
      name: `5) fandogh domain:details => ${chalk.blueBright('details of a domain')}`
    }, {
      name: `6) fandogh domain:request_certificate => ${chalk.blueBright('request certificate for a specific domain')}`
    }, {
      name: `7) fandogh domain:revoke_certificate => ${chalk.blueBright('revoke certificate for a specific domain')}`
    }];
    let domain_command: any = await inquirer.prompt([{
      name: 'command',
      message: 'select a command',
      type: 'list',
      choices: command_choices,
    }]);
    switch (domain_command.command) {
    case `1) fandogh domain:list => ${chalk.blueBright('list of domains')}`:
      await List.run([]);
      break;
    case `2) fandogh domain:add => ${chalk.blueBright('add new domain')}`:
      await Add.run([]);
      break;
    case `3) fandogh domain:verify => ${chalk.blueBright('verify a domain')}`:
      await Verify.run([]);
      break;
    case `4) fandogh domain:delete => ${chalk.blueBright('delete a domain')}`:
      await Delete.run([]);
      break;
    case `5) fandogh domain:details => ${chalk.blueBright('details of a domain')}`:
      await Details.run([]);
      break;
    case `6) fandogh domain:request_certificate => ${chalk.blueBright('request certificate for a specific domain')}`:
      await RequestCertificate.run([]);
      break;
    case `7) fandogh domain:revoke_certificate => ${chalk.blueBright('revoke certificate for a specific domain')}`:
      await RevokeCertificate.run([]);
      break;
    default:
    }
  }
}
