import {Archiver} from 'archiver'
import chalk from 'chalk'
import * as os_path from 'path'
import {WalkNext} from 'walk'
import * as walk from 'walk'
import {debug} from './utils'
import ora = require('ora');
import bytes = require('bytes');

const EventEmitter = require('events');
const _cliProgress = require('cli-progress');
const countFiles = require('count-files');
const archiver = require('archiver');
const readline = require('readline');
const fs = require('fs-extra');

export const max_workspace_size = 20;  //20MB

export class Workspace {
  workspace_config?: any;
  context: string;
  path: string;
  zip_file_name: string;
  has_docker_ignore: boolean;
  has_docker_file: boolean;
  zip_file_size_kb = 0;
  zip_file_size = 0;

  constructor(workspace_config?: any, context?: any) {
    this.workspace_config = workspace_config || {};
    this.path = this.workspace_config['path'] || process.cwd();
    if (context && context !== '.') {
      this.path = os_path.resolve(os_path.join(this.path, context))
    }
    this.context = context || '.';
    if (!fs.existsSync(this.path)) {
      throw Promise.reject(new Error(`No directory or path with path ${this.path} exists!`)).then(() => {
        // not called
      }, function (error) {
        console.error(chalk.redBright(error))
      })
    }
    this.zip_file_name = os_path.join(this.path, 'workspace.zip');
    let files = fs.readdirSync(this.path);
    this.has_docker_ignore = files.includes('.dockerignore');
    this.has_docker_file = files.includes('Dockerfile');
    this.create_zip_file()
  }

  clean() {
    if (fs.existsSync(this.zip_file_name)) {
      fs.removeSync(this.zip_file_name)
    }
  }

  create_zip_file() {
    console.log('\n');
    progress.start(chalk.bold.white('Scanning project directory...'));
    countFiles(this.path, {dereference: true}, function (error: any, results: any) {
      if (error) {
        progress.fail(chalk.redBright(error.message))
      } else {
        progress.succeed(`Scanning completed:\n\n ${chalk.magentaBright('Total Files:')} ${results.files}\n ${chalk.magentaBright('Total Directories:')} ${results.dirs}\n ${chalk.magentaBright('Estimated Size:')} ${bytes(results.bytes)}`);
        console.log('\n');
        bar1.start(results.files, 0)
      }
    });

    let output = fs.createWriteStream(this.zip_file_name);
    const zipf = archiver('zip', {
      zlib: 9
    });
    zipf.pipe(output);

    zipf.on('error', function (error: any) {
      progress.fail(chalk.redBright(error.message))
    });

    output.on('finish', () => {
      progress.succeed('Workspace created successfully');
      this.zip_file_size_kb = fs.statSync(this.zip_file_name).size;
      this.zip_file_size = this.zip_file_size_kb / 1048576;
      wsEmitter.emit('ready')
    });

    this.zipdir(this, this.path, zipf)

  }

  public toString = (): string => {
    return this.zip_file_name
  };

  get_ignored_entries() {
    if (!this.has_docker_ignore) {
      return []
    }
    let entries: string[] = [];
    const readInterface = readline.createInterface({
      input: fs.createReadStream(os_path.join(this.path, '.dockerignore')),
      console: false
    });
    readInterface.on('line', function (line: any) {
      entries.push(line)
    });
    let expand_entries = [];
    // @ts-ignore
    for (let entry of entries) {
      expand_entries.push(entry.trim() + os_path.sep + '*')
    }

    return entries.concat(expand_entries)
  }

  zipdir(self: Workspace, path: string, ziph: Archiver) {
    let ignored_entries = this.get_ignored_entries();
    ignored_entries.push('*dockerignore');
    debug(ignored_entries);
    let counter = 0;
    let walker = walk.walk(path, {followLinks: true});
    walker.on('file', function (root, fileStats, next: WalkNext) {
      if (fileStats.name !== 'workspace.zip') {
        let file_path = os_path.join(os_path.relative(path, root), fileStats.name);
        if (fileStats.name.toLowerCase() !== 'dockerignore' && ignored_entries.forEach(ignore => {
          if (file_path === ignore.trim()) {
            return true
          }
        }) || false) {
          debug(`${file_path} filtered out.`)
        } else {
          ziph.append(fs.readFileSync(os_path.join(self.context, file_path)), {name: os_path.join(self.context, file_path)})
        }
        counter++;
        bar1.update(counter)
      }
      next()
    });
    walker.on('end', function () {
      ziph.finalize();
      bar1.stop();
      console.log('\n');
      progress.start(chalk.white.bold('Finalizing compress action...'))
    })
  }
}

const progress = ora({color: 'white'});
const bar1 = new _cliProgress.SingleBar({
  format: `${chalk.white('Compressing workspace: {bar} {percentage}% | {value}/{total} files')}`,
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true
});

export const wsEmitter = new EventEmitter();
