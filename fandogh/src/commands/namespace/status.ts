import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'

import Command from '../../base'
import {getNamespaceStatus} from '../../rest'

export default class Status extends Command {
  static description = 'Fetch status of a specific namespace';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
  };

  static args = [{name: 'file'}];

  static print_value(name: string, current: any, total: any) {
    cli.log(`${chalk.bold.magentaBright(name)}: ${chalk.whiteBright(current)} of ${chalk.whiteBright(total)}`)
  }

  async run() {
    this.progress.start(chalk.bold.white('Fetching user namespace status...'));
    let namespace_status = await getNamespaceStatus();
    this.progress.stop();
    this.log(chalk.bold(`\nNamespace: ${namespace_status.name}`));

    let current_used_resources = namespace_status.current_used_resources;
    let quota = namespace_status.quota;
    Status.print_value('Service Count', current_used_resources.service_count, quota.service_limit || 'N/A');
    Status.print_value('Memory', `${current_used_resources.memory_usage} MB`, `${quota.memory_limit || 'N/A'} MB`);
    Status.print_value('Volume', `${current_used_resources.volume_usage} GB`, `${quota.volume_limit || 'N/A'} GB`);
    this.log('\n');

    await this.notifyIfNotFocused('Namespace command', 'Namespace status fetched successfully.')
  }
}
