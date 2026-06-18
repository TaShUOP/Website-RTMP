# Stage 1: Build the React frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup the Node.js backend
FROM node:22-alpine
WORKDIR /app

# Copy backend files and install dependencies
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install
COPY backend/ ./

# Copy built frontend files from Stage 1
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose required ports
# 8865: Dedicated Frontend Server
# 3342: Backend HTTP-FLV Streaming
# 3343: RTMP Capturing (OBS)
# 3344: Live Chat Socket
EXPOSE 8865 3342 3343 3344

# Start the server
CMD ["node", "server.js"]
