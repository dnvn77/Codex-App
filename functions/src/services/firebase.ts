/**
 * @fileoverview Servicio para interactuar con Firebase Admin SDK.
 * Centraliza la inicialización de la app de Firebase y la instancia de Firestore.
 * Esto es opcional y solo necesario si decides guardar el mapeo de userId -> smartAccountAddress.
 *
 * Documentación de Firebase Admin SDK: https://firebase.google.com/docs/admin/setup
 */

import * as admin from 'firebase-admin';

// Inicializa la aplicación de Firebase Admin.
// Firebase Functions gestiona la configuración automáticamente cuando se despliega.
// Para emuladores locales, se conectará si están en ejecución.
try {
  admin.initializeApp();
} catch (e) {
  console.log('Firebase Admin SDK ya inicializado.');
}


// Exporta la instancia de Firestore para ser usada en otros servicios.
export const db = admin.firestore();
