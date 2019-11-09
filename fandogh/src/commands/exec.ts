import {flags} from '@oclif/command'

import Command from '../base'
import {cli} from "cli-ux";

export default class Exec extends Command {
  static description = 'Exec command';

  static examples = [
    `
    $ fandogh exec -s service_name -i "EXEC_COMMAND"
    `,
  ];

  static args = [
    {name: 'command'}
  ];

  static flags = {
    ...Command.flags,
    help: flags.help({char: 'h'}),
    // flag with a value (-n, --name=VALUE)
    service_name: flags.string({char: 's', description: 'Service name'}),
    replica: flags.string({char: 'r', description: 'Service replica'}),
    interactive: flags.boolean({char: 'i', default: false, type: 'boolean', description: 'Interactive shell'})
  };

  async run() {
    const {args} = this.parse(Exec);
    const {flags} = this.parse(Exec);

    let service_name = flags.service_name || await cli.prompt('Enter service name');
    let replica = flags.replica || null;
    let interactive = flags.interactive;

    this.log(`${service_name}: with command: ${args.command}`)
  }
}
