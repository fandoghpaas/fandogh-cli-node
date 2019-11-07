import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as fs from 'fs'
import * as path from 'path'
import * as bytes from 'bytes'
import * as ProgressBar from 'progress'

const request = require('request');
const followRedirects = require('follow-redirects');

import Command from '../../base'
import {ConfigRepository} from '../../config'
import {BASE_SOURCE_URL} from '../../constants'
import {axiosConfig} from '../../rest'
import {max_workspace_size, Workspace, wsEmitter} from '../../workspace'
import {showImageLogs} from '../image'

export default class Run extends Command {
  static description = 'Run a new service source';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
  };

  async run() {
    let manifest_repository = new ConfigRepository(path.join(process.cwd(), 'fandogh.yml'), null);
    let context_pth: any = manifest_repository.get('spec', {});
    context_pth = context_pth['source'] === null ? {} : context_pth['source'];
    context_pth = context_pth['context'] === null ? '.' : context_pth['context'];
    let workspace = new Workspace(null, context_pth);

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
        manifest: JSON.stringify(manifest_repository.get_dict()),
        source: fs.createReadStream(workspace.toString())
      };

      const bar = new ProgressBar(`${chalk.white('Uploading workspace: :bar :rate/bps :percent :etas')}`,
        {total: workspace.zip_file_size_kb, width: 40, complete: '\u2588', incomplete: '\u2591'});

      let service_name = manifest_repository.get('name');

      const req = request.post({
        url: BASE_SOURCE_URL, formData, headers: {
          ...axiosConfig.headers,
          'Content-Type': 'multipart/form-data',
          Connection: 'keep-alive'
        }
      }).on('complete', async (_resp: Response, _body: any) => {
        this.log('\n');
        this.progress.succeed('Uploading workspace completed.');
        this.log('\n');
        this.notifyIfNotFocused('Source command', `Uploading workspace for ${service_name} completed`);
        await showImageLogs(String(service_name).toLowerCase(), 'latest')
      }).on('error', (error: Error) => {
        this.notifyIfNotFocused('Source command', `Source ${service_name} publish process canceled!`);
        clearInterval(interval);
        workspace.clean();
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

    // await this.notifyIfNotFocused('Secret command', 'Secret list fetched successfully.')
  }
}
