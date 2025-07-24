# Epreuve Frontend

An Angular 18 educational platform for exam preparation featuring Mathematics/Physics, Biochemistry, and Languages sections.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run start

# Build for production
npm run build:prod

# Run tests
npm test
```

## Architecture

This application follows modern Angular best practices with standalone components, SSR support, and comprehensive security features.

📋 **[View Complete Architecture Documentation](./ARCHITECTURE.md)**

### Key Features
- **Angular 18** with standalone components
- **Server-Side Rendering (SSR)** for SEO optimization
- **JWT Authentication** with role-based access control
- **Responsive Design** with Bootstrap 5 and Angular Material
- **Docker Support** for containerized deployment
- **Multi-environment** configuration

### Technology Stack
- Frontend: Angular 18, TypeScript, SCSS
- UI: Bootstrap 5, Angular Material, Bootstrap Icons
- State: RxJS for reactive programming
- Testing: Karma + Jasmine
- Deployment: Docker, Netlify, SSR with Express

## Project Structure

```
src/app/
├── components/     # Feature components
├── reusable/       # Shared UI components  
├── services/       # Business logic
├── models/         # TypeScript interfaces
├── guards/         # Route protection
├── interceptors/   # HTTP middleware
└── validators/     # Form validation
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run start` | Development server (http://localhost:4200) |
| `npm run build` | Build for production |
| `npm run build:dev` | Build for development |
| `npm run build:ssr` | Build with SSR |
| `npm run test` | Run unit tests |
| `npm run serve:ssr` | Serve SSR build |

## Build Scripts

```bash
# Development build
npm run build:dev

# Production build
npm run build:prod

# Server-side rendering build
npm run build:ssr

# Serve SSR application
npm run serve:ssr:epreuves
```

## Deployment

### Docker Deployment
```bash
docker build -t epreuve-frontend .
docker run -p 80:80 epreuve-frontend
```

### Netlify Deployment
The project includes `netlify.toml` configuration for automatic deployment.

### Custom Deployment
Use the enhanced deployment script:
```bash
./deploy prod --ssr    # Production with SSR
./deploy dev           # Development build
```

## Documentation

- **[Architecture Overview](./ARCHITECTURE.md)** - Comprehensive system architecture
- **[Folder Structure](./docs/folder-structure.md)** - Detailed project organization
- **[Architecture Summary](./docs/architecture-summary.md)** - Quick reference guide

## Contributing

1. Follow Angular style guide and coding standards
2. Use TypeScript strict mode
3. Write unit tests for new features
4. Update documentation for architectural changes

## License

This project is private and proprietary.
