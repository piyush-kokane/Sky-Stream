# 🌤️ SkyStream

A live video streaming platform built on AWS IVS. Stream, watch, and discover live content — all in real time.

---

## What is this?

SkyStream lets users go live and watch other people's streams. It's built on top of AWS Interactive Video Service (IVS) for ultra-low latency streaming, with a React frontend and a serverless AWS backend.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + TypeScript, Vite |
| Video Playback | HLS.js |
| Auth | AWS Cognito (via `react-oidc-context`) |
| Streaming | AWS IVS (Interactive Video Service) |
| API | AWS API Gateway + Lambda |
| Stream Metadata | DynamoDB (via Lambda) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│                                                         │
│   React App  ──── Cognito OIDC ──── AWS Cognito         │
│       │                                                 │
│   HLS.js  ◄──── IVS Playback URL                        │
│       │                                                 │
│   REST calls                                            │
└───────┼─────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────┐
│   API Gateway     │
│  /live-streams    │
│  /stream/start    │
│  /stream/end      │
└───────┬───────────┘
        │
        ▼
┌───────────────────┐       ┌─────────────────┐
│     Lambda        │ ────► │    DynamoDB      │
│  (stream CRUD)    │       │ (stream metadata)│
└───────────────────┘       └─────────────────┘
        │
        ▼
┌───────────────────┐
│    AWS IVS        │
│  - Channels       │
│  - Stream Keys    │
│  - Playback URLs  │
└───────────────────┘
```

**How a stream works end to end:**

1. Streamer signs in via Cognito and hits **Go Live**
2. Frontend calls Lambda to create/fetch their IVS channel and stream key
3. Streamer broadcasts via OBS (or any RTMP client) using that stream key
4. IVS ingests the stream and serves a `.m3u8` HLS playback URL
5. Lambda writes stream metadata (title, username, playbackUrl) to DynamoDB
6. Viewers' browsers poll `/live-streams` every 5 seconds
7. HLS.js fetches and plays the `.m3u8` in the video player

---

## Getting Started

### Prerequisites

- Node.js 18+
- An AWS account with IVS and Cognito set up
- OBS or any RTMP streaming software (to test going live)

### Install

```bash
git clone https://github.com/your-username/skystream.git
cd skystream
npm install
```

### Run locally

```bash
npm run dev
```

---

## Environment Variables

Create a `.env` file in the root:

```env
VITE_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/prod
VITE_COGNITO_AUTHORITY=https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XXXXXXX
VITE_COGNITO_CLIENT_ID=your-cognito-app-client-id
VITE_COGNITO_REDIRECT_URI=http://localhost:5173
```

---

## Going Live (as a streamer)

1. Sign in and click **Go Live**
2. Fill in your stream title and category
3. Copy the **stream key** shown
4. Open OBS → Settings → Stream → Custom RTMP
   - Server: `rtmps://ingest.global-contribute.live-video.net:443/app/`
   - Stream Key: *(paste from app)*
5. Hit **Start Streaming** in OBS
6. Your stream will appear on SkyStream within a few seconds

---

## Project Structure

```
src/
├── assets/
├── components/
│   ├── styles/
│   │   ├── GoLive.css
│   │   ├── LiveChat.css        # 🚧 WIP
│   │   ├── Navbar.css
│   │   ├── Sidebar.css         # 🚧 WIP
│   │   ├── VideoCard.css
│   │   └── VideoPlayer.css
│   ├── ChatMessage.tsx
│   ├── GoLive.tsx
│   ├── LiveChat.tsx            # 🚧 WIP — UI ready, functionality coming
│   ├── Navbar.tsx
│   ├── Sidebar.tsx             # 🚧 WIP — UI ready, functionality coming
│   ├── VideoCard.tsx
│   └── VideoPlayer.tsx
├── hooks/
│   └── useUser.tsx
├── pages/
│   ├── styles/
│   │   ├── Home.css
│   │   ├── Landing.css
│   │   ├── StreamDashboard.css
│   │   └── Watch.css
│   ├── Home.tsx
│   ├── Landing.tsx
│   ├── StreamDashboard.tsx
│   └── Watch.tsx
├── App.css
├── App.tsx
├── index.css
└── main.tsx
```

---

## Known Limitations

- Stream metadata (viewer count, etc.) is not real-time — it polls every 5 seconds
- One stream key per user (IVS channel is reused)

## Roadmap

- 💬 **Live Chat** — UI is built, backend integration coming
- 📋 **Sidebar** — UI is built, functionality coming
- 👥 Follow / notification system
- 📊 Real-time viewer count via WebSockets

---

## License

MIT