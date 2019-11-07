import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import {getImageList, getImageVersions} from '../../rest'

export default class Versions extends Command {
  static description = 'Fetch version list of a specific image';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    image_name: flags.string({char: 'n', description: 'intended image name'})
  };

  static args = [{name: 'file'}];

  async run() {
    const {flags} = this.parse(Versions);

    let selected_image = flags.image_name;
    if (!selected_image) {
      let image_list = await getImageList();
      let image_choices = [];
      for (let image of image_list) {
        image_choices.push({name: image.name})
      }
      let image_name_prompt: any = await inquirer.prompt([{
        name: 'image_name',
        message: 'select an image',
        type: 'list',
        choices: image_choices,
      }]);
      selected_image = image_name_prompt.image_name
    }

    // @ts-ignore
    let image_versions = await getImageVersions(selected_image);
    cli.log('\n');
    cli.table(image_versions, {
      image: {header: 'Image', minWidth: 20, get: _row => selected_image},
      version: {header: 'Version', minWidth: 20},
      size: {header: 'Size', minWidth: 25, get: row => ((row as any).size / 1000 / 1000).toString().concat('MB')},
      state: {
        header: 'State', minWidth: 20, get: row => (row as any).state === 'BUILT' ? chalk.green((row as any).state) :
          (row as any).state === 'FAILED' ? chalk.red((row as any).state) : chalk.yellow((row as any).state)
      }
    });
    cli.log('\n');

    await this.notifyIfNotFocused('Image command', `Image ${selected_image} version list fetched successfully.`)
  }
}
