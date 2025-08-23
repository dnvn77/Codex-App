/**
 * @fileoverview Rutas de Express para el registro de eventos de analítica.
 */

import { Router } from 'express';
import { validateRequest } from '../middleware/validateRequest';
import { AnalyticsEventSchema } from '../types';
import { logAnalyticsEvent } from '../services/supabase';

const router = Router();

/**
 * @route   POST /analytics/log
 * @desc    Registra un evento de analítica desde el frontend.
 * @access  Público (detrás de un rate limiter)
 */
router.post('/log', validateRequest({ body: AnalyticsEventSchema }), async (req, res, next) => {
    try {
        const eventData = req.body;
        // La IP se puede obtener de req.ip si es necesario, pero para analítica básica no es requerido.
        const result = await logAnalyticsEvent(eventData);

        res.status(201).json({
            message: 'Evento registrado exitosamente.',
            data: result
        });
    } catch(error) {
        next(error);
    }
});

export default router;
