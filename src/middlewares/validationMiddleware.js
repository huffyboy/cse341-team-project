// Express Validation

import { validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	return next();
};

export default handleValidationErrors;
