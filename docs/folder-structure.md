# Detailed Folder Structure

## Project Root Structure

```
epreuve-frontend/
├── .dockerignore              # Docker ignore patterns
├── .editorconfig              # Editor configuration
├── .git/                      # Git version control
├── .gitignore                 # Git ignore patterns
├── .vscode/                   # VSCode settings
├── Dockerfile                 # Docker container configuration
├── README.md                  # Project documentation
├── ARCHITECTURE.md            # Architecture documentation (this doc)
├── angular.json               # Angular CLI workspace config
├── deploy*                    # Deployment script
├── docs/                      # Additional documentation
│   ├── progress.md            # Development progress
│   └── specs/                 # Technical specifications
│       ├── authentication-system/
│       └── responsiveness/
├── netlify.toml              # Netlify deployment config
├── nginx/                    # Nginx configuration
│   └── nginx.conf            # Web server configuration
├── package.json              # NPM dependencies and scripts
├── package-lock.json         # Locked dependency versions
├── public/                   # Static assets
├── server.ts                 # SSR Express server
├── src/                      # Source code (detailed below)
├── tsconfig.json             # TypeScript configuration
├── tsconfig.app.json         # App-specific TS config
└── tsconfig.spec.json        # Test-specific TS config
```

## Source Code Structure (`src/`)

```
src/
├── index.html                # Main HTML template
├── main.ts                   # Application bootstrap
├── main.server.ts            # SSR bootstrap
├── styles.scss               # Global styles
└── app/                      # Application code
    ├── app.component.html    # Root component template
    ├── app.component.scss    # Root component styles
    ├── app.component.spec.ts # Root component tests
    ├── app.component.ts      # Root component logic
    ├── app.config.ts         # App configuration
    ├── app.config.server.ts  # SSR configuration
    ├── app.routes.ts         # Routing configuration
    ├── logs.ts               # Logging utilities
    │
    ├── components/           # Feature Components
    │   ├── biochimie/        # Biochemistry section
    │   │   ├── biochimie.component.html
    │   │   ├── biochimie.component.scss
    │   │   ├── biochimie.component.spec.ts
    │   │   └── biochimie.component.ts
    │   ├── concours/         # Competitions section
    │   ├── contact/          # Contact form
    │   ├── dashboard/        # User dashboard
    │   ├── help-form/        # Help/Support form
    │   ├── home/             # Landing page
    │   ├── langues/          # Languages section
    │   ├── login/            # Authentication
    │   ├── mathphys/         # Math/Physics section
    │   ├── profile/          # User profile
    │   └── terms/            # Terms & Privacy
    │       └── terms-service/
    │
    ├── reusable/             # Shared UI Components
    │   ├── course-section/   # Course display component
    │   ├── footer/           # Page footer
    │   ├── layout/           # Layout wrapper
    │   ├── navbar/           # Navigation header
    │   ├── paginator/        # Pagination component
    │   └── search-bar/       # Search functionality
    │
    ├── services/             # Business Logic Services
    │   ├── api/              # API communication
    │   │   └── api.service.ts
    │   ├── auth/             # Authentication service
    │   ├── contact/          # Contact form service
    │   ├── faq/              # FAQ management
    │   ├── search-bar/       # Search functionality
    │   ├── storage/          # Local storage handling
    │   └── user/             # User management
    │
    ├── models/               # TypeScript Interfaces
    │   ├── api.model.ts      # API response interfaces
    │   ├── faq.spec.ts       # FAQ test file
    │   ├── faq.ts            # FAQ data model
    │   ├── search.model.ts   # Search model
    │   └── user.model.ts     # User entity structure
    │
    ├── guards/               # Route Protection
    │   ├── admin.guard.ts    # Admin role verification
    │   ├── auth.guard.ts     # Authentication check
    │   └── guest.guard.ts    # Guest-only access
    │
    ├── interceptors/         # HTTP Middleware
    │   ├── auth-interceptor.interceptor.ts  # Token injection
    │   ├── epreuve.interceptor.ts          # Custom interceptor
    │   ├── error.interceptor.ts            # Error handling
    │   └── loading.interceptor.ts          # Loading states
    │
    └── validators/           # Form Validation
        └── [validation files]
```

## Component Structure Pattern

Each component follows this standard structure:
```
component-name/
├── component-name.component.html    # Template
├── component-name.component.scss    # Styles
├── component-name.component.spec.ts # Unit tests
└── component-name.component.ts      # Component logic
```

## Service Structure Pattern

Services are organized by domain:
```
service-domain/
├── service-name.service.ts          # Service implementation
├── service-name.service.spec.ts     # Service tests
└── [related interfaces/models]      # Supporting types
```

## Asset Organization

```
public/                     # Static assets served directly
├── favicon.ico            # Application icon
├── images/                # Static images
├── icons/                 # Icon files
└── [other static files]   # Additional assets
```

## Configuration Files

```
Configuration Files:
├── angular.json           # Angular CLI workspace configuration
├── package.json           # NPM dependencies and scripts
├── tsconfig.json          # Base TypeScript configuration
├── tsconfig.app.json      # Application TypeScript config
├── tsconfig.spec.json     # Testing TypeScript config
├── netlify.toml          # Netlify deployment configuration
└── nginx/nginx.conf      # Nginx web server configuration
```

## Build Output Structure

```
dist/
└── epreuves/
    ├── browser/           # Client-side build
    │   ├── index.html     # Main HTML file
    │   ├── main.js        # Application bundle
    │   ├── styles.css     # Compiled styles
    │   └── assets/        # Static assets
    └── server/            # Server-side build (SSR)
        └── server.mjs     # Express server
```

## Development vs Production Structure

### Development
- Source maps enabled
- Hot module replacement
- Unminified code
- Development environment variables

### Production
- Minified and optimized bundles
- Tree-shaken dependencies
- Production environment variables
- Prerendered routes (SSR)

This folder structure follows Angular best practices and provides clear separation of concerns for maintainable and scalable development.