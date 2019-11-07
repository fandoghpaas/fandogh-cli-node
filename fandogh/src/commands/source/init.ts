import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import {getProjectTypes} from '../../rest'
import {ask_for_source_param, initialize_project, key_hints} from '../../source_utils'

export default class Init extends Command {
  static description = 'Initialize a new service source';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
  };

  async get_project_types() {
    this.progress.start(chalk.bold.white('Trying to fetch project types...'));
    let project_type_list = await getProjectTypes();
    this.progress.stop();
    let project_choices = [];
    for (let project_type of project_type_list) {
      project_choices.push({name: project_type.label})
    }
    let project_type_prompt: any = await inquirer.prompt([{
      name: 'project_type_name',
      message: 'select a project type',
      type: 'list',
      choices: project_choices,
    }]);
    // @ts-ignore
    return project_type_list.filter(item => item.label === project_type_prompt.project_type_name)[0]
  }

  async run() {
    let project_type: { [index: string]: any };
    project_type = await this.get_project_types();
    // @ts-ignore
    let project_type_hint = key_hints[project_type.name] as any;
    if (project_type_hint) {
      project_type_hint()
    }
    let chosen_params: { [index: string]: any } = {};
    let name = await inquirer.prompt([{
      name: 'name',
      message: chalk.whiteBright('Enter service name'),
      type: 'input',
      default: '',
      validate: name => {
        return name !== ''
      }
    }]);

    chosen_params = {
      ...chosen_params, ...(await inquirer.prompt([{
        name: 'context',
        message: chalk.whiteBright('The context directory'),
        type: 'input',
        default: '.'
      }]))
    };

    if (project_type.hasOwnProperty('parameters')) {
      // @ts-ignore
      for (let param of project_type.parameters) {
        for (let key of Object.keys(key_hints)) {
          if (key === param['key']) {
            // @ts-ignore
            let hint = key_hints[param.key];
            hint()
          }
        }
        chosen_params = {...chosen_params, ...await ask_for_source_param(param)}
      }
    }
    cli.log(chalk.greenBright('Your source has been initialized.\nPlease consider to run `fandogh source run` command whenever you are going to deploy your changes'));
    await initialize_project(name.name, project_type, chosen_params)
    // await this.notifyIfNotFocused('Secret command', 'Secret list fetched successfully.')
  }
}
