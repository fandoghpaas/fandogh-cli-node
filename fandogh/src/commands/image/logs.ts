import {flags} from '@oclif/command'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import {getImageList, getImageLogs, getImageVersions} from '../../rest'
import chalk from 'chalk'

export default class Logs extends Command {
  static description = 'Fetch build logs of an image';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    image_name: flags.string({char: 'n', description: 'image name'}),
    image_version: flags.string({char: 'v', description: 'image version'})
  };

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
  static async get_versions(image_name: string) {
    let version_list = await getImageVersions(image_name);
    let version_choices = [];
    for (let version of version_list) {
      version_choices.push({name: version.version})
    }
    let image_version_prompt: any = await inquirer.prompt([{
      name: 'image_version',
      message: 'select an image version',
      type: 'list',
      choices: version_choices,
    }]);
    return image_version_prompt.image_version
  }

  async run() {
    const {flags} = this.parse(Logs);

    let image_name = flags.image_name || await Logs.get_images();
    let image_version = flags.image_version || await Logs.get_versions(image_name);

    let image_offset = 0;
    let image_build: any;
    let image_segment_fetched = false;
    cli.log('Trying to fetch image logs');
    while (true) {
      // @ts-ignore
      image_build = await getImageLogs(image_name, image_version, image_offset);
      if (!image_segment_fetched) {
        image_segment_fetched = true;
        await this.notifyIfNotFocused('Image command', `Image ${image_name} logs fetched successfully.`)
      }
      image_offset = image_build.lines_count;
      let logs = image_build.logs;
      if (logs.trim() !== '')
        this.log(logs);
      if (image_build.state !== 'BUILDING' && image_build.state !== 'PENDING') {
        cli.log('Image log fetched completely');
        break
      }
    }
    if (image_build.state === 'FAILED') {
      cli.log(chalk.redBright('Image build failed!'));
      this.exit(201)
    }
  }
}
