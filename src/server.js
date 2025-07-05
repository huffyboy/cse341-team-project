import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import configurePassport from './config/passport.js';
import { specs } from './config/swagger.js';
import connectDB from './config/database.js';
import simpleLogger from './middlewares/logger.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

// Setup
dotenv.config();
connectDB();
const app = express();
const PORT = process.env.PORT || 3000; // Provide a default port
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

// Passport Configuration
configurePassport(passport);

// Middleware
app.use(helmet());
app.use(simpleLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Session Middleware
app.use(
	session({
		secret: process.env.SESSION_SECRET || '123xxxx345', // placeholder til Render has SESSION_SECRET added
		resave: false, // Don't save session if unmodified
		saveUninitialized: false, // Don't create session until something stored
		store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
		cookie: {
			secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
			httpOnly: true, // Prevent client-side JS from accessing the cookie
			maxAge: 1000 * 60 * 60 * 24, // 1 day, for example
		},
	})
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/movies', movieRoutes);
app.use('/reviews', reviewRoutes);

// Simplified landing page with just a few links
app.get('/', (req, res) => {
	const html = `
<!DOCTYPE html>
<html>
<head>
  <title>My Movie Vault API</title>
  <style>
    body { font-family: system-ui; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 400px; margin: 100px auto; text-align: center; }
    h1 { color: #333; margin-bottom: 30px; }
    a { display: block; padding: 12px; margin: 8px 0; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
    a:hover { background: #0056b3; }
  </style>
</head>
<body>
  <div class="container">
    <h1>My Movie Vault API</h1>
    <a href="/api-docs">API Documentation</a>
    <a href="/auth/github">Login with GitHub</a>
  </div>
</body>
</html>`;
	res.send(html);
});

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Error Handling
app.use(errorHandler);
app.use(notFoundHandler);

// Start Server
app.listen(PORT, () => {
	console.log(`Server is running at ${SERVER_URL}`);
	console.log(`API Documentation available at ${SERVER_URL}/api-docs`);
	console.log(`GitHub Auth starts at ${SERVER_URL}/auth/github`);
});
