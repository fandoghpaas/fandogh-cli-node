export const FANDOGH_HOST = process.env.FANDOGH_HOST || 'https://api.fandogh.cloud';
export const BASE_URL = `${FANDOGH_HOST}/api`;
export const BASE_IMAGES_URL = `${BASE_URL}/images`;
export const BASE_SERVICES_URL = `${BASE_URL}/services`;
export const BASE_MANAGED_SERVICES_URL = `${BASE_URL}/managed-services`;
export const BASE_VOLUMES_URL = `${BASE_URL}/volumes`;
export const BASE_SCHEMA_URL = `${BASE_URL}/schema`;
export const BASE_DOMAIN_URL = `${BASE_URL}/domains`;
export const BASE_NAMESPACE_URL = `${BASE_URL}/users/namespaces`;
export const BASE_SECRET_URL = `${BASE_URL}/secrets`;
export const BASE_SOURCE_URL = `${BASE_URL}/sources`;

export const MAX_WORKSPACE_SIZE = 20; //MB
