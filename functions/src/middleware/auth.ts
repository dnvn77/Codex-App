
/**
 * @fileoverview Middleware de autenticación para proteger los endpoints.
 * Verifica la presencia y validez de una API key en las cabeceras de la petición.
 */

import type { Request, Response, NextFunction } from 'express';
import { config } from '../config';

/**
 * Middleware de Express para autenticar peticiones usando una API Key.
 * La clave debe ser enviada en la cabecera 'X-API-Key'.
 *
 * @param req - El objeto de la petición de Express.
 * @param res - El objeto de la respuesta de Express.
 * @param next - La función para pasar el control al siguiente middleware.
 */
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.header('X-API-Key');

  if (!apiKey) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Acceso no autorizado: Falta la cabecera X-API-Key.',
      },
    });
  }

  if (apiKey !== config.API_KEY_BACKEND) {
    return res.status(403).json({
      error: {
        code: 'FORBIDDEN',
        message: 'Acceso denegado: La API Key proporcionada es inválida.',
      },
    });
  }

  next();
};
