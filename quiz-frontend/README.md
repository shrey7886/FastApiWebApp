# Quiz Frontend - Next.js

A modern Next.js frontend for the AI-powered Quiz Generator application.

## Features

- 🎯 **Modern UI**: Built with Next.js 14, TypeScript, and Tailwind CSS
- ✨ **Unique Questions**: Each user gets different questions using seed-based generation
- 🤖 **AI Integration**: Ready for OpenAI API calls
- 🏢 **Multitenancy**: Support for multiple clients and organizations
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
```

2. Start the development server:
```bash
npm run dev
# or
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Backend Integration

This frontend connects to the Flask backend running on `http://127.0.0.1:8000`. Make sure your Flask app is running before using the frontend.

The API proxy is configured in `next.config.js` to forward `/api/*` requests to the Flask backend.

## Project Structure

```
quiz-frontend/
├── src/
│   ├── app/
│   │   ├── globals.css      # Global styles with Tailwind
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Main page
│   └── components/
│       ├── QuizGenerator.tsx # Quiz generation form
│       └── QuizDisplay.tsx   # Quiz display component
├── package.json
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## API Endpoints

The frontend communicates with these backend endpoints:

- `POST /api/generate-quiz` - Generate a new quiz
- `GET /api/quiz/{id}` - Get quiz with questions
- `GET /api/health` - Health check

## Features Implemented

- ✅ Unique question generation per user
- ✅ Seed-based randomization
- ✅ Real-time quiz generation
- ✅ Beautiful, responsive UI
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ API integration with Flask backend

## Next Steps

To enhance the application, consider adding:

- User authentication
- Quiz history and analytics
- Real-time collaboration
- More question types
- Performance tracking
- Export functionality 