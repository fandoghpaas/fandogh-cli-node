import chalk from 'chalk'
import * as fs from 'fs'

let FANDOGH_DEBUG = process.env.FANDOGH_DEBUG || false

const fillTemplate = require('es6-dynamic-template')

export function convert_datetime(datetime_value: string) {
  if (datetime_value) {
    return new Date(datetime_value).toISOString()
      .replace(/T/, ' ')
      .replace(/\..+/, '')
  }
  return null
}

export function parse_key_values(key_values: string[]) {
  let env_variables: { [key: string]: any } = {}
  for (let pair of key_values) {
    if ((pair as string).split('=', 2).length === 1) {
      if (process.env.pair) {
        env_variables[pair] = process.env.pair
      } else {
        throw Promise.reject(new Error(`${pair} is not a valid environment variable.`)).then(() => {
          // not called
        }, function (error) {
          console.error(chalk.redBright(error))
        })
      }
    } else {
      let key_value = (pair as string).split('=', 2)
      env_variables[key_value[0]] = key_value[1]
    }
  }
  return env_variables
}

export function read_manifest(manifest_file: string, parameters: string[] = []) {
  try {
    let manifest = fs.readFileSync(manifest_file, 'utf-8')
    let rendered_manifest = process_template(manifest, parse_key_values(parameters))
    return trim_comments(rendered_manifest)
  } catch (error) {
    console.error(chalk.redBright(error.message))
  }
}

function process_template(template: string, mapping: {}) {
  return fillTemplate(template, mapping)
}

function trim_comments(manifest: string) {
  let lines = []
  for (let line of manifest.split('\n')) {
    if (!line.trim().startsWith('#')) {
      lines.push(line)
    }
  }
  return lines.join('\n')
}

export function hide_manifest_env_content(content: any) {
  if (!content.hasOwnProperty('spec')) {
    return content
  }

  if (!content['spec'].hasOwnProperty('env')) {
    return content
  }

  let temp_content = {...content}
  for (let env of temp_content['spec']['env']) {
    if (env['hidden'] || false) {
      env['value'] = '***********'
    }
  }

  return temp_content
}

export function debug(msg: any) {
  if (FANDOGH_DEBUG) {
    console.log(msg)
  }
}
