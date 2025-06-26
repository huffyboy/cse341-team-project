import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();

const SERVER_URL = process.env.SERVER_URL;

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Movie Tracker API',
			version: '1.0.0',
			description:
				'API documentation for Movie Tracker - a social movie tracking application\n\n' +
				'**Authentication**: This API uses GitHub OAuth for authentication. ' +
				`To authenticate, [click here to log in with GitHub](${SERVER_URL}/auth/github).\n\n` +
				'The "Authorize" button will not work due to browser and CORS restrictions.',
		},
		servers: [
			{
				url: process.env.SERVER_URL,
				description: 'Development server',
			},
		],
		tags: [
			{
				name: 'Authentication',
				description: 'OAuth authentication endpoints',
			},
			{
				name: 'Users',
				description: 'User profile and movie collection management',
			},
			{
				name: 'Movies',
				description: 'Global movie database operations',
			},
			{
				name: 'Reviews',
				description: 'Movie review operations',
			},
		],
		components: {
			securitySchemes: {
				sessionAuth: {
					type: 'apiKey',
					in: 'cookie',
					name: 'connect.sid',
					description: 'Session cookie for authentication. This is automatically set after successful OAuth authentication. You cannot manually set this - you must authenticate via OAuth first by visiting /auth/github in your browser.',
				},
				oauth2: {
					type: 'oauth2',
					description: 'GitHub OAuth 2.0 authentication',
					flows: {
						authorizationCode: {
							authorizationUrl: 'https://github.com/login/oauth/authorize',
							tokenUrl: 'https://github.com/login/oauth/access_token',
							scopes: {
								'user:email': 'Access to user email addresses',
								'read:user': 'Access to read user profile data'
							}
						}
					}
				}
			},
			schemas: {
				User: {
					type: 'object',
					properties: {
						_id: {
							type: 'string',
							description: 'User ID',
						},
						name: {
							type: 'string',
							description: 'User name',
						},
						email: {
							type: 'string',
							description: 'User email',
						},
						githubId: {
							type: 'string',
							description: 'GitHub ID',
						},
						githubUsername: {
							type: 'string',
							description: 'GitHub username',
						},
						avatarUrl: {
							type: 'string',
							description: 'User avatar URL',
						},
						createdAt: {
							type: 'string',
							format: 'date-time',
						},
						updatedAt: {
							type: 'string',
							format: 'date-time',
						},
					},
				},
				Movie: {
					type: 'object',
					properties: {
						_id: {
							type: 'string',
							description: 'Movie ID',
						},
						title: {
							type: 'string',
							description: 'Movie title',
						},
						year: {
							type: 'number',
							description: 'Release year',
						},
						rating: {
							type: 'string',
							description: 'Content rating (PG-13, PG, etc.)',
						},
						genre: {
							type: 'array',
							description: 'Array of genres',
							items: {
								type: 'string',
								description: 'Genre name',
							},
						},
						length: {
							type: 'number',
							description: 'Movie length in minutes',
						},
						description: {
							type: 'string',
							description: 'Movie description',
						},
						director: {
							type: 'string',
							description: 'Movie director',
						},
						posterUrl: {
							type: 'string',
							description: 'Movie poster URL',
						},
						createdAt: {
							type: 'string',
							format: 'date-time',
						},
						updatedAt: {
							type: 'string',
							format: 'date-time',
						},
					},
				},
				Review: {
					type: 'object',
					properties: {
						_id: {
							type: 'string',
							description: 'Review ID',
						},
						movie: {
							type: 'string',
							description: 'Movie ID',
						},
						user: {
							type: 'string',
							description: 'User ID',
						},
						rating: {
							type: 'number',
							minimum: 1,
							maximum: 5,
							description: 'Rating (1-5)',
						},
						message: {
							type: 'string',
							description: 'Review message',
						},
						createdAt: {
							type: 'string',
							format: 'date-time',
						},
						updatedAt: {
							type: 'string',
							format: 'date-time',
						},
					},
				},
				UserMovie: {
					type: 'object',
					properties: {
						_id: {
							type: 'string',
							description: 'UserMovie ID',
						},
						user: {
							type: 'string',
							description: 'User ID',
						},
						movie: {
							type: 'string',
							description: 'Movie ID',
						},
						status: {
							type: 'string',
							enum: ['planned_to_watch', 'watching', 'watched', 'dropped'],
							description: 'Watch status',
						},
						createdAt: {
							type: 'string',
							format: 'date-time',
						},
						updatedAt: {
							type: 'string',
							format: 'date-time',
						},
					},
				},
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
				UnauthorizedError: {
					description: 'Authentication required',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/Error',
							},
						},
					},
				},
				NotFoundError: {
					description: 'Resource not found',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/Error',
							},
						},
					},
				},
				ValidationError: {
					description: 'Validation error',
					content: {
						'application/json': {
							schema: {
								$ref: '#/components/schemas/Error',
							},
						},
					},
				},
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
