import {cli} from 'cli-ux'
import chalk from 'chalk'

export function present_service_detail(details: any) {
  if (details['env'] && [...details['env']].length > 0) {
    cli.log(chalk.magentaBright('Environment Variables:'));
    cli.table([...details['env']],
      {
        name: {header: '  Name', minWidth: 20, get: row => `  ${row.name}`},
        value: {header: ' Value', minWidth: 20, get: row => `  ${row.name}`}
      })
  }

  if (details['urls'] && [...details['urls']].length > 0) {
    cli.log(chalk.magentaBright('Domains:'));
    for (let url of details['urls']) {
      cli.log(`  - ${chalk.cyanBright.underline(url)}`)
    }
  }

  if (details['volumes'] && [...details['volumes']].length > 0) {
    cli.log(chalk.magentaBright('Volumes:'));
    cli.table([...details['volumes']], {
      no: {header: 'No', minWidth: 20},
      volume: {header: 'Volume', minWidth: 20}
    })
  }

  cli.log(chalk.magentaBright('Pods:'));
  let index = 0;
  for (let pod of details['pods']) {
    index++;
    cli.log(`   ${chalk.bold('pod ' + index)}`);
    cli.log(`   ${chalk.bold('---------------------')}`);
    cli.log(`   Name: ${pod['name']}`);
    cli.log(`   Created at: ${pod['created_at'] || 'UNKNOWN'}`);
    let pod_phase = pod['phase'];
    cli.log(`   Phase: ${pod_phase.toUpperCase() === 'RUNNING' ? chalk.greenBright.bold(pod_phase) : chalk.yellowBright.bold(pod_phase)}`);

    let containers = pod['containers'] || [];
    let containers_length = containers.length;
    let ready_containers = [];
    for (let container of containers) {
      if (container['ready']) {
        ready_containers.push(container)
      }
    }
    let ready_containers_length = ready_containers.length;
    let pod_ready_message = '';
    if (ready_containers_length !== containers_length) {
      pod_ready_message = `   Ready containers: ${chalk.yellowBright(String(ready_containers_length))}\\${chalk.yellowBright(containers_length)}`
    } else {
      pod_ready_message = `   Ready containers: ${chalk.greenBright(containers_length)}\\${chalk.greenBright(containers_length)}`
    }
    cli.log(pod_ready_message);
    cli.log(chalk.magentaBright('   Containers:'));
    for (let container of pod['containers']) {
      cli.log(`    Name: ${container['name']}`);
      cli.log(`    Image: ${container['image']}`);
      cli.log(`    Replicas: ${[...details['pods']].length}`);
      if (container['ready']) {
        cli.log(`    Status: ${chalk.greenBright('Ready')}`)
      } else if (container['terminated']) {
        let terminated = container['terminated'] || {};
        let reason = terminated['reason'] || 'Terminated';
        cli.log(`    Status: ${chalk.redBright(reason)}`)
      } else {
        let waiting = container['waiting'] || {};
        let reason = waiting['reason'] || 'Pending';
        cli.log(`    Status: ${chalk.yellowBright(reason)}`)
      }
      cli.log(`    Restarts: ${container['restarts']}`)
    }

    if (pod['events'] || [] && containers_length !== ready_containers_length) {
      cli.log('\n');
      cli.log('    ---------------------');
      cli.log('    Events:');
      cli.table([...pod['events']], {
        reason: {header: '    Reason', get: row => `    ${row.reason}`},
        message: {header: '    Message', get: row => `    ${row.message}`},
        count: {header: '    Count', get: row => `    ${row.count}`},
        first_timestamp: {header: '    First Seen', get: row => `    ${row.first_timestamp}`},
        last_timestamp: {header: '    Last Seen', get: row => `    ${row.last_timestamp}`},
      });
      cli.log('\n')
    }
  }
}
