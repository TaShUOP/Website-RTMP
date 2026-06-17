# RTMP Live Streaming Website

This project is a full-stack live streaming platform that allows you to ingest an RTMP stream (e.g., from OBS Studio) and display it in a modern, premium web interface with very low latency.

## What's in this Project

The repository is divided into two main parts:

1. **Backend (`/backend`)**: A lightweight Node.js media server built with `node-media-server`. It ingests the incoming RTMP stream and transcodes/repackages it on the fly into an HTTP-FLV stream, which is playable in modern web browsers.
2. **Frontend (`/frontend`)**: A React web application powered by Vite. It features a custom-designed, dark-mode user interface with glassmorphism effects, mimicking professional streaming platforms like Twitch or YouTube. It uses `flv.js` to receive and play the HTTP-FLV video stream.

## How it was Created

- **Backend**: Initialized as a standard Node.js project (`npm init -y`) and installed the `node-media-server` package to handle the heavy lifting of the RTMP protocol and FLV packaging. A `server.js` script was written to configure the ports and enable CORS.
- **Frontend**: Scaffolding was done using Vite (`npm create vite@latest frontend --template react`). The core video playback was implemented by integrating the `flv.js` library into a custom `<VideoPlayer />` React component. The UI was styled completely from scratch using modern CSS tokens, flexbox/grid layouts, and responsive design principles.

## How to Run It

To run this application locally, you will need Node.js installed on your machine and a broadcasting software like OBS Studio.

### 1. Start the Media Server (Backend)

Open a terminal window and start the Node backend:

```bash
cd backend
npm install
node server.js
```

You should see output confirming that the Node Media Server is running and listening on port `1935` (for RTMP) and port `8000` (for HTTP).

### 2. Start the Web App (Frontend)

Open a second terminal window and start the Vite development server:

```bash
cd frontend
npm install
npm run dev
```

Your browser should automatically open, or you can navigate to the local URL provided in the terminal (usually `http://localhost:5173`).

### 3. Start Streaming

Now, configure your broadcasting software to send video to the server.

**Using OBS Studio:**
1. Open OBS Studio.
2. Go to **Settings** > **Stream**.
3. Under **Service**, select `Custom...`.
4. Set **Server** to: `rtmp://localhost/live`
5. Set **Stream Key** to: `test`
6. Click **Apply** and then click the **Start Streaming** button on the main OBS window.

Go back to your React web app in the browser. You should now see your live stream playing smoothly!
