import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import {get_user_config} from '../../config'
import {getNamespaceList} from '../../rest'

export default class Active extends Command {
  static description = 'Activate a namespace of your choice';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'})
  };

  async get_namespace_list() {
    this.progress.start(chalk.bold.white('Fetching user namespaces...'));
    let namespace_list = await getNamespaceList();
    this.progress.stop();
    let namespace_choices = [];
    for (let namespace of namespace_list) {
      namespace_choices.push({name: namespace.name})
    }
    let namespace_prompt: any = await inquirer.prompt([{
      name: 'namespace_name',
      message: 'select a namespace',
      type: 'list',
      choices: namespace_choices,
    }]);
    return namespace_prompt.namespace_name
  }

  async run() {
    let namespace = await this.get_namespace_list();
    this.progress.start(chalk.bold.white(`Setting the active namespace to ${namespace}`));
    this.progress.succeed(`Active namespace set to ${namespace}`);
    await this.notifyIfNotFocused('Namespace command', `Namespace ${namespace} activated successfully.`);
    get_user_config().set('namespace', namespace)
  }
}
