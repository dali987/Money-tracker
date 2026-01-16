import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
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
