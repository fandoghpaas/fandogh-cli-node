import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'

import Command from '../../base'
import {getVolumeList} from '../../rest'
import {convert_datetime} from '../../utils'

export default class List extends Command {
  static description = 'Fetch list of volumes';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
  };

  static args = [{name: 'file'}];
  async run() {
    let volume_list = await getVolumeList();
    if (volume_list.length === 0) {
      cli.log('You have no volumes in your namespace!');
      cli.log(chalk.blueBright('you can created volume using fandogh volume:add command'));
      return
    }
    cli.log('\n');
    cli.table([...volume_list], {
      name: {header: 'Name  ', get: row => `${row.name}  `},
      status: {
        header: 'Status  ',
        get: row => row.status !== 'Bound' ? `${chalk.yellowBright(row.status)}  ` : `${row.status}  `
      },
      mounted_to: {
        header: 'Mounted To  ',
        get: row => row.mounted_to === null ? chalk.blueBright('Unmounted  ') : `${row.mounted_to}  `
      },
      volume: {
        header: 'Volume  ',
        get: row => `${row.volume}  `
      },
      capacity: {
        header: 'Capacity  ',
        get: row => `${row.capacity}  `
      },
      age: {
        header: 'Creation Date  ',
        get: row => `${convert_datetime(row.age)}  `
      }
    });
    cli.log('\n');
    await this.notifyIfNotFocused('Volume command', 'Volume list fetched successfully')
  }
}
