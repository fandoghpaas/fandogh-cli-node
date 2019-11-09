import Command, {flags} from '@oclif/command'
import chalk from 'chalk'
import * as inquirer from 'inquirer'
import * as notifier from 'node-notifier'

import ora = require('ora');
import {get_user_config} from "./config";

const activeWin = require('active-win');

export default abstract class extends Command {
  static description = 'fandogh command line tool';
  static flags = {
    loglevel: flags.string({options: ['error', 'warn', 'info', 'debug'], hidden: true})
  };


  progress = ora({color: 'white'});

  async notifyIfNotFocused(title: string, message: string) {
    const data = await activeWin();
    if (data) {
      try {
        if (data.owner['name'] !== process.env['LC_TERMINAL']) {
          notifier.notify({title, message})
        }
      }catch (e) {

      }
    }
  }

  async init() {
    if (get_user_config().get('collect_error', null) === null) {
      let confirm: any = await inquirer.prompt([{
        name: 'confirmed',
        message: 'Would you like to let Fandogh CLI to send context information in case any unhandled error happens?',
        type: 'confirm',
        default: true,
      }]);
      if (confirm.confirmed) {
        get_user_config().set('collect_error', 'YES')
      } else {
        get_user_config().set('collect_error', 'NO')
      }
    }
  }

  async catch(error: any) {
    // handle any error from the command
    if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
      this.error('Error in your network connection! trying again might help to fix this issue \n if it is keep happening, please inform us!')
    }
    if (error.oclif && error.oclif.exit === 0) return;
    if (error.response) {
      // @ts-ignore
      let message = get_exception(error.response).message;
      if (this.progress.isSpinning) {
        this.progress.fail(chalk.redBright.bold(message))
      } else {
        this.log(chalk.redBright.bold(message))
      }
      this.exit(1)
    }
  }
}

export function get_exception(response: any): string {
  let exception_class: { [code: number]: any } = {
    401: new AuthenticationError(response),
    404: new ResourceNotFoundError(response),
    400: new FandoghBadRequest(response),
    500: new FandoghInternalError(response),
    403: new ExecutionForbidden(response),
  };
  return exception_class[response.status] || new FandoghAPIError(response)
}

class FandoghAPIError extends Error {
  message = 'Server Error';
  response: any;

  constructor(response: any) {
    super();
    this.response = response
  }
}

class AuthenticationError extends Error {
  message = 'Please login first. You can do it by running \'fandogh login\' command';
  response: any;

  constructor(response?: any) {
    super();
    this.response = response
  }
}

class ResourceNotFoundError extends FandoghAPIError {
  message = 'Resource Not found';
  response: any;

  constructor(response: any, message?: string) {
    super(FandoghAPIError);
    this.response = response;
    if (message) {
      this.message = message
    }
    if (this.response.hasOwnProperty('json')) {
      this.message = this.response.json().get('message', this.message)
    }
  }
}

class ExecutionForbidden extends FandoghAPIError {
  message = 'Forbidden Execution';
  response: any;

  constructor(response: any, message?: string) {
    super(FandoghAPIError);
    this.response = response;
    if (message) {
      this.message = message
    }
    if (this.response.hasOwnProperty('json')) {
      this.message = this.response.json().get('message', this.message)
    }
  }
}

class FandoghInternalError extends FandoghAPIError {
  message = 'Sorry, there is an internal error, the incident has been logged and we will fix it ASAP';
  response: any;

  constructor(response: any) {
    super(FandoghAPIError);
    this.response = response
  }
}

class FandoghBadRequest extends FandoghAPIError {
  message = 'Sorry, there is an internal error, the incident has been logged and we will fix it ASAP';
  response: any;

  constructor(response: any) {
    super(FandoghAPIError);
    this.response = response;
    try {
      let sub_messages = '';
      for (let key of Object.keys(response.data)) {
        let value = response.data[key];
        sub_messages += '\n'.concat(` -> ${key}: ${value}`)
      }
      this.message = `Errors: ${sub_messages}`
    } catch (e) {
      this.message = response.text
    }
  }
}

class CommandParameterException extends Error {
  message = 'Sorry, there is an internal error, the incident has been logged and we will fix it ASAP';
  response: any;

  constructor(error_dict: any) {
    super();
    try {
      let sub_messages = '';
      for (let key of Object.keys(error_dict.data)) {
        let value = error_dict.data[key];
        sub_messages += '\n'.concat(` -> ${key}: ${value}`)
      }
      this.message = `Errors: \n${sub_messages}`
    } catch (e) {
      this.message = JSON.stringify(error_dict)
    }
  }
}
