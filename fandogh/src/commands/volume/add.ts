import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'

import Command from '../../base'
import {createVolume} from '../../rest'

export default class Add extends Command {
  static description = 'Add new volume';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    volume_name: flags.string({char: 'n', description: 'Volume name'}),
    volume_capacity: flags.string({char: 'c', description: 'Volume capacity'})
  };

  static args = [{name: 'file'}];
  async run() {
    const {flags} = this.parse(Add);

    let volume_name = flags.volume_name || await cli.prompt('Enter volume name');
    let volume_capacity = flags.volume_capacity || await cli.prompt('Enter volume capacity (in GB)');
    this.progress.start(chalk.bold.white('Trying to build new volume...'));
    let volume = await createVolume(volume_name, volume_capacity);
    this.progress.succeed(`New volume ${volume_name} created successfully and is ready to attach`);
    cli.table([volume], {
      name: {header: 'Name', minWidth: 20},
      status: {
        header: 'Status',
        minWidth: 20,
        get: row => row.status !== 'Bound' ? chalk.yellowBright(row.status) : row.status
      },
      mounted_to: {
        header: 'Mounted To',
        minWidth: 20,
        get: row => row.mounted_to === null ? chalk.blueBright('Unmounted') : row.mounted_to
      },
      volume: {
        header: 'Volume',
        minWidth: 25
      },
      capacity: {
        header: 'Capacity',
        minWidth: 20
      },
      age: {
        header: 'Creation Date',
        minWidth: 20
      }
    });
    cli.log('\n');
    await this.notifyIfNotFocused('Volume command', `Volume ${volume_name} created successfully`)
  }
}
