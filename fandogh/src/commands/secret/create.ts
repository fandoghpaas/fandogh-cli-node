import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import {createSecret} from '../../rest'

export default class Create extends Command {
  static description = 'Create new secret';

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

  async run() {
    const {flags} = this.parse(Create);
    let secret_name = flags.secret_name || await cli.prompt('enter secret name');
    let secret_type = flags.secret_type || await cli.prompt('enter secret type');
    let secret_fields = flags.secret_fields || [];
    if (secret_fields.length === 0) {
      await this.request_secret_fields(secret_fields)
    }
    this.progress.start(chalk.white.bold('Trying to create new secret...'));
    let response = await createSecret(secret_name, secret_type, secret_fields);
    this.progress.succeed(response.message);
    this.log(`You can see secrets list using ${chalk.magentaBright('fandogh secret:list')} command`);

    await this.notifyIfNotFocused('Secret command', `Secret ${secret_name} created successfully.`)
  }
}
