# WC26 Live - RTMP Streaming Website

This project is a full-stack live streaming platform that allows you to ingest an RTMP stream (e.g., from OBS Studio) and display it in a stunning, World Cup 2026 themed web interface with real-time live chat.

## ⚙️ How It Works

1. **Broadcaster**: A user streams video from OBS Studio to the Node Media Server via RTMP (`rtmp://<ip>:3343/live/your-key`).
2. **Dual-Engine Media Server**: The backend simultaneously processes the stream in two ways:
   - Serves an ultra-low latency **HTTP-FLV** stream on port `3342` for laptop/desktop users.
   - Spawns an **FFmpeg engine** to generate an **Apple HLS** (`.m3u8`) stream served on port `8865` specifically for iPhones.
3. **Frontend App**: The React application uses `flv.js` to natively decode and play the FLV stream in the browser. It also includes an isolated, dedicated HTML page (`/ios`) that iPhone users can redirect to, which uses a native `<video>` tag to effortlessly play the HLS feed.
4. **Chat & Metrics**: Socket.io handles real-time chat messages and tracks active viewer counts across all connected clients (syncing between laptop and iOS users).

## What's in this Project

The repository is divided into two main parts:

1. **Backend (`/backend`)**: A Node.js media server built with `node-media-server` and `socket.io`. It ingests the incoming RTMP stream on port `3343`. It serves HTTP-FLV on port `3342`, and automatically transcodes an HLS feed using FFmpeg for iOS users. It powers the real-time Live Chat API on port `3344` and acts as the production web server serving the frontend on port `8865`.
2. **Frontend (`/frontend`)**: A React web application powered by Vite. It features a custom-designed, World Cup 2026 themed interface (dark mode, neon concentric backgrounds, glassmorphism) using **`flv.js`** for low-latency live video playback. It also contains an isolated `public/ios/index.html` file to provide a dedicated native HLS fallback for iPhone users.

---

## 🚀 How to Run It

You have two options to run this project: **Manual Installation** (great for development or if you don't use Docker) or **Docker** (recommended for quick production deployments).

### Option A: Manual Installation (Standard)

To run this application locally without Docker, you will need Node.js installed on your machine.

**1. Start the Media Server (Backend)**
Open a terminal window and start the Node backend:
```bash
cd backend
npm install
node server.js
```
*You should see output confirming that the Node Media Server is running and listening on port `3343` (for RTMP capturing) and port `3342` (for HTTP streaming and Chat).*

**2. Start the Web App (Frontend)**
Open a second terminal window and start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```
*Your browser should automatically open, or you can navigate to `http://localhost:8865`.*

---

### Option B: Run with Docker 🐳

The entire application is fully containerized. You can either use the pre-built image from Docker Hub or build it yourself!

**Method 1: Use the Pre-built Image (Fastest)**
You can instantly download and run the latest pre-built image without downloading the code:
```bash
docker run -p 8865:8865 -p 3342:3342 -p 3343:3343 -p 3344:3344 -d 0xtashuop/wc26-live:latest
```

**Method 2: Build it Yourself**
Open your terminal in the root of the project and run:
```bash
docker build -t wc26-live .
```
Then run your locally built container:
```bash
docker run -p 8865:8865 -p 3342:3342 -p 3343:3343 -p 3344:3344 -d wc26-live
```

*Navigate your browser to `http://localhost:8865` to view the site.*

> 📱 **Testing on an iPhone/Mobile Device?** 
> If you open the website on your phone over Wi-Fi, you **MUST** click the "Settings" button in the top right of the website and change the Stream URL and Chat URL from `localhost` to your computer's actual local IP address (e.g., `192.168.1.5`). Otherwise, your phone will search inside itself for the video and the screen will remain blank!

---

## 🎥 How to Start Streaming (OBS Studio)

No matter which method you used to start the server, you can stream to it using broadcasting software like OBS:

1. Open OBS Studio.
2. Go to **Settings** > **Stream**.
3. Under **Service**, select `Custom...`.
4. Set **Server** to: `rtmp://localhost:3343/live` *(Replace localhost with the server IP if hosting remotely)*
5. Set **Stream Key** to: `test` (or whatever key you prefer)
6. Click **Apply** and then click the **Start Streaming** button on the main OBS window.

---

## 🛠️ Server Owner Configuration

### Changing the Default Stream URL for Viewers

By default, the web interface attempts to connect to the video stream and chat via `localhost`. If you are hosting this server on a public IP address or a domain name, you should configure the default connection strings. **This ensures your viewers don't have to manually open the Settings panel and type your IP address every time they visit the website!**

**How to configure the default URLs:**

You can easily configure these default URLs by creating a `.env.production` file in your `frontend/` directory before building the Docker image.

1. Create a file named `.env.production` in the `frontend/` folder with the following contents:
   ```env
   VITE_SERVER_URL=http://your-public-ip-or-domain:3342/live
   VITE_SOCKET_URL=http://your-public-ip-or-domain:3344
   VITE_STREAM_KEY=your-stream-key
   ```
2. **Apply Changes**: 
   - If running **manually**, simply restart your Vite dev server (`npm run dev`).
   - If using **Docker**, just build the image as normal! Docker will automatically copy your `.env.production` file and Vite will seamlessly bake the variables into your static frontend!
   ```bash
   docker build -t wc26-live .
   ```
