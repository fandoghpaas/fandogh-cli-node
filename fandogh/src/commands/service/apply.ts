import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import {createService, getServiceDetails} from '../../rest'
import {hide_manifest_env_content, read_manifest} from '../../utils'
import {present_service_detail} from "../../service_presenter";

const yaml = require('js-yaml');

export default class Apply extends Command {
  static description = 'Apply new service manifest';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    manifest: flags.string({char: 'f', description: 'service manifest name'}),
    parameters: flags.string({char: 'p', description: 'service manifest parameters', multiple: true})
  };

  async request_manifest_parameters(manifest_parameters: string[]) {
    await cli.prompt('enter parameter fields').then(value => {
      manifest_parameters.push(value)
    });
    let confirm: any = await inquirer.prompt([{
      name: 'confirmed',
      message: chalk.white('Do you want to add another parameter?'),
      type: 'confirm',
      default: true,
    }]);
    if (confirm.confirmed) {
      await this.request_manifest_parameters(manifest_parameters)
    } else {
      return manifest_parameters
    }
  }

  async run() {
    const {flags} = this.parse(Apply);
    let service_manifest = flags.manifest || await cli.prompt('Enter manifest name');
    let manifest_parameters = flags.parameters || [];

    if (manifest_parameters.length === 0) {
      await this.request_manifest_parameters(manifest_parameters)
    }

    let manifest_content = await read_manifest(service_manifest, manifest_parameters);

    if (!manifest_content) {
      return
    }

    let manifests = [...yaml.loadAll(manifest_content)];

    manifests.forEach(async function (manifest: any, index) {
      cli.log(`service ${++index} - ${manifests.length} is being deployed`);
      cli.log(yaml.dump(hide_manifest_env_content(manifest)));

      let deployment_result = await createService(manifest);
      let service_name = manifest['name'] || '';
      let message = '\nCongratulation, Your service is running ^_^\n';
      let service_type = String(deployment_result['service_type'] || '').toLowerCase();
      let service_urls = deployment_result['urls'];
      let help_message = deployment_result['help_message'] || '';

      if (help_message) {
        message += help_message
      } else {
        if (service_type === 'external') {
          message += `Your service is accessible using the following URLs:\n${[...service_urls].forEach(function (url) {
            return '\n'.concat(` - ${url}`)
          })}`
        } else if (service_type === 'internal') {
          message += `Since your service is internal, it's not accessible from outside your fandogh private network,
            but other services inside your private network will be able to find it using it's name: \'${deployment_result['name']}\'`
        } else if (service_type === 'managed') {
          message += 'Managed service deployed successfully';

          if ([...service_urls].length > 0) {
            message += `If your service has any web interface, it will be available via the following urls in few seconds:\n${[...service_urls].forEach(function (url) {
              return '\n'.concat(` - ${url}`)
            })}`
          }
        }
      }

      while (true) {
        let details: any = await getServiceDetails(service_name);

        if (!details) {
          cli.exit(302)
        }

        console.clear();

        if (details['state'] === 'RUNNING') {
          present_service_detail(details);
          cli.log(message);
          if (index === [...manifests].length - 1) {
            cli.exit(0)
          } else {
            break
          }
        } else if (details['state'] === 'UNSTABLE') {
          present_service_detail(details);
          cli.log('You can press ctrl + C to exit details service state monitoring');
          await cli.wait(3000)
        } else {
          if (index === [...manifests].length - 1) {
            cli.exit(304)
          } else {
            break
          }
        }
      }
      // @ts-ignore
      await (this as Apply).notifyIfNotFocused('Service command', `Service ${service_name} deployment status updated!`)
    })
  }
}
