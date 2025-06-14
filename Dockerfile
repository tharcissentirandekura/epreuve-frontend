# Stage 1: Build Angular App
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Copy all project files
COPY . /app/

# Build Angular app for production
RUN npm run build -- --configuration=production

# Stage 2: Serve with Nginx
FROM nginx:alpine AS final

# Copy nginx configuration
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Remove default Nginx HTML files
RUN rm -rf /usr/share/nginx/html/*

# Copy the Angular build to Nginx HTML folder (shared volume)
COPY --from=build /app/dist/epreuves-types-website/browser/. /usr/share/nginx/html/


# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
