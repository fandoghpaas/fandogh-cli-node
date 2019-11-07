import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'

import Command from '../../base'
import {getServiceList} from '../../rest'
import {convert_datetime} from '../../utils'

export default class List extends Command {
  static description = 'Fetch service list';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
  };

  async run() {
    this.progress.start(chalk.bold.white('Fetching namespace services...'));
    let service_list = await getServiceList();
    if ([...service_list].length === 0) {
      this.progress.warn('You don\'t have any services in your namespace');
      this.log(`You can create services using ${chalk.magentaBright('fandogh service:deploy')} or ${chalk.magentaBright('fandogh service:apply')} command`);
      return
    }
    this.progress.stop();
    cli.log('\n');
    cli.table([...service_list], {
      name: {header: 'Service Name  ', get: row => `${row.name}  `},
      url: {header: 'URL  ', get: row => `${chalk.cyanBright.underline(row.url)}  `},
      service_type: {header: 'Service Type  ', get: row => `${row.service_type}  `},
      memory: {header: 'Memory Usages  ', get: row => `${row.memory}  `},
      replicas: {header: 'Replicas  ', get: row => `${[...row.pods].length}  `},
      start_date: {header: 'Started At  ', get: row => `${convert_datetime(row.start_date)}  `},
      last_update: {header: 'Updated At  ', get: row => `${convert_datetime(row.last_update)}  `},
      state: {
        header: 'State  ', get: row => row.state === 'RUNNING'
          ? `${row.state}  ` : row.state === 'PENDING' ? `${chalk.yellowBright(row.state)}  ` : `${chalk.redBright(row.state)}  `
      },
      service_restarts: {header: 'Restarts  ', get: row => `${row.service_restarts}  `}
    });
    cli.log('\n');

    await this.notifyIfNotFocused('Service command', 'Service list fetched successfully.')
  }
}
