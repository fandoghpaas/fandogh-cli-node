import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import {getDomainDetails, getDomainList} from '../../rest'

export default class Details extends Command {
  static description = 'Details of an existing domain';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    domain_name: flags.string({char: 'n', description: 'intended domain name'})
  };

  async get_domains() {
    this.progress.start(chalk.bold.white('fetching user domains...'));
    let domain_list = await getDomainList();
    if (domain_list.length === 0) {
      return null
    }
    let domain_choices = [];
    for (let domain of domain_list) {
      domain_choices.push({name: domain.name})
    }
    this.progress.stop().clear().frame();
    let domain_name_prompt: any = await inquirer.prompt([{
      name: 'domain_name',
      message: 'select a domain',
      type: 'list',
      choices: domain_choices,
    }]);
    return domain_name_prompt.domain_name
  }

  async run() {
    const {flags} = this.parse(Details);
    let domain_name = flags.domain_name || await this.get_domains();
    if (domain_name === null) {
      this.log('You don\'t have any domains!');
      this.log(chalk.blueBright('you can create domain using fandogh domain:add command'))
    }

    this.progress.start(chalk.bold.white(`fetching ${domain_name} details...`));
    let domain_details = await getDomainDetails(domain_name);
    this.progress.succeed(chalk.bold.white(`fetching ${domain_name} details completed`));
    this.log(chalk.bold(`Domain: ${chalk.bold.blueBright(domain_details.name)}`));
    if (domain_details.verified) {
      this.log(`\tVerified: ${chalk.greenBright.bold('Yes')}`)
    } else {
      this.log(`\tVerified: ${chalk.redBright.bold('No')}`)
    }
    if (domain_details.certificate) {
      let certificate_details = domain_details.certificate.details;
      let status = certificate_details.status;
      if (status === 'PENDING') {
        this.log(`\tCertificate: ${chalk.yellowBright.bold('Trying to get a certificate')}`)
      } else if (status === 'ERROR') {
        this.log(`\tCertificate: ${chalk.redBright.bold('Getting certificate failed')}`)
      } else if (status === 'READY') {
        this.log(`\tCertificate: ${chalk.greenBright.bold('Certificate is ready to use')}`)
      } else {
        this.log(`\tCertificate: ${chalk.yellowBright.bold('Certificate status is unknown')}`)
      }
      let info = certificate_details.info || false;
      if (info) {
        this.log(`\tInfo ${chalk.bold.yellowBright(info)}`)
      }
      if ([...certificate_details.events || []].length > 0) {
        this.log('\tEvents:');
        for (let condition of [...certificate_details.events]) {
          this.log(`\t + ${JSON.stringify(condition)}`)
        }
      }
    } else {
      this.log(`\tCertificate: ${chalk.bold.redBright('Not Requested')}`)
    }
    await this.notifyIfNotFocused('Domain command', `Domain ${domain_name} details fetched successfully`)
  }
}
