import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'

import Command from '../../base'
import {get_project_config} from '../../config'
import {createImage} from '../../rest'

export default class Init extends Command {
  static description = 'Initialize image to be ready for upload';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    image_name: flags.string({char: 'n', description: 'name of the image'})
  };

  async run() {
    const {flags} = this.parse(Init);
    let image_name = flags.image_name || await cli.prompt('Enter image name');
    this.progress.start(chalk.bold.white('Initializing new image...'));
    let response = await createImage(image_name);
    this.progress.succeed(response.message);
    await this.notifyIfNotFocused('Image command', `Image ${image_name} initialized successfully`);
    get_project_config().set('image.name', image_name)
  }
}
