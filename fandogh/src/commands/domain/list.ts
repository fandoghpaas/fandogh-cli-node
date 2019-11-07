import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'

import Command from '../../base'
import {getDomainList} from '../../rest'

export default class List extends Command {
  static description = 'Fetch list of domains';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
  };

  async run() {
    let domain_list = await getDomainList();
    cli.log('\n');
    cli.table([...domain_list], {
      name: {header: 'Domain Name  ', get: row => `${row.name}  `},
      verified: {
        header: 'Verified  ',
        get: row => row.verified ? 'Yes  ' : 'No  '
      },
      certificate: {
        header: 'Certificate  ',
        get: row => row.certificate === null ? chalk.yellowBright('No Certificate  ') : 'Requested  '
      },
      certificate_status: {
        header: 'Certificate status  ',
        get: row => row.certificate === null ? chalk.redBright('Not Requested  ') :
          row.certificate.details === null ? chalk.redBright('Not Requested  ') : row.certificate.details.status === 'READY' ?
            `${row.certificate.details.status}  ` : `${chalk.yellowBright(row.certificate.details.status)}  `
      }
    });
    cli.log('\n');
    await this.notifyIfNotFocused('Domain command', 'Domain list fetched successfully')
  }
}
