import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'

import * as inquirer from 'inquirer'
import Command from '../../base'
import {deleteImage, getImageList} from '../../rest'

export default class Delete extends Command {
  static description = 'Delete a specific image';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    image_name: flags.string({char: 'n', description: 'name of image intended to be deleted'})
  };

  static args = [{name: 'file'}];

  static async get_images() {
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
    return image_name_prompt.image_name
  }

  async run() {
    const {flags} = this.parse(Delete);
    let image_name = flags.image_name || await Delete.get_images();
    let confirm: any = await inquirer.prompt([{
      name: 'confirmed',
      message: chalk.redBright(`Are you sure you want to delete image: ${image_name}?`),
      type: 'confirm',
      default: true,
    }]);
    if (confirm.confirmed) {
      let response = await deleteImage(image_name);
      cli.log(response.message);
      await this.notifyIfNotFocused('Image command', `Image ${image_name} deleted successfully`)
    }
  }
}
