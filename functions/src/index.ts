/**
 * @fileoverview Punto de entrada para las Firebase Functions.
 * Este archivo inicializa la instancia de Express y la exporta como una función HTTP
 * llamada 'api', que gestionará todas las rutas definidas en la aplicación.
 *
 * Se encarga de la integración con Firebase Cloud Functions.
 * Documentación de Firebase Functions: https://firebase.google.com/docs/functions
 */

import * as functions from 'firebase-functions';
import app from './app';

// Exporta la instancia de Express como una Firebase Function de tipo 'onRequest'.
// Esto crea un único endpoint HTTP (llamado 'api') que sirve toda la aplicación Express.
// Cualquier request a /api/** será manejada por la app de Express.
export const api = functions.https.onRequest(app);
