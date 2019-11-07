import {flags} from '@oclif/command'
import {cli} from 'cli-ux'

import Command from '../../base'
import {getImageList} from '../../rest'

export default class List extends Command {
  static description = 'Fetch list of namespace images';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
  };

  static args = [{name: 'file'}];

  async run() {
    let image_list = await getImageList();
    cli.log('\n');
    cli.table([...image_list], {
      name: {header: 'Image Name  ', get: row => `${row.name}  `},
      last_version: {
        header: 'Last Version  ',
        get: row => (row as any).last_version === null ? '------  ' : `${row.last_version.version}  `
      },
      date: {
        header: 'Last Version Publication Date  ',
        get: row => row.last_version === null ? '------  ' : `${row.last_version.date}  `
      }
    });
    cli.log('\n');
    await this.notifyIfNotFocused('Image command', 'Image list fetched successfully')
  }
}
