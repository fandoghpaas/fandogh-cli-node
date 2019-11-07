import axios, {AxiosRequestConfig} from 'axios'
import chalk from 'chalk'
import {get_exception} from './base'

import {get_user_config} from './config'
import {
  BASE_DOMAIN_URL,
  BASE_IMAGES_URL, BASE_MANAGED_SERVICES_URL,
  BASE_NAMESPACE_URL,
  BASE_SECRET_URL, BASE_SERVICES_URL, BASE_SOURCE_URL,
  BASE_URL,
  BASE_VOLUMES_URL
} from './constants'
import {parse_key_values} from './utils'

export let axiosConfig: AxiosRequestConfig = {
  ...axios.defaults,
  baseURL: BASE_URL,
  headers: {
    Authorization: `JWT ${getUserToken()}`,
    'ACTIVE-NAMESPACE': get_user_config().get('namespace', null)
  }
};

function getUserToken() {
  return get_user_config().get('token', 'asda')
}

export async function loginUser(username: string, password: string) {
  const body = {username, password};
  try {
    const {data} = await axios.post('/tokens', body, {
      ...axios.defaults,
      baseURL: BASE_URL
    });
    return data
  } catch (error) {
    throw error
  }
}

export async function getImageList() {
  try {
    const {data} = await axios.get(BASE_IMAGES_URL, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function getImageLogs(image_name: string, image_version: string, image_offset: number) {
  try {
    const {data} = await axios.get(BASE_IMAGES_URL + `/${image_name}/versions/${image_version}/builds`, {
      ...axiosConfig,
      params: {image_offset}
    });
    return data
  } catch (error) {
    throw error
  }
}

export async function getImageVersions(image_name: string) {
  try {
    const {data} = await axios.get(BASE_IMAGES_URL + `/${image_name}/versions`, {
      ...axiosConfig
    });
    return data
  } catch (error) {
    throw error
  }
}

export async function deleteImage(image_name: string) {
  try {
    const {data} = await axios.delete(BASE_IMAGES_URL + `/${image_name}`, {
      ...axiosConfig
    });
    return data
  } catch (error) {
    throw error
  }
}

export async function createImage(image_name: string) {
  const body = {name: image_name};
  try {
    const {data} = await axios.post(BASE_IMAGES_URL, body, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function getVolumeList() {
  try {
    const {data} = await axios.get(BASE_VOLUMES_URL, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function createVolume(volume_name: string, volume_capacity: string) {
  const body = {
    name: volume_name,
    capacity: volume_capacity
  };
  try {
    const {data} = await axios.post(BASE_VOLUMES_URL, body, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function deleteVolume(volume_name: string) {
  try {
    const {data} = await axios.delete(BASE_VOLUMES_URL + `/${volume_name}`, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function getDomainList() {
  try {
    const {data} = await axios.get(BASE_DOMAIN_URL, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function createDomain(domain_name: string) {
  const body = {name: domain_name};
  try {
    const {data} = await axios.post(BASE_DOMAIN_URL, body, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function verifyDomain(domain_name: string) {
  try {
    const {data} = await axios.post(BASE_DOMAIN_URL + `/${domain_name}/verifications`, null, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function deleteDomain(domain_name: string) {
  try {
    const {data} = await axios.delete(BASE_DOMAIN_URL + `/${domain_name}`, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function getDomainDetails(domain_name: string) {
  try {
    const {data} = await axios.get(BASE_DOMAIN_URL + `/${domain_name}`, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function requestDomainCertificate(domain_name: string) {
  try {
    const {data} = await axios.post(BASE_DOMAIN_URL + `/${domain_name}/certificate`, null, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function revokeDomainCertificate(domain_name: string) {
  try {
    const {data} = await axios.delete(BASE_DOMAIN_URL + `/${domain_name}/certificate`, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function getNamespaceList() {
  try {
    const {data} = await axios.get(BASE_NAMESPACE_URL, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function getNamespaceStatus() {
  try {
    const {data} = await axios.get(BASE_NAMESPACE_URL + `/${get_user_config().get('namespace', 'NAMESPACE')}`, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function getSecretList() {
  try {
    const {data} = await axios.get(BASE_SECRET_URL, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function putSecret(secret_name: string, secret_type: string, secret_fields: string[]) {
  const body = {name: secret_name, type: secret_type, fields: parse_key_values(secret_fields)};
  try {
    const {data} = await axios.put(BASE_SECRET_URL + `/${secret_name}`, body, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function deleteSecret(secret_name: string) {
  try {
    const {data} = await axios.delete(BASE_SECRET_URL + `/${secret_name}`, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function createSecret(secret_name: string, secret_type: string, secret_fields: string[]) {
  const body = {name: secret_name, type: secret_type, fields: parse_key_values(secret_fields)};
  try {
    const {data} = await axios.post(BASE_SECRET_URL, body, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function getServiceList() {
  try {
    const {data} = await axios.get(BASE_SERVICES_URL, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function createService(manifest: any) {
  try {
    const {data} = await axios.post(BASE_SERVICES_URL + '/manifests', manifest, axiosConfig);
    return data
  } catch (error) {
    // @ts-ignore
    console.error(chalk.redBright(get_exception(error.response).message))
  }
}

export async function destroyService(service_name: string) {
  try {
    const {data} = await axios.delete(BASE_SERVICES_URL + `/${service_name}`, axiosConfig);
    return data
  } catch (error) {
    // @ts-ignore
    console.error(chalk.redBright(get_exception(error.response).message))
  }
}

export async function getServiceDetails(service_name: string) {
  try {
    const {data} = await axios.get(BASE_SERVICES_URL + `/${service_name}`, axiosConfig);
    return data
  } catch (error) {
    throw error
  }
}

export async function getServiceLogs(service_name: string, last_logged_time: number, max_logs: number) {
  try {
    const {data} = await axios.get(BASE_SERVICES_URL + `/${service_name}/logs`, {
      ...axiosConfig,
      params: {
        last_logged_time,
        max_logs
      }
    });
    return data
  } catch (error) {
    // @ts-ignore
    console.error(chalk.redBright(get_exception(error.response).message))
  }
}

export async function getServiceManifest(service_name: string) {
  try {
    const {data} = await axios.get(BASE_SERVICES_URL + '/manifests', {
      ...axiosConfig,
      params: {
        service_name
      }
    });
    return data
  } catch (error) {
    // @ts-ignore
    console.error(chalk.redBright(get_exception(error.response).message))
  }
}

export async function getServiceHistories(service_name: string) {
  try {
    const {data} = await axios.get(BASE_SERVICES_URL + `/${service_name}/history`, axiosConfig);
    return data
  } catch (error) {
    // @ts-ignore
    console.error(chalk.redBright(get_exception(error.response).message))
  }
}

export async function deleteServiceHistory(service_name: string, history_id: string) {
  try {
    const {data} = await axios.delete(BASE_SERVICES_URL + `/${service_name}/history/${history_id}`, axiosConfig);
    return data
  } catch (error) {
    // @ts-ignore
    console.error(chalk.redBright(get_exception(error.response).message))
  }
}

export async function getManagedServicesList() {
  try {
    const {data} = await axios.get(BASE_MANAGED_SERVICES_URL, axiosConfig);
    return data
  } catch (error) {
    // @ts-ignore
    console.error(chalk.redBright(get_exception(error.response).message))
  }
}

export async function getProjectTypes() {
  try {
    const {data} = await axios.get(BASE_SOURCE_URL + '/project-types', axiosConfig);
    return data
  } catch (error) {
    // @ts-ignore
    console.error(chalk.redBright(get_exception(error.response).message))
  }
}
