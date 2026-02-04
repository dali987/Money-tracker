import { z } from 'zod';

export const validateQuery = (schema) => (req, res, next) => {
    try {
        const validatedQuery = schema.parse(req.query);

        Object.defineProperty(req, 'query', {
            value: validatedQuery,
            writable: true,
            configurable: true,
            enumerable: true,
        });
        next();
    } catch (error) {
        next(error);
    }
};
