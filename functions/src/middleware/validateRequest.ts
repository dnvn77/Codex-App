/**
 * @fileoverview Middleware para validar los cuerpos de las peticiones usando Zod.
 */
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

interface ValidationSchemas {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

/**
 * Factory que crea un middleware de Express para validar diferentes partes
 * de una petición (body, query, params) contra esquemas de Zod.
 *
 * @param {ValidationSchemas} schemas - Un objeto que contiene los esquemas de Zod.
 * @returns Un middleware de Express.
 */
export const validateRequest = (schemas: ValidationSchemas) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: {
            code: 'BAD_REQUEST',
            message: 'La petición tiene un formato inválido.',
            details: error.flatten().fieldErrors,
          },
        });
      } else {
        next(error);
      }
    }
};
