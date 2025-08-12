
/**
 * @fileoverview Configuración principal de la aplicación Express.
 * Este archivo instancia Express, aplica middlewares globales (CORS, body-parser,
 * rate-limiting, y autenticación de API key) y monta las rutas de la API.
 */

import * as express from 'express';
import * as cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { authenticateApiKey } from './middleware/auth';
import walletRoutes from './routes/wallet';
import txRoutes from './routes/tx';
import zkRoutes from './routes/zk';
import eventsRoutes from './routes/events';
import feedbackRoutes from './routes/feedback'; // Importar la nueva ruta de feedback
import { errorHandler } from './middleware/errorHandler';

// Inicializar la aplicación Express
const app = express();

// --- Middlewares Globales ---

// Habilitar CORS - por ahora permite todos los orígenes.
// Para producción, se puede restringir a los dominios de Make.com.
app.use(cors({ origin: true }));

// Parsear cuerpos de request JSON. Límite de 4KB para el cuerpo.
app.use(express.json({ limit: '4kb' }));

// Limitar la tasa de peticiones para prevenir abuso.
// 10 peticiones por minuto por IP para el endpoint de feedback.
const feedbackLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Demasiadas peticiones, por favor intente más tarde.' } },
});

// 60 peticiones por minuto por IP para el resto de la API.
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Demasiadas peticiones, por favor intente más tarde.' } },
});

// --- Rutas de la API ---

// Las rutas de wallet, tx y zk requieren autenticación por API Key
app.use('/wallet', apiLimiter, authenticateApiKey, walletRoutes);
app.use('/tx', apiLimiter, authenticateApiKey, txRoutes);
app.use('/zk', apiLimiter, authenticateApiKey, zkRoutes);

// Las rutas de eventos y feedback son públicas y no requieren API Key
app.use('/events', apiLimiter, eventsRoutes);
app.use('/feedback', feedbackLimiter, feedbackRoutes);

// --- Manejo de Errores ---
// Middleware para manejar errores de forma centralizada.
app.use(errorHandler);

export default app;
