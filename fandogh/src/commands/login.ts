import {flags} from '@oclif/command'
import chalk from 'chalk'
import cli from 'cli-ux'

import Command from '../base'
import {get_user_config} from '../config'
import {loginUser} from '../rest'

export default class Login extends Command {
  static description = 'Login command';

  static examples = [
    `
    $ fandogh login -u user_name -p password
    `,
  ];

  static flags = {
    ...Command.flags,
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    username: flags.string({char: 'u', description: 'fandogh username'}),
    password: flags.string({char: 'p', description: 'fandogh password'})
  };

  async run() {
    const {flags} = this.parse(Login);
    const username = flags.username || await cli.prompt('Enter your username');
    const password = flags.password || await cli.prompt('Enter your password', {type: 'hide'});
    this.progress.start(chalk.bold.white(`Authenticating user ${username}...`));
    let data = await loginUser(username, password);
    this.progress.succeed(`User ${username} authenticated successfully`);
    cli.log('\n');
    cli.log(chalk.blueBright.bold(' ___  _   _  _  __   _   __  _ _    __  _   _  _ _  __  '));
    cli.log(chalk.blueBright.bold('| __|/ \\ | \\| ||  \\ / \\ / _|| U |  / _|| | / \\| | ||  \\ '));
    cli.log(chalk.blueBright.bold('| _|| o || \\  || o | o | |_n|   | ( (_ | |( o ) U || o )'));
    cli.log(chalk.blueBright.bold('|_| |_n_||_|\\_||__/ \\_/ \\__/|_n_|  \\__||___\\_/|___||__/ '));
    cli.log(chalk.blueBright.bold('                                                        '));
    cli.log('\n');
    cli.log('Welcome to Fandogh Cloud, you can start using our PaaS as quickly as a link click, Try it below:');
    cli.log(chalk.blueBright('https://docs.fandogh.cloud/docs/getting-started.html'));
    cli.log('\n');
    await this.notifyIfNotFocused('Authentication completed', `User ${username} logged in successfully`);
    get_user_config().set('token', data.token)
  }
}
