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
import eventsRoutes from './routes/events'; // Importar la nueva ruta de eventos
import { errorHandler } from './middleware/errorHandler';

// Inicializar la aplicación Express
const app = express();

// --- Middlewares Globales ---

// Habilitar CORS - por ahora permite todos los orígenes.
// Para producción, se puede restringir a los dominios de Make.com.
app.use(cors({ origin: true }));

// Parsear cuerpos de request JSON
app.use(express.json());

// Limitar la tasa de peticiones para prevenir abuso.
// 60 peticiones por minuto por IP.
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Demasiadas peticiones, por favor intente más tarde.' } },
});
app.use(limiter);

// --- Rutas de la API ---

// Las rutas de wallet, tx y zk requieren autenticación por API Key
app.use('/wallet', authenticateApiKey, walletRoutes);
app.use('/tx', authenticateApiKey, txRoutes);
app.use('/zk', authenticateApiKey, zkRoutes);

// La ruta de eventos es pública y no requiere API Key
app.use('/events', eventsRoutes);


// --- Manejo de Errores ---
// Middleware para manejar errores de forma centralizada.
app.use(errorHandler);

export default app;
