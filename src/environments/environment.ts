/** Backend local (Spring Boot en puerto 8081) */
const LOCAL_API = 'http://localhost:8081/api/v1';

/** Backend desplegado en Render (API Gateway) */
const DEPLOYED_API = 'https://flowtrack-gateway.onrender.com/api/v1';

/** URL activa del API — cambia la asignación para alternar entre local y deployado */
// const API_BASE_URL = LOCAL_API;
const API_BASE_URL = DEPLOYED_API;

export const environment = {
  production: true,
  platformProviderApiBaseUrl: API_BASE_URL,
  aforoApiBaseUrl: API_BASE_URL,
  aforoEncenderEndpointPath: '/aforo/encender',
  aforoApagarEndpointPath: '/aforo/apagar',
  afluenciaTraficoDiarioEndpointPath: '/analitica/trafico-diario',
  afluenciaHorasPicoEndpointPath: '/analitica/horas-pico',
  afluenciaCamarasEndpointPath: '/analitica/camaras',
  afluenciaHistorialEndpointPath: '/analitica/historial',
  afluenciaHistorialExportEndpointPath: '/analitica/historial/export',
  restockDetectionEndpointPath: '/inventario/deteccion',
  restockDetectionRecordsSavePath: '/inventario/deteccion/registro',
  restockDetectionRecordsListPath: '/inventario/deteccion/registros',
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
  platformProviderAuthSignUpEndpointPath: '/authentication/sign-up',
  firebase: {
    apiKey: "AIzaSyAXvxStbzvI65fMwuTFsX4wk87n6PIwcqk",
    authDomain: "flowtracknotis.firebaseapp.com",
    projectId: "flowtracknotis",
    storageBucket: "flowtracknotis.firebasestorage.app",
    messagingSenderId: "747649396736",
    appId: "1:747649396736:web:39d2b014c666f40adf28e5",
    measurementId: "G-TRNF4NMX9",
    vapidKey: "BNID1VgjzSqhmqfI-tGj-yfnexLVQ_25GTNTvdA5jBug09UAss0Y33FHRu5TwZVDvqI6ewcwxfhAvS-mcu9VWf4"
  }
};
