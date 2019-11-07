import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import {createDomain, verifyDomain} from '../../rest'

export default class Add extends Command {
  static description = 'Add new domain';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    domain_name: flags.string({char: 'n', description: 'Domain name'}),
  };

  static args = [{name: 'file'}];
  async run() {
    const {flags} = this.parse(Add);

    let domain_name = flags.domain_name || await cli.prompt('Enter domain name');

    let domain = await createDomain(domain_name);
    await this.notifyIfNotFocused('Domain command', `Domain ${domain_name} created successfully`);
    if (domain.verified) {
      this.log('Your domain has been added and doesn\'t need verification')
    } else {
      this.log('\nThe domain has been added.');
      this.log('Now you just need to help us that you have ownership of this domain.');
      this.log('please add a TXT record with the following key to your name server in order to help us verify your ownership.');
      this.log(chalk.greenBright.bold(`\nKey: ${domain.verification_key}\n`));
      while (!domain.verified) {
        let confirm: any = await inquirer.prompt([{
          name: 'confirmed',
          message: chalk.blueBright('I added the record'),
          type: 'confirm',
          default: true,
        }]);
        if (confirm.confirmed) {
          domain = await verifyDomain(domain.name);
          if (domain.verified) {
            cli.log(chalk.greenBright.bold(`Domain ${domain.name} ownership verified successfully.`));
            await this.notifyIfNotFocused('Domain verification', `Domain ${domain_name} verified successfully`)
          } else {
            cli.log(chalk.yellowBright(`\nIt seems the key is not set correctly as value of a TXT record for domain ${chalk.bold(domain.name)}.`));
            cli.log(chalk.yellowBright('please add a TXT record with the following key to your name server in order to help us verify your ownership.'));
            cli.log(chalk.greenBright.bold(`\nKey: ${domain.verification_key}\n`));
            await this.notifyIfNotFocused('Domain verification', `Domain ${domain_name} not verified!`)
          }
        } else {
          this.log('You can verify the ownership later on');
          this.log('Once you added the record please run the following command');
          this.log(chalk.bold.greenBright(`fandogh domain verify --name=${domain.name}`));
          break
        }
      }
    }
  }
}
