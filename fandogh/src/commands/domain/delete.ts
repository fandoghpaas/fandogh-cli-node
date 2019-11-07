import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import {deleteDomain, getDomainList} from '../../rest'

export default class Delete extends Command {
  static description = 'Delete an existing domain';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    domain_name: flags.string({char: 'n', description: 'name of domain intended to be deleted'})
  };

  static async get_domains() {
    let domain_list = await getDomainList();
    if (domain_list.length === 0) {
      return null
    }
    let domain_choices = [];
    for (let domain of domain_list) {
      domain_choices.push({name: domain.name})
    }
    let domain_name_prompt: any = await inquirer.prompt([{
      name: 'domain_name',
      message: 'select a domain to delete',
      type: 'list',
      choices: domain_choices,
    }]);
    return domain_name_prompt.domain_name
  }

  async run() {
    const {flags} = this.parse(Delete);
    let domain_name = flags.domain_name || await Delete.get_domains();
    if (domain_name === null) {
      this.log('You don\'t have any domain to delete!');
      cli.log(chalk.blueBright('you can create domain using fandogh domain:add command'));
      return
    }
    let confirm: any = await inquirer.prompt([{
      name: 'confirmed',
      message: chalk.redBright(`Are you sure you want to delete domain: ${domain_name}?`),
      type: 'confirm',
      default: true,
    }]);
    if (confirm.confirmed) {
      let response = await deleteDomain(domain_name);
      if (response.message) {
        this.log(response.message);
        await this.notifyIfNotFocused('Domain command', `Domain ${domain_name} deleted successfully`)
      } else {
        this.log(chalk.bold.yellowBright('Something went wrong ! Try `fandogh domain list` to verify delete operation.'));
        await this.notifyIfNotFocused('Domain command', 'Something went wrong ! Try `fandogh domain list` to verify delete operation.')
      }
    }
  }
}
