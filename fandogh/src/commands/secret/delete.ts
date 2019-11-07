import {flags} from '@oclif/command'
import chalk from 'chalk'
import {cli} from 'cli-ux'
import * as inquirer from 'inquirer'

import Command from '../../base'
import {getSecretList, deleteSecret} from '../../rest'

export default class Delete extends Command {
  static description = 'Delete an existing secret';

  static flags = {
    ...Command.flags,
    ...cli.table.flags,
    help: flags.help({char: 'h'}),
    secret_name: flags.string({char: 'n', description: 'unique name for secret'})
  };

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
    const {flags} = this.parse(Delete);
    let secret_name = flags.secret_name || await this.get_secrets();
    let confirm: any = await inquirer.prompt([{
      name: 'confirmed',
      message: chalk.redBright(`You are about to delete a secret named ${chalk.yellowBright.bold(secret_name)}, you cannot undo this action. Are sure?`),
      type: 'confirm',
      default: true,
    }]);
    if (confirm.confirmed) {
      this.progress.start(chalk.bold.white(`Trying to delete secret: ${secret_name}...`));
      let response = await deleteSecret(secret_name);
      this.progress.succeed(response.message);
      await this.notifyIfNotFocused('Secret command', `Secret ${secret_name} deleted successfully.`)
    }
  }
}
