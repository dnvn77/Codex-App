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
import { errorHandler } from './middleware/errorHandler';
import { z } from 'zod';

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

// La autenticación por API Key se aplica a todas las rutas excepto al log de eventos
app.use('/wallet', authenticateApiKey, walletRoutes);
app.use('/tx', authenticateApiKey, txRoutes);
app.use('/zk', authenticateApiKey, zkRoutes);


// --- Endpoint de Analítica (sin autenticación de API Key) ---

const eventSchema = z.object({
  session_id: z.string().uuid(),
  event_type: z.string().min(1),
  timestamp: z.string().datetime(),
  screen: z.string(),
  device_type: z.string(),
  language: z.string(),
  ui_theme: z.string(),
});

app.post('/log-event', async (req, res, next) => {
    try {
        // Validar el cuerpo del evento
        const validatedEvent = eventSchema.parse(req.body);
        
        console.log('Evento recibido:', validatedEvent);

        // TODO: Implement Supabase client to save validatedEvent
        // Ejemplo:
        // const { data, error } = await supabase
        //   .from('event_logs')
        //   .insert([validatedEvent]);
        // if (error) throw error;

        res.status(202).json({ message: 'Event received' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: {
                    code: 'BAD_REQUEST',
                    message: 'Invalid event format.',
                    details: error.flatten().fieldErrors,
                },
            });
        }
        // Pasar otros errores al manejador central
        next(error);
    }
});


// --- Manejo de Errores ---
// Middleware para manejar errores de forma centralizada.
app.use(errorHandler);

export default app;
