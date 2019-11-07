import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'

import Command from '../../base'
import {getSecretList} from '../../rest'
import {convert_datetime} from '../../utils'

export default class List extends Command {
  static description = 'Fetch list of secrets';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
  };

  async run() {
    this.progress.start(chalk.bold.white('Fetching namespace secrets...'));
    let secret_list = await getSecretList();
    if ([...secret_list].length === 0) {
      this.progress.warn('You don\'t have any secrets in your namespace');
      this.log(`You can create secrets using ${chalk.magentaBright('fandogh secret:add')} command`);
      return
    }
    this.progress.stop();
    cli.log('\n');
    cli.table([...secret_list], {
      name: {
        header: 'Secret Name  ',
        get: row => `${row.name}  `
      },
      type: {
        header: 'Secret Type  ',
        get: row => `${row.type}  `
      },
      created_at: {
        header: 'Created At  ',
        get: row => `${convert_datetime(row.created_at)}  `
      }
    });
    cli.log('\n');

    await this.notifyIfNotFocused('Secret command', 'Secret list fetched successfully.')
  }
}
