import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as fs from 'fs'
import * as path from 'path'
import * as os_path from 'path'

const glob = require('glob');

function find_files(_directory: string, pattern: string): any {
  return glob.sync(pattern, {matchBase: true})
}

export function wsgi_name_hint() {
  let cwd = process.cwd();
  let candidates = [];
  candidates = find_files(cwd, '*wsgi*.py');
  // @ts-ignore
  candidates = candidates.map(candidate => String(candidate).split(os_path.sep).join('.'));
  cli.log(chalk.bold.whiteBright('Possible wsgi modules are:'));
  if (candidates.length === 0) {
    cli.log(chalk.yellowBright('Fandogh could not find any WSGI module, provide one if there is any.'))
  } else {
    for (let candidate of candidates) {
      cli.log(chalk.cyan(`- ${candidate}`))
    }
  }
}

export function requirements_hint() {
  let req_path = path.join(process.cwd(), 'requirements.txt');
  if (fs.existsSync(req_path))
    return;
  console.log(chalk.redBright('Please consider to add a requirements.txt file contains all the dependencies your project has and try again.'));
  cli.exit(401)
}

export function build_manifest(name: string, project_type_name: string, chosen_params: { [index: string]: any }) {
  let source = {
    context: chosen_params['context '] || '.',
    project_type: project_type_name
  };

  source = {...source, ...chosen_params};

  let manifest = {
    kind: 'ExternalService',
    name,
    spec: {
      source,
      port: 80,
      image_pull_policy: 'Always'
    }
  };

  if (chosen_params['media_path'] || false) {
    let volume = {
      volume_mounts: [
        {
          mount_path: 'usr/src/app/' + chosen_params['media_path'],
          sub_path: name + '/media'
        }
      ]
    };
    manifest['spec'] = {...manifest['spec'], ...volume}
  }

  return manifest

}
