import {flags} from '@oclif/command'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import {getDomainList, requestDomainCertificate} from '../../rest'

export default class RequestCertificate extends Command {
  static description = 'Request certificate for an existing domain';

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
        if (domain.certificate === null) {
          domain_choices.push({name: domain.name})
        }
      }
    }
    if (domain_list.length === 0) {
      return null
    }
    let domain_name_prompt: any = await inquirer.prompt([{
      name: 'domain_name',
      message: 'select a domain to request certificate for',
      type: 'list',
      choices: domain_choices,
    }]);
    return domain_name_prompt.domain_name
  }

  async run() {
    const {flags} = this.parse(RequestCertificate);

    let domain_name = flags.domain_name || await RequestCertificate.get_domains();
    if (domain_name === null) {
      this.log('You don\'t have any not certified domain!')
    }

    await requestDomainCertificate(domain_name);
    this.log(`Your request has been submitted and we are trying to get a certificate from Let's Encrypt for your domain,
     it might get a few minutes to complete.\n you can follow up your request using ${domain_name}`);
    await this.notifyIfNotFocused('Domain command', `Domain ${domain_name} certificate request submitted successfully`)
  }
}
