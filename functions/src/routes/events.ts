/**
 * @fileoverview Rutas de Express para la recolección de eventos de analítica.
 * Este endpoint es público y no requiere autenticación por API Key.
 */

import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Define el esquema de validación para los eventos usando Zod.
const eventSchema = z.object({
  session_id: z.string().uuid('session_id debe ser un UUID válido.'),
  event_type: z.string().min(1, 'event_type es requerido.'),
  timestamp: z.string().datetime('timestamp debe ser una fecha y hora ISO 8601 válida.'),
  screen: z.string().min(1, 'screen es requerido.'),
  device_type: z.string().min(1, 'device_type es requerido.'),
  language: z.string().min(1, 'language es requerido.'),
  ui_theme: z.string().min(1, 'ui_theme es requerido.'),
}).nonstrict(); // Permite campos adicionales en el payload

/**
 * @route   POST /events/log
 * @desc    Registra un evento de analítica del frontend.
 * @access  Público
 */
router.post('/log', validateRequest({ body: eventSchema }), async (req, res, next) => {
  try {
    const validatedEvent = req.body;
    
    // Aquí es donde se debe guardar el evento en la base de datos (ej. Supabase).
    // Por ahora, solo lo logueamos en la consola del servidor.
    console.log('Evento de analítica recibido:', validatedEvent);

    // TODO: Implementar cliente de Supabase para guardar `validatedEvent`.
    // Ejemplo:
    // const { data, error } = await supabase
    //   .from('event_logs')
    //   .insert([validatedEvent]);
    // if (error) throw error;

    // Se responde con 202 Accepted para indicar que la petición ha sido recibida
    // pero el procesamiento (guardado en DB) es asíncrono.
    res.status(202).json({ message: 'Event received' });

  } catch (error) {
    // Los errores de validación de Zod ya son manejados por el middleware `validateRequest`.
    // Pasamos cualquier otro error al manejador central.
    next(error);
  }
});

export default router;
