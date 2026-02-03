import { z } from 'zod';

export const validateQuery = (schema) => (req, res, next) => {
    try {
        const validatedQuery = schema.parse(req.query);
        // In Express 5, req.query is a read-only getter.
        // We use Object.defineProperty to shadow it with the validated data
        // so that downstream controllers get the transformed/coerced values.
        Object.defineProperty(req, 'query', {
            value: validatedQuery,
            writable: true,
            configurable: true,
            enumerable: true,
        });
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors.map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: errorMessages,
            });
        }
        next(error);
    }
};
