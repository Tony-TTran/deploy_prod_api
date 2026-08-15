import logger from '#config/logger.js';
import { signUpSchema } from '#validate/auth.validation.js';
import { formatValidationErrors } from '#utils/format.js';

export const signup = async (req, res, next) => {
    try {
        const validationResult = signUpSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                message: 'Invalid input data',
                errors: validationResult.error.issues,
                detail: formatValidationErrors(validationResult.error) });
        }
        const { name, email, password } = validationResult.data;

        // AUT SERVICE
        logger.info('Creating user with email:', email);
        res.status(201).json({
            message: 'User created successfully',
            user: { name, email, password } });

    } catch (error) {
        logger.error('Error in signup controller:', error);
        if (error.message === 'User with this email already exists') {
            return res.status(409).json({ message: error.message });
        }
        next(error); // Pass the error to the global error handler
    }
}
