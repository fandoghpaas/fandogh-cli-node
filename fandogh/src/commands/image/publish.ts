import {flags} from '@oclif/command'
import * as bytes from 'bytes'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as fs from 'fs'

import * as ProgressBar from 'progress'

const request = require('request');
const followRedirects = require('follow-redirects');

import Command from '../../base'
import {get_project_config} from '../../config'
import {BASE_IMAGES_URL} from '../../constants'
import {axiosConfig} from '../../rest'
import {max_workspace_size, Workspace, wsEmitter} from '../../workspace'
import {showImageLogs} from './index'
import Init from './init'

export default class Publish extends Command {
  static description = 'Publish a new version of a specific image';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    image_version: flags.string({char: 'v', description: 'version of the image'})
  };

  async run() {
    const {flags} = this.parse(Publish);
    let image_version = flags.image_version || await cli.prompt('Enter image version');
    let image_name = get_project_config().get('image.name', null);
    if (image_name === null) {
      this.log(chalk.yellowBright('It looks you are either not in a fandogh workspace or you didn\'t init yet.'));
      this.log(chalk.yellowBright('If you are sure that you are in the right directory then please input the image name.'));
      image_name = await cli.prompt('Enter image name');
      if (image_name !== null) {
        Init.run([`--image_name=${image_name}`])
      } else {
        return
      }
    }
    let workspace = new Workspace();
    if (workspace.has_docker_file === false) {
      cli.log('In order to publish your image you must have a Dockerfile in the current directory');
      workspace.clean();
      return
    }
    wsEmitter.on('ready', () => {
      cli.log('\n');
      if (workspace.zip_file_size > max_workspace_size) {
        cli.log(chalk.bold.yellowBright(`The workspace size should not be larger than ${max_workspace_size}MB, its ${bytes(workspace.zip_file_size_kb)}.`));
        if (!workspace.has_docker_ignore) {
          cli.log(chalk.cyan.bold('[perhaps you may be able to take advantage of \'.dockerignore\' to reduce your workspace size,\n check documentation for .dockerignore at: https://docs.docker.com/engine/reference/builder/#dockerignore-file]'))
        }
      }
      followRedirects.maxBodyLength = 200 * 1024 * 1024;
      let formData = {
        version: image_version,
        source: fs.createReadStream(workspace.toString())
      };

      const bar = new ProgressBar(`${chalk.white('Uploading workspace: :bar :rate/bps :percent :etas')}`,
        {total: workspace.zip_file_size_kb, width: 40, complete: '\u2588', incomplete: '\u2591'});

      const req = request.post({
        url: `/${image_name}/versions`, baseUrl: BASE_IMAGES_URL, formData, headers: {
          ...axiosConfig.headers,
          'Content-Type': 'multipart/form-data',
          Connection: 'keep-alive'
        }
      }).on('complete', async (_resp: Response, _body: any) => {
        this.log('\n');
        this.progress.succeed('Uploading workspace completed.');
        this.log('\n');
        this.notifyIfNotFocused('Image command', `Uploading workspace for ${image_name} completed`);
        await showImageLogs(image_name, image_version)
      }).on('error', (error: Error) => {
        this.notifyIfNotFocused('Image command', `Image ${image_name} publish process canceled!`);
        clearInterval(interval);
        console.error(error);
        // @ts-ignore
        if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
          console.error(chalk.redBright('\nError in your network connection! trying again might help to fix this issue \n if it is keep happening, please inform us!'))
        } else {
          console.error(`\n${chalk.redBright(error.message)}`)
        }
      });
      const interval = setInterval(() => {
        bar.tick(req.req.connection._bytesDispatched - bar.curr);
        if (bar.complete) {
          clearInterval(interval);
          workspace.clean()
        }
      }, 250)
    })
  }
}
