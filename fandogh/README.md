fandogh
=======

cli tool to interact with fandogh paas

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/fandogh.svg)](https://npmjs.org/package/fandogh)
[![Downloads/week](https://img.shields.io/npm/dw/fandogh.svg)](https://npmjs.org/package/fandogh)
[![License](https://img.shields.io/npm/l/fandogh.svg)](https://github.com/fandoghpaas/fandogh-cli-node/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g fandogh
$ fandogh COMMAND
running command...
$ fandogh (-v|--version|version)
fandogh/0.0.1 darwin-x64 node-v10.16.3
$ fandogh --help [COMMAND]
USAGE
  $ fandogh COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`fandogh hello [FILE]`](#fandogh-hello-file)
* [`fandogh help [COMMAND]`](#fandogh-help-command)

## `fandogh hello [FILE]`

describe the command here

```
USAGE
  $ fandogh hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ fandogh hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/fandoghpaas/fandogh-cli-node/blob/v0.0.1/src/commands/hello.ts)_

## `fandogh help [COMMAND]`

display help for fandogh

```
USAGE
  $ fandogh help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.1/src/commands/help.ts)_
<!-- commandsstop -->
