# TrucksBus Platform

A modern online marketplace for commercial vehicles (trucks, buses, trailers) with comprehensive listing management and e-commerce features.

## Project Structure

```
TrucksBusV2/
├── client/          # React Vite Frontend
├── server/          # Node.js Express Backend  
├── database/        # PostgreSQL Scripts
└── docs/           # Documentation
```

## Technology Stack

### Frontend
- React 18 + TypeScript
- Vite for build tooling
- Redux Toolkit for state management
- React Query for API calls
- Material-UI for components
- Socket.io for real-time features

### Backend
- Node.js + Express + TypeScript
- PostgreSQL with Prisma ORM
- Redis for caching
- JWT authentication
- Socket.io for real-time messaging

### Infrastructure
- Docker for containerization
- Nginx for reverse proxy
- GitHub Actions for CI/CD
- AWS S3/Cloudinary for image storage

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Start development servers:
```bash
npm run dev
```

## Development Commands

- `npm run dev` - Start both client and server in development mode
- `npm run build` - Build both client and server for production
- `npm run test` - Run tests for both client and server
- `npm run lint` - Run linting for both projects

## Features

### Core Features
- Multi-category vehicle listings (8 categories)
- Dynamic form generation based on category
- Admin approval workflow
- Real-time messaging system
- Corporate store pages
- Advanced search and filtering

### User Roles
- **Guest**: Browse ads, view details
- **Registered User**: Post ads, messaging, favorites
- **Corporate User**: Bulk uploads, dedicated store page
- **Admin**: Full system access, ad approval
- **Moderator**: Ad approval, complaint handling

### Categories
1. Çekici (Tractor)
2. Dorse (Trailer)
3. Kamyon & Kamyonet (Truck & Pickup)
4. Karoser & Üst Yapı (Body & Superstructure)
5. Minibüs & Midibüs (Minibus & Midibus)
6. Otobüs (Bus)
7. Oto Kurtarıcı & Taşıyıcı (Recovery & Carrier)
8. Römork (Small Trailer)

## License

Private - All rights reserved
