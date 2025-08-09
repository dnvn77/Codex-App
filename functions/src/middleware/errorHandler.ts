/**
 * @fileoverview Middleware centralizado para manejar errores.
 */
import { Request, Response, NextFunction } from 'express';
import { FirebaseFunctionsRateLimiterError } from 'firebase-functions/lib/v2/providers/options';

/**
 * Middleware de Express para capturar y manejar errores de forma centralizada.
 * Proporciona una respuesta JSON consistente para los errores.
 *
 * @param err - El objeto de error.
 * @param req - El objeto de la petición de Express.
 * @param res - El objeto de la respuesta de Express.
 * @param next - La función para pasar el control al siguiente middleware (no se usa aquí).
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`Error en la ruta ${req.path}:`, err);

  // Manejo de errores específicos si es necesario.
  // Por ejemplo, errores de rate-limiting de Firebase Functions.
  if (err instanceof FirebaseFunctionsRateLimiterError) {
      return res.status(429).json({
          error: {
              code: 'TOO_MANY_REQUESTS',
              message: 'Límite de peticiones excedido.',
          },
      });
  }
  
  // Respuesta de error genérica
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Ha ocurrido un error inesperado en el servidor.',
    },
  });
};
