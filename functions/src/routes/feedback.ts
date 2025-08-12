/**
 * @fileoverview Rutas de Express para la recolección de feedback de micro-encuestas.
 * Este endpoint es público y no requiere autenticación por API Key.
 */

import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validateRequest';
import { supabaseAdmin } from '../services/supabase';

const router = Router();

// Define el esquema de validación para los eventos de feedback usando Zod.
// Se asegura de que no lleguen campos no permitidos (PII).
const feedbackSchema = z.object({
  session_id: z.string().uuid('session_id debe ser un UUID válido.'),
  event_type: z.string().min(1, 'event_type es requerido.'),
  screen: z.string().min(1, 'screen es requerido.'),
  question_id: z.string().min(1, 'question_id es requerido.'),
  response_choice: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  screen_time_seconds: z.number().positive('screen_time_seconds debe ser un número positivo.'),
  ui_theme: z.string().min(1, 'ui_theme es requerido.'),
  language: z.string().min(1, 'language es requerido.'),
  device_type: z.string().min(1, 'device_type es requerido.'),
  client_timestamp: z.string().datetime('client_timestamp debe ser una fecha y hora ISO 8601 válida.'),
}).strict() // El modo estricto rechaza cualquier campo no definido en el esquema.
  .refine(data => data.response_choice !== undefined || data.rating !== undefined, {
    message: "Debe proporcionarse 'response_choice' o 'rating'.",
    path: ["response_choice", "rating"],
  });

/**
 * @route   POST /feedback/log
 * @desc    Registra un evento de feedback de micro-encuesta en Supabase.
 * @access  Público
 */
router.post('/log', validateRequest({ body: feedbackSchema }), async (req, res, next) => {
  try {
    const validatedFeedback = req.body;

    // Renombra 'client_timestamp' para que coincida con la columna de la base de datos
    const { client_timestamp, ...restOfFeedback } = validatedFeedback;
    const feedbackToInsert = {
        ...restOfFeedback,
        client_timestamp: client_timestamp,
    };
    
    // Guarda el evento en la tabla 'feedback_events' usando el cliente de admin
    // para saltarse las políticas de RLS.
    const { error } = await supabaseAdmin
      .from('feedback_events')
      .insert([feedbackToInsert]);

    if (error) {
      console.error('Error guardando feedback en Supabase:', error);
      // Lanza el error para que sea manejado por el errorHandler central.
      throw new Error(`No se pudo guardar el evento de feedback: ${error.message}`);
    }

    // Opcionalmente, loguea un identificador en producción en lugar del payload completo.
    if (process.env.NODE_ENV !== 'production') {
        console.log("Feedback event logged for session:", validatedFeedback.session_id);
    }

    // Se responde con 202 Accepted para indicar que la petición ha sido recibida
    // y procesada correctamente.
    res.status(202).json({ status: 'queued' });

  } catch (error) {
    // Los errores de validación de Zod ya son manejados por el middleware `validateRequest`.
    // Pasamos cualquier otro error (como el de Supabase) al manejador central.
    next(error);
  }
});

export default router;
