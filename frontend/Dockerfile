# /frontend/Dockerfile

# Stage 1: Build the React application
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy build artifacts to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx config if needed (optional, using default for now but robust for SPA)
# We need a simple config to handle React Router (redirect to index.html for 404s)
RUN echo 'server { \
    listen 80; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
