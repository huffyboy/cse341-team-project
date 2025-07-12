# Movie Tracker

A social movie tracking API that allows users to create and manage their movie collection, add reviews, track their watch status, and share their movie interests with friends.

## Project Overview

**Movie Tracker** is a RESTful API built with Node.js, Express, and MongoDB that provides a solution for tracking personal movie collections with social features. Users can authenticate via GitHub OAuth, add movies to their collection, write reviews, track their watch status, and discover what movies their friends are watching or interested in.

## Features

- **GitHub OAuth Authentication** - Secure login using GitHub accounts
- **Movie Management** - Add, update, and delete movies from your collection
- **Review System** - Rate and review movies with detailed comments
- **Watch Status Tracking** - Track which movies you've watched, want to watch, or are currently watching
- **Social Features** - Share your movie interests and see what friends are watching
- **Advanced Filtering** - Filter movies by genre, year, rating, and more
- **RESTful API** - Clean, well-documented API endpoints
- **Security** - Implemented with web security best practices

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: GitHub OAuth 2.0
- **Validation**: Express Validator
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier

## Project Structure

```
src/
├── config/          # Database, Swagger, and Passport configuration
├── controllers/     # Core business logic
├── middlewares/     # Authentication, error handling, validation
├── models/          # Mongoose schema definitions
├── routes/          # API endpoint definitions
└── server.js        # Main application entry point
```

## Database Schema

### Collections

#### Users

- `_id`: ObjectId
- `name`: String (from GitHub profile)
- `email`: String (from GitHub profile)
- `oauthId`: String
- `createdAt`: Date (Mongoose timestamp)
- `updatedAt`: Date (Mongoose timestamp)

#### Movies

- `_id`: ObjectId
- `title`: String
- `year`: Number
- `rating`: String (PG-13, PG, etc.)
- `genre`: Array of Strings
- `length`: Number (in minutes)
- `description`: String
- `director`: String
- `posterUrl`: String
- `createdAt`: Date (Mongoose timestamp)
- `updatedAt`: Date (Mongoose timestamp)

#### UserMovies

- `_id`: ObjectId
- `_userId`: ObjectId (reference to Users)
- `movieId`: ObjectId (reference to Movies)
- `status`: String (watched, watching, want-to-watch)
- `createdAt`: Date (Mongoose timestamp)
- `updatedAt`: Date (Mongoose timestamp)

#### Reviews

- `_id`: ObjectId
- `movie`: ObjectId (reference to Movies)
- `user`: ObjectId (reference to Users)
- `rating`: Number (1-5 scale)
- `message`: String
- `createdAt`: Date (Mongoose timestamp)
- `updatedAt`: Date (Mongoose timestamp)

## Authentication

The API uses GitHub OAuth 2.0 for secure authentication:

1. **Login Process**: Redirect to `/auth/github`
2. **Callback**: Handle GitHub OAuth callback at `/auth/github/callback`
3. **Session Management**: Uses Express sessions for stateful authentication
4. **Logout**: Destroy session at `/auth/logout`

## API Endpoints

### Authentication

- `GET /auth/github` - Initiate GitHub OAuth login
- `GET /auth/github/callback` - GitHub OAuth callback
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user profile

### Users

- `PUT /users/me` - Update user profile
- `DELETE /users/me` - Delete user account

### Movies

- `GET /movies` - List all movies (with filtering)
- `GET /movies/:movieId` - Get specific movie
- `POST /movies` - Add new movie (requires authentication)
- `PUT /movies/:movieId` - Update movie (requires authentication)
- `DELETE /movies/:movieId` - Delete movie (requires authentication)

### User Movies

- `GET /users/me/movies` - Get user's movie collection (with filtering)
- `POST /users/me/movies` - Add movie to user's collection
- `GET /users/me/movies/:movieId` - Get specific user movie
- `PUT /users/me/movies/:movieId` - Update user movie status
- `DELETE /users/me/movies/:movieId` - Remove movie from collection

### User Reviews

- `GET /users/me/reviews` - Get all reviews by the authenticated user
- `GET /users/me/movies/:movieId/review` - Get user's review for a specific movie
- `POST /users/me/movies/:movieId/review` - Create a review for a movie
- `PUT /users/me/movies/:movieId/review` - Update user's review for a movie
- `DELETE /users/me/movies/:movieId/review` - Delete user's review for a movie

### Movie Reviews (Administrative)

- `GET /movies/:movieId/reviews` - Get all reviews for a specific movie
- `PUT /movies/:movieId/reviews` - Update any review for a movie (administrative)
- `DELETE /movies/:movieId/reviews` - Delete any review for a movie (administrative)

### Direct Review Management (Administrative)

- `PUT /reviews/:reviewId` - Update any review by ID (administrative)
- `DELETE /reviews/:reviewId` - Delete any review by ID (administrative)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database
- GitHub OAuth application

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd cse341-team-project
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   SESSION_SECRET=your_session_secret
   ```

4. **Start the development server**
   ```bash
   pnpm run dev
   ```

### Available Scripts

- `pnpm start` - Start production server
- `pnpm dev` - Start development server with nodemon
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors
- `pnpm format` - Format code with Prettier
- `pnpm test` - Run tests
- `pnpm check` - Run format and lint checks

## Security Features

- **OAuth 2.0 Authentication** - Secure third-party authentication
- **Input Validation** - Server-side validation using Express Validator
- **Session Security** - Secure session management
- **Data Isolation** - Users can only access their own data
- **Helmet.js** - Security headers protection
- **CORS Protection** - Cross-origin resource sharing security

## Team

- **Kathryn Lingard** - User management and movie filtering
- **Aaron Topping** - Authentication and middleware
- **Michael Huff** - Database setup and movie CRUD operations

## Development Timeline

- **Lesson 9**: Project initialization and infrastructure setup
- **Lesson 10**: Basic Express setup and movie endpoints
- **Lesson 11**: OAuth authentication implementation
- **Lesson 12**: User movie management and reviews
- **Lesson 13**: API documentation and final testing

## Testing

The project includes comprehensive testing using Jest. Run tests with:

```bash
pnpm test
```

## API Documentation

API documentation is available via Swagger UI when the server is running at:
`/api-docs`

## License

This project is licensed under the ISC License.

---
