import chalk from 'chalk'
import * as inquirer from 'inquirer'
import * as path from 'path'
import {ConfigRepository} from './config'
import {requirements_hint, wsgi_name_hint, build_manifest as django_build_manifest} from './django'

export const key_hints: { [index: string]: any } = {
  wsgi: wsgi_name_hint,
  django: requirements_hint
};

export const manifest_builders: { [index: string]: any } = {
  django: django_build_manifest
};

export async function initialize_project(name: string, project_type: { [index: string]: any }, chosen_params: { [index: string]: any }) {
  let project_type_name = project_type['name'];
  await setup_manifest(name, project_type_name, chosen_params)

}

async function setup_manifest(name: string, project_type_name: string, chosen_params: { [index: string]: any }) {
  let manifest: { [index: string]: any } = {};
  let manifest_builder = manifest_builders[project_type_name] || null;
  if (manifest_builder === null) {
    let source = {
      context: chosen_params['context'] || '.',
      project_type: project_type_name
    };

    source = {...source, ...chosen_params};
    manifest = {
      kind: 'ExternalService',
      name,
      spec: {
        source,
        port: 80,
        image_pull_policy: 'Always'
      }
    }
  } else {
    manifest = manifest_builder(name, project_type_name, chosen_params)
  }

  let manifest_repository = new ConfigRepository(path.join(process.cwd(), 'fandogh.yml'), manifest);
  manifest_repository.save()

}

export async function ask_for_source_param(prompt_object?: any): Promise<object> {
  return inquirer.prompt([{
    name: prompt_object.key,
    message: chalk.whiteBright(prompt_object.name),
    type: 'input',
    default: prompt_object.default || null,
    validate: item => {
      return (item !== '' || !prompt_object['required']) || chalk.yellowBright(`${prompt_object.name} is required!`)
    }
  }])
}
