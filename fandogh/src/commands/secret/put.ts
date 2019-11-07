import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import {getSecretList, putSecret} from '../../rest'

export default class Put extends Command {
  static description = 'Update an existing secret';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    secret_name: flags.string({char: 'n', description: 'unique name for secret'}),
    secret_type: flags.string({char: 't', options: ['docker-registry'], description: 'type of secret to list'}),
    secret_fields: flags.string({char: 'f', multiple: true})
  };

  async request_secret_fields(secret_fields: string[]) {
    await cli.prompt('enter secret field').then(value => {
      secret_fields.push(value)
    });
    let confirm: any = await inquirer.prompt([{
      name: 'confirmed',
      message: chalk.white('Do you want to add another field?'),
      type: 'confirm',
      default: true,
    }]);
    if (confirm.confirmed) {
      await this.request_secret_fields(secret_fields)
    } else {
      return secret_fields
    }
  }

  async get_secrets() {
    this.progress.start(chalk.bold.white('Trying to fetch namespace secrets...'));
    let secret_list = await getSecretList();
    this.progress.stop();
    if ([...secret_list].length === 0) {
      this.progress.warn('You don\'t have any secrets in your namespace');
      this.log(`You can create secrets using ${chalk.magentaBright('fandogh secret:add')} command`);
      return null
    }
    let secret_choices = [];
    for (let secret of secret_list) {
      secret_choices.push({name: secret.name})
    }
    let secret_name_prompt: any = await inquirer.prompt([{
      name: 'secret_name',
      message: 'select a secret',
      type: 'list',
      choices: secret_choices,
    }]);
    return secret_name_prompt.secret_name
  }

  async run() {
    const {flags} = this.parse(Put);
    let secret_name = flags.secret_name || await this.get_secrets();
    let secret_type = flags.secret_type || await cli.prompt('enter secret type');
    let secret_fields = flags.secret_fields || [];
    if (secret_fields.length === 0) {
      await this.request_secret_fields(secret_fields)
    }
    if (secret_name) {
      let response = await putSecret(secret_name, secret_type, secret_fields);
      // @ts-ignore
      this.log(response.message);
      await this.notifyIfNotFocused('Secret command', `Secret ${secret_name} updated successfully.`)
    }
  }
}
