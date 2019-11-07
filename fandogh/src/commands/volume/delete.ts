import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import {deleteVolume, getVolumeList} from '../../rest'

export default class Delete extends Command {
  static description = 'Delete an existing volume';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    volume_name: flags.string({char: 'n', description: 'name of volume intended to be deleted'})
  };

  static args = [{name: 'file'}];

  async get_volumes() {
    this.progress.start(chalk.bold.white('Fetching namespace volumes...'));
    let volume_list = await getVolumeList();
    this.progress.stop();
    if (volume_list.length === 0) {
      return null
    }
    let volume_choices = [];
    for (let volume of volume_list) {
      volume_choices.push({name: volume.name})
    }
    let volume_name_prompt: any = await inquirer.prompt([{
      name: 'volume_name',
      message: 'select a volume',
      type: 'list',
      choices: volume_choices,
    }]);
    return volume_name_prompt.volume_name
  }

  async run() {
    const {flags} = this.parse(Delete);
    let volume_name = flags.volume_name || await this.get_volumes();
    if (volume_name === null) {
      cli.log('You have no volumes in your namespace!');
      cli.log(chalk.blueBright('you can create volume using fandogh volume:add command'));
      return
    }
    let confirm: any = await inquirer.prompt([{
      name: 'confirmed',
      message: chalk.redBright(`Are you sure you want to delete volume: ${volume_name}?\n  If you proceed all your data will be deleted, do you want to continue?`),
      type: 'confirm',
      default: true,
    }]);
    if (confirm.confirmed) {
      this.progress.start(`Trying to delete volume: ${chalk.magentaBright(volume_name)}`);
      let response = await deleteVolume(volume_name);
      this.progress.succeed(response.message);
      await this.notifyIfNotFocused('Volume command', `Volume ${volume_name} deleted successfully`)
    }
  }
}
