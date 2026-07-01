/**
 * Enlaces directos a Google Cloud / Firebase para corregir permisos manualmente.
 */
import { FIREBASE_PROJECT } from "./firebase-setup-api.mjs";

const P = FIREBASE_PROJECT;

export const LINKS = {
  firebaseHome: `https://console.firebase.google.com/project/${P}`,
  billingBlaze: `https://console.firebase.google.com/project/${P}/usage/details`,
  billingGcp: `https://console.cloud.google.com/billing/linkedaccount?project=${P}`,
  serviceAccounts: `https://console.firebase.google.com/project/${P}/settings/serviceaccounts/adminsdk`,
  serviceAccountsGcp: `https://console.cloud.google.com/iam-admin/serviceaccounts?project=${P}`,
  iam: `https://console.cloud.google.com/iam-admin/iam?project=${P}`,
  iamGrant: `https://console.cloud.google.com/iam-admin/grantaccess?project=${P}`,
  apisDashboard: `https://console.cloud.google.com/apis/dashboard?project=${P}`,
  oauthConsent: `https://console.cloud.google.com/apis/credentials/consent?project=${P}`,
  oauthClients: `https://console.cloud.google.com/apis/credentials?project=${P}`,
  authProviders: `https://console.firebase.google.com/project/${P}/authentication/providers`,
  firestore: `https://console.firebase.google.com/project/${P}/firestore`,
  functions: `https://console.firebase.google.com/project/${P}/functions`,
  githubSecrets: `https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/settings/secrets/actions`,
  workflowSetup: `https://github.com/lasucursaldelcafe-droid/WEb-mas-cafe/actions/workflows/deploy-supabase-wallet.yml`,
};

/** Enlace para habilitar una API concreta */
export function apiEnableLink(apiId) {
  return `https://console.cloud.google.com/apis/library/${apiId}?project=${P}`;
}

/** Roles mínimos recomendados para la cuenta de servicio de CI/CD wallet */
export const REQUIRED_CI_ROLES = [
  {
    id: "roles/firebase.admin",
    label: "Firebase Admin",
    why: "Configurar Auth, Firestore, Functions y deploy",
  },
  {
    id: "roles/serviceusage.serviceUsageAdmin",
    label: "Service Usage Admin",
    why: "Activar APIs de Google Cloud automáticamente",
  },
  {
    id: "roles/iam.serviceAccountUser",
    label: "Service Account User",
    why: "Desplegar Cloud Functions con la cuenta de App Engine",
  },
  {
    id: "roles/cloudfunctions.admin",
    label: "Cloud Functions Admin",
    why: "Publicar y actualizar funciones",
  },
  {
    id: "roles/datastore.user",
    label: "Cloud Datastore User",
    why: "Sembrar reglas del programa de fidelización",
  },
  {
    id: "roles/identitytoolkit.admin",
    label: "Identity Toolkit Admin",
    why: "Activar email/Google sign-in y dominios autorizados",
  },
];

export function roleGrantInstructions(serviceAccountEmail, roleId) {
  return {
    link: LINKS.iamGrant,
    steps: [
      `Abrir: ${LINKS.iamGrant}`,
      `Principal: ${serviceAccountEmail}`,
      `Rol: ${roleId}`,
      "Guardar",
    ],
  };
}

export function billingInstructions() {
  return {
    link: LINKS.billingBlaze,
    steps: [
      `Abrir: ${LINKS.billingBlaze}`,
      "Seleccionar plan Blaze (pay-as-you-go)",
      "Vincular cuenta de facturación de Google Cloud",
      "Volver a ejecutar: npm run wallet:setup",
    ],
  };
}

export function oauthConsentInstructions() {
  return {
    link: LINKS.oauthConsent,
    steps: [
      `Abrir: ${LINKS.oauthConsent}`,
      "Tipo de usuario: Externo (o Interno si tienes Google Workspace)",
      "Nombre de la app: Más Café Wallet",
      "Correo de asistencia: tu correo",
      "Dominios autorizados: xn--mascaf-gva.com",
      "Guardar y continuar hasta Publicar (modo Prueba sirve para empezar)",
      `Luego verificar Google sign-in: ${LINKS.authProviders}`,
    ],
  };
}

export function serviceAccountKeyInstructions() {
  return {
    link: LINKS.serviceAccounts,
    steps: [
      `Abrir: ${LINKS.serviceAccounts}`,
      "Generar nueva clave privada (JSON)",
      "Copiar TODO el JSON en GitHub Secret FIREBASE_SERVICE_ACCOUNT",
      `Panel secrets: ${LINKS.githubSecrets}`,
      `Ejecutar workflow: ${LINKS.workflowSetup}`,
    ],
  };
}
