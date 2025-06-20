import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { specs } from './config/swagger.js';
import connectDB from './config/database.js';
import simpleLogger from './middlewares/logger.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import tempRoutes from './routes/temp.js';

// Setup
dotenv.config();
connectDB();
const app = express();
const PORT = process.env.PORT;
const SERVER_URL = process.env.SERVER_URL;

// Middleware
app.use(helmet());
app.use(simpleLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', tempRoutes); // Temporary test routes as base route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Error Handling
app.use(errorHandler);
app.use(notFoundHandler);

// Start Server
app.listen(PORT, () => {
	console.log(`Server is running at ${SERVER_URL}`);
	console.log(`API Documentation available at ${SERVER_URL}/api-docs`);
});
