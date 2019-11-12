import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import {createService, getManagedServicesList} from '../../rest'
import {parse_key_values} from '../../utils'

export default class Deploy extends Command {
  static description = 'Manged-Service deploying command'

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    service_name: flags.string({char: 'n', description: 'Service name'}),
    service_version: flags.string({char: 'v', description: 'Service version'}),
    service_configs: flags.string({char: 'c', description: 'Service Configs', multiple: true})
  }

  static generate_managed_manifest(service_type: string, version: string, configs: string[]) {
    let manifest: any = {}
    manifest['kind'] = 'ManagedService'
    let spec: any = {}
    manifest['name'] = spec['service_name'] = service_type
    spec['version'] = version
    let param_list = []
    let service_parameters = parse_key_values(configs)
    for (let key of Object.keys(service_parameters)) {
      if (key === 'service_name') {
        manifest['name'] = service_parameters[key]
      } else {
        param_list.push({name: key, value: service_parameters[key]})
      }
    }
    spec['parameters'] = param_list
    manifest['spec'] = spec
    return manifest
  }

  async request_config_fields(service_configs: string[]) {
    let confirm: any = await inquirer.prompt([{
      name: 'confirmed',
      message: service_configs.length === 0 ? chalk.white('Do you want to add config field?') : chalk.white('Do you want to add another config field?'),
      type: 'confirm',
      default: true,
    }])
    if (confirm.confirmed) {
      await cli.prompt('enter service config field').then(value => {
        service_configs.push(value)
      })
      await this.request_config_fields(service_configs)
    } else {
      return service_configs
    }
  }

  async get_managed_services() {
    this.progress.start(chalk.bold.white('Fetching managed service list...'))
    let managed_service_list = await getManagedServicesList()
    this.progress.stop()
    if (managed_service_list.length === 0) {
      return null
    }
    let managed_service_choices = []
    for (let managed_service of managed_service_list) {
      managed_service_choices.push({name: managed_service.name})
    }
    let managed_service_name_prompt: any = await inquirer.prompt([{
      name: 'service_name',
      message: 'select a volume',
      type: 'list',
      choices: managed_service_choices,
    }])
    return managed_service_name_prompt.service_name
  }

  async run() {
    const {flags} = this.parse(Deploy)
    let service_name = flags.service_name || await this.get_managed_services()
    let service_version = flags.service_version || await cli.prompt('Enter managed service version')
    let service_configs = flags.service_configs || []
    if (service_configs.length === 0) {
      await this.request_config_fields(service_configs)
    }
    let response = await createService(Deploy.generate_managed_manifest(service_name, service_version, service_configs))
    let help_message = response['help_message'] || null

    if (help_message) {
      this.log(help_message)
    } else {
      let service_urls = response['urls'] || []
      if (service_urls.length > 0) {
        this.log('If your service has any web interface, it will be available via the following urls in few seconds:')
        for (let url of service_urls) {
          this.log(` - ${url}`)
        }
      }
    }

    await this.notifyIfNotFocused('Managed Service command', `Managed Service ${service_name} deployed successfully.`)
  }
}
