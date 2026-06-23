# WC26 Live - RTMP Streaming Website

This project is a full-stack live streaming platform that allows you to ingest an RTMP stream (e.g., from OBS Studio) and display it in a stunning, World Cup 2026 themed web interface with real-time live chat.

## What's in this Project

The repository is divided into two main parts:

1. **Backend (`/backend`)**: A Node.js media server built with `node-media-server` and `socket.io`. It ingests the incoming RTMP stream on port `3343` and automatically packages it on the fly into an **HLS playlist** using FFmpeg. It also powers the real-time Live Chat API independently on port `3344` and acts as the production web server serving the frontend on port `8865`.
2. **Frontend (`/frontend`)**: A React web application powered by Vite. It features a custom-designed, World Cup 2026 themed interface (dark mode, neon concentric backgrounds, glassmorphism). It uses **`hls.js`** for unified, stable video playback across Desktop and Android, and automatically falls back to native HLS for iOS devices (iPhone/iPad).

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

By default, the web interface attempts to connect to the video stream and chat via `localhost`. If you are hosting this server on a public IP address or a domain name, you should change the default connection strings in the code. **This ensures your viewers don't have to manually open the Settings panel and type your IP address every time they visit the website!**

**How to permanently change the default URL:**

1. Open the file: `frontend/src/App.jsx`
2. Locate the `activeConfig` state block near line 16 and update the default values to point to your public IP or domain:
   ```javascript
   const [activeConfig, setActiveConfig] = useState({
     serverUrl: 'http://your-public-ip-or-domain:3342/live',
     socketUrl: 'http://your-public-ip-or-domain:3344',
     streamKey: 'your-stream-key'
   });
   ```
3. **Apply Changes**: 
   - If running **manually**, simply refresh your browser (Vite will auto-reload).
   - If using **Docker**, rebuild your Docker image (`docker build -t wc26-live .`) to bake these new URLs into the static frontend files!
