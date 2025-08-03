# Chain Indexer

A blockchain event indexing system that monitors and stores LINK token transfer events from the Sepolia testnet. Built with NestJS backend, React frontend, and PostgreSQL database.

## 🚀 Features

- **Real-time Event Monitoring**: Listens to LINK token transfer events on Sepolia testnet
- **Historical Data Indexing**: Indexes all historical transfer events from contract creation
- **Web Dashboard**: Modern React frontend to browse and search transfer events
- **Queue-based Processing**: Uses BullMQ for reliable event processing
- **Database Storage**: PostgreSQL with TypeORM for data persistence
- **Monorepo Architecture**: Built with Nx for efficient development

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Redis server
- Sepolia testnet RPC and WebSocket endpoints

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd chain-indexer
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/chain_indexer

   # Redis
   REDIS_URL=redis://localhost:6379

   # Blockchain (Sepolia testnet)
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
   SEPOLIA_WS_URL=wss://sepolia.infura.io/ws/v3/YOUR_PROJECT_ID

   # Server
   PORT=3000
   ```

4. **Set up the database**

   ```bash
   # Create PostgreSQL database
   createdb chain_indexer
   ```

5. **Start Redis**

   ```bash
   # On Windows (if using WSL or Docker)
   redis-server

   # On macOS/Linux
   brew services start redis
   ```

## 🚀 Running the Application

### Development Mode

Start both frontend and backend in development mode:

```bash
# Start backend server
npm run back

# Start frontend development server
npm run front
```

The application will be available at:

- Frontend: http://localhost:4200
- Backend API: http://localhost:3000/api

### Production Build

```bash
# Build all applications
nx build backend
nx build frontend

# Serve production build
nx serve backend --configuration=production
```

## 🏗️ Project Structure

```
chain-indexer/
├── apps/
│   ├── backend/                 # NestJS API server
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── entities/    # Database entities
│   │   │   │   ├── modules/     # Feature modules
│   │   │   │   └── contracts/   # Smart contract ABIs
│   │   │   └── main.ts
│   │   └── package.json
│   └── frontend/                # React web application
│       ├── src/
│       │   └── app/
│       └── package.json
├── shared-interfaces/           # Shared TypeScript interfaces
│   └── src/
│       └── lib/
└── package.json
```

## 🔧 Configuration

### Blockchain Configuration

The application is configured to monitor the LINK token contract on Sepolia testnet:

- **Contract Address**: `0x779877A7B0D9E8603169DdbD7836e478b4624789`
- **Network**: Sepolia testnet
- **Event**: `Transfer(address,address,uint256)`

### Database Schema

The main entity is `TransferEventEntity` with the following fields:

- `transactionHash`: Unique transaction identifier
- `fromAddress`: Sender address
- `toAddress`: Recipient address
- `value`: Transfer amount (in wei)
- `blockNumber`: Block number
- `transactionDate`: Transaction timestamp
- `createdAt`: Record creation timestamp

## 📊 API Endpoints

### GET /api/transfers

Retrieve paginated transfer events.

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 25)

**Response:**

```json
{
  "data": [
    {
      "transactionHash": "0x...",
      "fromAddress": "0x...",
      "toAddress": "0x...",
      "value": "1000000000000000000",
      "blockNumber": 12345678,
      "transactionDate": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1000
}
```

## 🧪 Development

### Available Nx Commands

```bash
# Build applications
nx build backend
nx build frontend

# Run tests
nx test backend
nx test frontend

# Lint code
nx lint backend
nx lint frontend

# Type checking
nx typecheck backend
nx typecheck frontend
```

### Adding New Features

1. **Backend Modules**: Create new modules in `apps/backend/src/app/modules/`
2. **Frontend Components**: Add React components in `apps/frontend/src/app/`
3. **Shared Interfaces**: Define shared types in `shared-interfaces/src/lib/`

## 🔍 Monitoring

The application includes comprehensive logging:

- Blockchain service logs connection status and event processing
- Event processor logs job processing and database operations
- Error handling with retry mechanisms for failed operations

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Verify PostgreSQL is running
   - Check `DATABASE_URL` in `.env`
   - Ensure database exists

2. **Redis Connection Error**

   - Verify Redis server is running
   - Check `REDIS_URL` in `.env`

3. **Blockchain Connection Error**

   - Verify RPC and WebSocket URLs
   - Check network connectivity
   - Ensure valid Infura project ID

4. **Build Errors**
   - Clear Nx cache: `nx reset`
   - Reinstall dependencies: `rm -rf node_modules && npm install`

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions, please create an issue in the repository.
