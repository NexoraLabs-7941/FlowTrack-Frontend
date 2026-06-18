/** Backend local (Spring Boot en puerto 8081) */
const LOCAL_API = 'http://localhost:8081/api/v1';

/** Backend desplegado en Render — descomenta para usarlo en lugar del local */
// const DEPLOYED_API = 'https://test-ru6s.onrender.com/api/v1';

/** URL activa del API — cambia la asignación para alternar entre local y deployado */
const API_BASE_URL = LOCAL_API;
// const API_BASE_URL = DEPLOYED_API;

export const environment = {
  production: true,
  platformProviderApiBaseUrl: API_BASE_URL,
  aforoApiBaseUrl: API_BASE_URL,
  aforoEncenderEndpointPath: '/aforo/encender',
  aforoApagarEndpointPath: '/aforo/apagar',
  restockDetectionEndpointPath: '/inventario/deteccion',
  platformProviderProductsEndpointPath: '/products',
  platformProviderProvidersEndpointPath: '/providers',
  platformProviderBatchesEndpointPath: '/batches',
  platformProviderCategoriesEndpointPath: '/categories',
  platformProviderUsersEndpointPath: '/users',
  platformProviderKitsEndpointPath: '/kits',
  platformProviderSalesEndpointPath: '/sales',
  platformProviderDashboardEndpointPath: '/dashboard',
  platformProviderAuthEndpointPath: '/authentication',
  platformProviderAuthSignInEndpointPath: '/authentication/sign-in',
  platformProviderAuthSignUpEndpointPath: '/authentication/sign-up'
};
