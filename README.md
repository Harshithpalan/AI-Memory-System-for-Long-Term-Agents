# AI Memory System for Long-Term Agents

A web application for managing and organizing memories for AI agents. This system allows users to create multiple AI agents, store memories with metadata, search through memories, and organize them by importance and type.

## Features

- **User Authentication**: Register and login with secure JWT-based authentication
- **Agent Management**: Create and manage multiple AI agents with different types
- **Memory Storage**: Store memories with content, type, importance ratings, tags, and metadata
- **Search Functionality**: Search memories by content or tags
- **Organization**: Filter memories by agent, type, and importance
- **RESTful API**: Full-featured backend API with PostgreSQL database

## Tech Stack

### Backend
- Node.js with Express
- PostgreSQL database
- JWT authentication
- bcryptjs for password hashing

### Frontend
- React
- React Router for navigation
- Axios for API calls
- Context API for state management

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Setup Instructions

### 1. Database Setup

Install PostgreSQL and create a database:

```bash
# Create database
createdb ai_memory_system
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# Example:
# PORT=5000
# DATABASE_URL=postgresql://username:password@localhost:5432/ai_memory_system
# JWT_SECRET=your_jwt_secret_key_here
# NODE_ENV=development

# Initialize database tables
npm run init-db

# Start development server
npm run dev
```

The backend API will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Agents
- `POST /api/agents` - Create a new agent
- `GET /api/agents` - Get all agents for current user
- `GET /api/agents/:id` - Get specific agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `GET /api/agents/:id/memories` - Get memories for a specific agent

### Memories
- `POST /api/memories` - Create a new memory
- `GET /api/memories` - Get all memories (with optional filters)
- `GET /api/memories/:id` - Get specific memory
- `PUT /api/memories/:id` - Update memory
- `DELETE /api/memories/:id` - Delete memory
- `GET /api/memories/search/:query` - Search memories
- `GET /api/memories/importance/:threshold` - Get memories by importance

## Database Schema

### Users
- id (SERIAL PRIMARY KEY)
- username (VARCHAR(50) UNIQUE)
- email (VARCHAR(100) UNIQUE)
- password_hash (VARCHAR(255))
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Agents
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER REFERENCES users)
- name (VARCHAR(100))
- description (TEXT)
- agent_type (VARCHAR(50))
- config (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### Memories
- id (SERIAL PRIMARY KEY)
- agent_id (INTEGER REFERENCES agents)
- user_id (INTEGER REFERENCES users)
- content (TEXT)
- memory_type (VARCHAR(50))
- importance (INTEGER)
- tags (TEXT[])
- metadata (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- accessed_at (TIMESTAMP)

### Memory Relationships
- id (SERIAL PRIMARY KEY)
- source_memory_id (INTEGER REFERENCES memories)
- target_memory_id (INTEGER REFERENCES memories)
- relationship_type (VARCHAR(50))
- strength (FLOAT)
- created_at (TIMESTAMP)

## Usage

1. Register a new account or login
2. Create agents to represent different AI personalities or use cases
3. Add memories to agents with relevant content, tags, and importance ratings
4. Search through memories using the search bar
5. Filter memories by agent or importance
6. Delete memories or agents as needed

## Development

### Backend Development
```bash
cd backend
npm run dev  # Starts with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start    # Starts React development server
```

## Future Enhancements

- Vector embeddings for semantic search
- Memory relationship graph visualization
- Export/import memories
- Advanced filtering and sorting options
- Memory analytics and insights
- Real-time updates with WebSockets
- Memory expiration and archival
- Collaborative agent memory sharing

## License

ISC
