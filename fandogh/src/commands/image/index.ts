import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import {getImageLogs} from '../../rest'
import ora = require('ora');

import Delete from './delete'
import Init from './init'
import List from './list'
import Logs from './logs'
import Publish from './publish'
import Versions from './versions'

export default class Index extends Command {
  static description = 'Image management commands';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    list: flags.help({char: 'l'})
  };

  async run() {
    cli.log('\nImage Commands:');
    let command_choices = [{
      name: `1) fandogh image:init => ${chalk.blueBright('init new image')}`
    }, {
      name: `2) fandogh image:publish => ${chalk.blueBright('publish new image')}`
    }, {
      name: `3) fandogh image:list => ${chalk.blueBright('list of images')}`
    }, {
      name: `4) fandogh image:logs => ${chalk.blueBright('build log of specific image')}`
    }, {
      name: `5) fandogh image:versions => ${chalk.blueBright('version list of specific image')}`
    }, {
      name: `6) fandogh image:delete => ${chalk.blueBright('delete a specific image')}`
    }];
    let image_command: any = await inquirer.prompt([{
      name: 'command',
      message: 'select a command',
      type: 'list',
      choices: command_choices,
    }]);
    switch (image_command.command) {
      case `1) fandogh image:init => ${chalk.blueBright('init new image')}`:
        await Init.run([]);
        break;
      case `2) fandogh image:publish => ${chalk.blueBright('publish new image')}`:
        await Publish.run([]);
        break;
      case `3) fandogh image:list => ${chalk.blueBright('list of images')}`:
        await List.run([]);
        break;
      case `4) fandogh image:logs => ${chalk.blueBright('build log of specific image')}`:
        await Logs.run([]);
        break;
      case `5) fandogh image:versions => ${chalk.blueBright('version list of specific image')}`:
        await Versions.run([]);
        break;
      case `6) fandogh image:delete => ${chalk.blueBright('delete a specific image')}`:
        await Delete.run([]);
        break;
      default:
    }
  }
}

// @ts-ignore
export async function showImageLogs(image_name, image_version) {
  let image_build: any;
  let image_offset = 0;
  progress.start(chalk.white('Trying to fetch image logs...\n'));
  while (true) {
    // @ts-ignore

    image_build = await getImageLogs(image_name, image_version, image_offset);

    if (progress.isSpinning) {
      progress.stopAndPersist({symbol: '', prefixText: ''})
    }
    image_offset = image_build.lines_count;
    let logs = image_build.logs;
    if (logs.trim() !== '')
      cli.log(logs);

    if (image_build.state === 'FAILED') {
      progress.fail(chalk.redBright('Image build failed!'));
      break
    } else if (image_build.state !== 'BUILDING' && image_build.state !== 'PENDING') {
      cli.log('\n');
      progress.succeed('Image log fetched completely');
      cli.log('\n');
      break
    }
    await cli.wait(1000)
  }
}

const progress = ora({color: 'white'});
