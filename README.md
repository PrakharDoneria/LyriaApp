# 🎵 Lyria AI - Premium Music Generation

Lyria AI is a premium, desktop-first web application designed for studio-quality AI music generation. Built with a focus on high-end aesthetics and real-time feedback, Lyria allows creators to transform text, images, and lyrics into immersive audio experiences using **Google Cloud Vertex AI (Lyria 3)**.

![Lyria AI Banner](https://img.shields.io/badge/Experience-Desktop--Only-blue?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Built%20With-Next.js%20%7C%20TypeScript%20%7C%20Vertex%20AI-black?style=for-the-badge)

## ✨ Features

- **Multi-Modal Generation**: Generate music from text prompts, visual inspiration (images), or structured lyrics.
- **Studio Quality**: High-fidelity 44.1kHz audio output with optimized generation for short clips and professional tracks.
- **Dynamic Visualizer**: Real-time audio visualization using the Web Audio API with a premium "glassmorphism" interface.
- **Intelligent Quota System**: Built-in rate limiting with a dedicated bypass for testing via mentor credentials.
- **Desktop-First Experience**: Optimized for professional studio workflows on desktop browsers.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Premium Glassmorphism Design System)
- **AI Backend**: Google Cloud Vertex AI (Lyria 3 Preview)
- **Auth**: Google Auth Library (OAuth 2.0 with Service Account support)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Google Cloud CLI (`gcloud`)
- A Google Cloud Project with the **Vertex AI API** enabled.

### Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/PrakharDoneria/LyriaApp.git
   cd LyriaApp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Create a `.env` file in the root directory:
   ```env
   PROJECT_ID=your-google-cloud-project-id
   ```

4. **Authenticate**:
   Set up Application Default Credentials (ADC) for local development:
   ```bash
   gcloud auth application-default login
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the result.

## ☁️ Deployment (Cloud Run)

Lyria AI is optimized for deployment on **Google Cloud Run** with minimum cost infrastructure.

### Cost-Optimized Deploy Command:

```bash
gcloud run deploy music-maker-ai \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 1 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars "PROJECT_ID=your-project-id"
```

## 📜 License

Created by **Prakhar Doneria**. Mentored by **Harshvardhan Sir**.
Support the project on [GitHub Sponsors](https://github.com/sponsors/PrakharDoneria) or [PayPal](https://paypal.me/prakhardoneria).
