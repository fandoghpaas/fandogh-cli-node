import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import {getDomainList, verifyDomain} from '../../rest'

export default class Verify extends Command {
  static description = 'Verify an existing domain';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    domain_name: flags.string({char: 'n', description: 'Domain name'}),
  };

  static async get_domains() {
    let domain_list = await getDomainList();
    if (domain_list.length === 0) {
      return null
    }
    let domain_choices = [];
    for (let domain of domain_list) {
      if (!domain.verified) {
        domain_choices.push({name: domain.name})
      }
    }
    let domain_name_prompt: any = await inquirer.prompt([{
      name: 'domain_name',
      message: 'select a domain to verify',
      type: 'list',
      choices: domain_choices,
    }]);
    return domain_name_prompt.domain_name
  }

  async run() {
    const {flags} = this.parse(Verify);

    let domain_name = flags.domain_name || await Verify.get_domains();
    if (domain_name === null) {
      this.log('You don\'t have any pending domain to verify!')
    }

    let domain = await verifyDomain(domain_name);
    if (domain.verified) {
      cli.log(chalk.greenBright.bold(`Domain ${domain.name} ownership verified successfully.`));
      cli.log(chalk.blueBright('you can create domain using fandogh domain:add command'));
      await this.notifyIfNotFocused('Domain command', `Domain ${domain_name} verified successfully`)
    } else {
      cli.log(chalk.yellowBright(`\nIt seems the key is not set correctly as value of a TXT record for domain ${chalk.bold(domain.name)}.`));
      cli.log(chalk.yellowBright('please add a TXT record with the following key to your name server in order to help us verify your ownership.'));
      cli.log(chalk.greenBright.bold(`\nKey: ${domain.verification_key}\n`));
      await this.notifyIfNotFocused('Domain command', `Domain ${domain_name} verification canceled`)
    }
  }
}
