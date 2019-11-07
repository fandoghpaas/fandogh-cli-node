import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import {getDomainList, revokeDomainCertificate} from '../../rest'

export default class RevokeCertificate extends Command {
  static description = 'Revoke certificate for an existing domain';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    domain_name: flags.string({char: 'n', description: 'Domain name'}),
  };

  static async get_domains() {
    let domain_list = await getDomainList();
    let domain_choices = [];
    for (let domain of domain_list) {
      if (domain.verified) {
        if (domain.certificate !== null) {
          domain_choices.push({name: domain.name})
        }
      }
    }
    if (domain_list.length === 0) {
      return null
    }
    let domain_name_prompt: any = await inquirer.prompt([{
      name: 'domain_name',
      message: 'select a domain to revoke its certificate',
      type: 'list',
      choices: domain_choices,
    }]);
    return domain_name_prompt.domain_name
  }

  async run() {
    const {flags} = this.parse(RevokeCertificate);

    let domain_name = flags.domain_name || await RevokeCertificate.get_domains();
    if (domain_name === null) {
      this.log('You don\'t have any certified domain!')
    }

    let confirm: any = await inquirer.prompt([{
      name: 'confirmed',
      message: chalk.redBright.bold(`You're about to revoke ${domain_name} certificate and delete the secret, are you sure?`),
      type: 'confirm',
      default: true,
    }]);
    if (confirm.confirmed) {
      let response = await revokeDomainCertificate(domain_name);
      this.log(response.message);
      await this.notifyIfNotFocused('Domain command', `Domain ${domain_name} certificate revoked successfully`)
    } else {
      this.log(chalk.yellowBright(`revoking certificate for domain ${domain_name} canceled.`));
      await this.notifyIfNotFocused('Domain command', `Domain ${domain_name} certificate revoke canceled!`)
    }
  }
}
