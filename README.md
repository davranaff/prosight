# Prosight API

NestJS API for working with locus data from RNAcentral database.

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18+)
- npm or yarn

### Installation
```bash
npm install
```

### Environment Setup
Copy the environment template and configure your variables:
```bash
cp env.template .env
```

Edit `.env` file with your configuration:
```env
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-username
DB_PASSWORD=your-password
DB_DATABASE=your-database
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
```

### Running the Application
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Unit Tests with Coverage
```bash
npm run test:cov
```

### E2E Tests
```bash
npm run test:e2e
```

### Tests in Watch Mode
```bash
npm run test:watch
```

## 📚 API Documentation

After starting the application, Swagger documentation is available at:
```
http://localhost:3000/api/v1/docs
```

## 🔧 Available Commands

- `npm run build` - Build the project
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode
- `npm run start:debug` - Start in debug mode
- `npm run start:prod` - Start in production mode
- `npm run lint` - Run linter
- `npm run format` - Format code
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run e2e tests
- `npm run test:cov` - Run tests with coverage
