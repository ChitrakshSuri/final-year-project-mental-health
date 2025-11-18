# Replace the existing README with your own
@"
# AI Mental Health Therapy System

An AI-powered mental health platform using voice conversations for supportive therapy sessions.

## Features
- Voice-based therapy sessions using AI
- Real-time conversation with empathetic AI therapist
- Session insights and recommendations
- Secure authentication and data storage

## Tech Stack
- Next.js 15
- Firebase (Authentication + Firestore)
- Vapi AI (Voice Agent)
- Google Gemini AI
- Tailwind CSS

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Firebase account
- Vapi AI account
- Google Gemini API key

### Installation

1. Clone the repository
```bash
git clone https://github.com/ChitrakshSuri/final-year-project-mental-health.git
cd final-year-project-mental-health
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables

Create a `.env.local` file in the root directory with:
```env
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_vapi_workflow_id
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key"
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Important Note

This is an AI companion for supportive conversations and is NOT a replacement for professional mental health care. If you're in crisis, please contact:
- **AASRA Foundation (India)**: Call **022-27546669** (24/7 Helpline)
- **Tele-MANAS (India)**: Call **1-800-891-4416 / 14416** (National Mental Health Support)
- **Emergency Services (India)**: Call **112** (Police, Ambulance, etc.)
- For international resources: visit [findahelpline.com](https://www.findahelpline.com)

## License
MIT

## Author
Chitraksh Suri
"@ | Out-File -FilePath README.md -Encoding UTF8