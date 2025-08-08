# Architecture Documentation

## Project Overview

**Project Name**: Epreuves Frontend  
**Framework**: Angular 18  
**Type**: Single Page Application (SPA) with Server-Side Rendering (SSR) support  
**Target**: Educational platform for exam preparation (Mathematics/Physics, Biochemistry, Languages)

## Technology Stack

### Frontend Framework
- **Angular 18** - Latest version with standalone components
- **TypeScript 5.4.2** - Type-safe JavaScript development
- **RxJS 7.8** - Reactive programming library

### UI/UX Libraries
- **Angular Material 18.2.14** - Material Design components
- **Bootstrap 5.1.1** - CSS framework for responsive design
- **Bootstrap Icons 1.11.3** - Icon library
- **Lucide Angular 0.511.0** - Additional icon set
- **SCSS** - CSS preprocessor

### Development Tools
- **Angular CLI 18.0.3** - Command line interface
- **Karma + Jasmine** - Testing framework
- **ESLint/TSLint** - Code quality tools

### Backend Integration
- **Axios 1.7.9** - HTTP client for API calls
- **JWT Decode 4.0.0** - JWT token handling
- **EmailJS 3.2.0** - Email service integration

### Deployment & Infrastructure
- **Docker** - Containerization with Nginx
- **Netlify** - Static site hosting
- **Express.js 4.18.2** - SSR server
- **Angular SSR** - Server-side rendering support

## Architecture Patterns

### 1. Component Architecture
The application follows Angular's **standalone component** architecture (Angular 14+ feature):

```
src/app/
├── components/           # Feature components
│   ├── home/            # Landing page
│   ├── dashboard/       # User dashboard  
│   ├── login/           # Authentication
│   ├── profile/         # User profile
│   ├── biochimie/       # Biochemistry section
│   ├── mathphys/        # Math/Physics section
│   ├── langues/         # Languages section
│   ├── concours/        # Competitions section
│   ├── contact/         # Contact form
│   ├── help-form/       # Help/Support
│   └── terms/           # Terms & Privacy
├── reusable/            # Shared UI components
│   ├── navbar/          # Navigation header
│   ├── footer/          # Page footer
│   ├── layout/          # Layout wrapper
│   ├── search-bar/      # Search functionality
│   ├── paginator/       # Pagination component
│   └── course-section/  # Course display
├── services/            # Business logic services
├── models/              # TypeScript interfaces
├── guards/              # Route protection
├── interceptors/        # HTTP middleware
└── validators/          # Form validation
```

### 2. Service Layer Architecture
Services are organized by domain responsibility:

```
services/
├── api/                 # API communication
├── auth/                # Authentication logic
├── user/                # User management
├── storage/             # Local storage handling
├── contact/             # Contact form service
├── search-bar/          # Search functionality
└── faq/                 # FAQ management
```

### 3. Security Architecture
- **JWT Authentication** - Token-based auth
- **Route Guards** - Protecting routes based on user roles
  - `auth.guard.ts` - Authentication check
  - `admin.guard.ts` - Admin role verification
  - `guest.guard.ts` - Guest-only access
- **HTTP Interceptors** - Cross-cutting concerns
  - `auth-interceptor.ts` - Automatic token injection
  - `error.interceptor.ts` - Global error handling
  - `loading.interceptor.ts` - Loading state management

## Application Structure

### Core Configuration Files
- `angular.json` - Angular CLI workspace configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript compiler configuration
- `app.config.ts` - Application-level configuration
- `app.routes.ts` - Routing configuration

### Routing Structure
```typescript
Routes:
├── /home           # Landing page
├── /mathphys       # Mathematics & Physics
├── /biochimie      # Biochemistry  
├── /langues        # Languages
├── /concours       # Competitions
├── /dashboard      # User dashboard (protected)
├── /login          # Authentication
├── /profile        # User profile (protected)
├── /contact        # Contact form
├── /help           # Help/Support
├── /Terms          # Terms of service
├── /Privacy        # Privacy policy
└── /**             # Wildcard redirect to home
```

### Data Models
```
models/
├── api.model.ts         # API response interfaces
├── user.model.ts        # User entity structure
├── faq.ts              # FAQ data model
└── search.model.ts     # Search functionality model
```

## Build & Deployment Architecture

### Development Environment
- **Local Development**: `ng serve` (port 4200)
- **Build Variants**:
  - Development: `ng build --configuration development`
  - Production: `ng build --configuration production`
  - SSR: `ng run epreuves:server`

### Production Deployment Options

#### 1. Static Hosting (Netlify)
```yaml
# netlify.toml
[build]
    publish = "dist/epreuves/browser"

# SPA routing configuration
[[redirects]]
    from = "/*"
    to = "/index.html"
    status = 200
```

#### 2. Docker Containerization
```dockerfile
# Multi-stage build
Stage 1: Build Angular app
Stage 2: Serve with Nginx
```

#### 3. Server-Side Rendering (SSR)
- **Express.js server** for SSR
- **Angular Universal** for pre-rendering
- **CommonEngine** for server-side rendering

### Build Scripts
```json
{
  "start": "ng serve",
  "build": "ng build", 
  "build:prod": "ng build --configuration production",
  "build:ssr": "ng run epreuves:server",
  "serve:ssr": "node dist/epreuves/server/server.mjs"
}
```

## Environment Management

### Configuration Strategy
- **Environment-based builds** using Angular's environment system
- **Runtime environment detection** using `isDevMode()`
- **API base URL configuration** through environment files

### Deployment Environments
- **Development** - Local development with hot reload
- **Staging** - Pre-production testing environment  
- **Production** - Live application deployment

## State Management

### Data Flow Architecture
1. **Components** - UI layer and user interactions
2. **Services** - Business logic and API communication
3. **RxJS Observables** - Reactive data streams
4. **Local Storage** - Client-side persistence
5. **HTTP Interceptors** - Request/response middleware

### API Integration Pattern
```typescript
// Service layer handles API communication
ApiService.getDataHandler(endpoint, page) -> Observable<ApiResponse>

// Components subscribe to data streams
component.ngOnInit() -> service.getData() -> template rendering
```

## Development Workflow

### Code Organization Principles
1. **Feature-based organization** - Components grouped by functionality
2. **Reusable components** - Shared UI elements in `/reusable`
3. **Service separation** - Business logic separated from UI
4. **Type safety** - Strong TypeScript typing throughout
5. **Reactive patterns** - RxJS for async operations

### Quality Assurance
- **TypeScript compilation** - Build-time type checking
- **Angular linting** - Code style enforcement
- **Unit testing** - Karma + Jasmine framework
- **Build optimization** - Production bundle optimization

## Performance Optimizations

### Build Optimizations
- **Tree shaking** - Unused code elimination
- **Code splitting** - Lazy loading modules
- **Bundle optimization** - Size limits and warnings
- **SSR support** - Faster initial page loads

### Runtime Optimizations
- **OnPush change detection** - Optimized component updates
- **Lazy loading** - Route-based code splitting
- **HTTP caching** - Efficient API response caching
- **Static asset optimization** - Image and resource optimization

## Security Features

### Authentication & Authorization
- **JWT token-based authentication**
- **Role-based access control** (Admin, User, Guest)
- **Route guards** for protected areas
- **Automatic token refresh** via interceptors

### Data Protection
- **HTTP-only communication** with backend APIs
- **CORS handling** for cross-origin requests
- **Input validation** through Angular forms
- **XSS protection** via Angular's built-in sanitization

## Future Architecture Considerations

### Scalability Enhancements
- **Micro-frontend architecture** - Breaking into smaller apps
- **State management library** - NgRx for complex state scenarios
- **PWA features** - Offline functionality and push notifications
- **Performance monitoring** - Real-time performance tracking

### Technical Debt Management
- **Regular dependency updates** - Security and feature updates
- **Code refactoring** - Maintaining clean architecture
- **Testing coverage improvement** - Comprehensive test suites
- **Documentation updates** - Keeping architecture docs current

---

*This architecture documentation provides a comprehensive overview of the current system structure and serves as a reference for development and maintenance activities.*