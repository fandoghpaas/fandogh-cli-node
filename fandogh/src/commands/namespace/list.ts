import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'

import Command from '../../base'
import {get_user_config} from '../../config'
import {getNamespaceList} from '../../rest'

export default class List extends Command {
  static description = 'Fetch list of user namespaces';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
  };

  static args = [{name: 'file'}];

  async run() {
    this.progress.start(chalk.bold.white('Fetching user namespaces...'));
    let namespace_list = await getNamespaceList();
    this.progress.stop();
    let default_name_space = get_user_config().get('namespace', null);
    if (default_name_space === null && [...namespace_list].length > 1) {
      this.log(chalk.bold.redBright('You already have more than 1 namespace and none selected as default namespace.\n Please select a namespace as default one'))
    }

    this.log('\n> Your namespaces:\n');
    for (let namespace of namespace_list) {
      let message = chalk.bold.greenBright(`* ${namespace.name}`);
      if (namespace.name === default_name_space) {
        message += chalk.white.bold(' (active)')
      }
      this.log(message)
    }
    await this.notifyIfNotFocused('Namespace command', 'Namespace list fetched successfully.')
  }
}
