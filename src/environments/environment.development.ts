/** Backend local (Spring Boot en puerto 8081) */
const LOCAL_API = 'http://localhost:8081/api/v1';

/** Backend desplegado en Render — descomenta para usarlo en lugar del local */
// const DEPLOYED_API = 'https://test-ru6s.onrender.com/api/v1';

/** URL activa del API — cambia la asignación para alternar entre local y deployado */
const API_BASE_URL = LOCAL_API;
// const API_BASE_URL = DEPLOYED_API;

export const environment = {
  production: false,
  platformProviderApiBaseUrl: API_BASE_URL,
  aforoApiBaseUrl: API_BASE_URL,
  aforoEncenderEndpointPath: '/aforo/encender',
  platformProviderProvidersEndpointPath: '/providers',
  platformProviderProductsEndpointPath: '/products',
  platformProviderKitsEndpointPath: '/kits',
  platformProviderBatchesEndpointPath: '/batches',
  platformProviderSalesEndpointPath: '/sales',
  platformProviderCategoriesEndpointPath: '/categories',
  platformProviderDashboardEndpointPath: '/dashboard',
  platformProviderUsersEndpointPath: '/users',
  platformProviderAuthEndpointPath: '/authentication',
  platformProviderAuthSignInEndpointPath: '/authentication/sign-in',
  platformProviderAuthSignUpEndpointPath: '/authentication/sign-up'
};
