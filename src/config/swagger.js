import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Movie Tracker API',
			version: '1.0.0',
			description:
				'API documentation for Movie Tracker - a social movie tracking application',
		},
		servers: [
			{
				url: process.env.SERVER_URL,
			},
		],
		tags: [
			{
				name: 'Hello World',
				description: 'Basic API endpoints',
			},
		],
		components: {
			schemas: {
				Error: {
					type: 'object',
					properties: {
						error: {
							type: 'string',
							description: 'Error message',
						},
					},
				},
			},
			responses: {
				InternalServerError: {
					description: 'Internal Server Error',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/Error',
							},
						},
					},
				},
			},
		},
	},
	apis: ['./src/server.js', './src/routes/*.js'],
};

export const specs = swaggerJsdoc(options);
