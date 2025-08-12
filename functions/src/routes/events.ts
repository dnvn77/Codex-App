
/**
 * @fileoverview Rutas de Express para la recolección de eventos de analítica.
 * Este endpoint es público y no requiere autenticación por API Key.
 */

import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validateRequest';
import { supabase } from '../services/supabase';

const router = Router();

// Define el esquema de validación para los eventos usando Zod.
// Coincide con la tabla `event_logs` de Supabase.
const eventSchema = z.object({
  session_id: z.string().uuid('session_id debe ser un UUID válido.'),
  event_type: z.string().min(1, 'event_type es requerido.'),
  client_timestamp: z.string().datetime('client_timestamp debe ser una fecha y hora ISO 8601 válida.'),
  screen: z.string().min(1, 'screen es requerido.'),
  device_type: z.string().min(1, 'device_type es requerido.'),
  language: z.string().min(1, 'language es requerido.'),
  ui_theme: z.string().min(1, 'ui_theme es requerido.'),
  screen_time_seconds: z.number().optional(),
  error_code: z.string().optional(),
}).strict(); // Rechaza campos no definidos

/**
 * @route   POST /events/log
 * @desc    Registra un evento de analítica del frontend en Supabase.
 * @access  Público
 */
router.post('/log', validateRequest({ body: eventSchema }), async (req, res, next) => {
  try {
    const validatedEvent = req.body;
    
    // Guarda el evento en la base de datos de Supabase.
    // La tabla se llama 'event_logs'.
    const { error } = await supabase
      .from('event_logs')
      .insert([validatedEvent]);

    if (error) {
      console.error('Error guardando evento en Supabase:', error);
      // Lanza el error para que sea manejado por el errorHandler central.
      throw new Error(`No se pudo guardar el evento: ${error.message}`);
    }

    // Se responde con 202 Accepted para indicar que la petición ha sido recibida
    // y procesada correctamente.
    res.status(202).json({ message: 'Event received and stored' });

  } catch (error) {
    // Los errores de validación de Zod ya son manejados por el middleware `validateRequest`.
    // Pasamos cualquier otro error (como el de Supabase) al manejador central.
    next(error);
  }
});

export default router;
