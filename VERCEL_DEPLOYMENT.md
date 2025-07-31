# 🚀 Vercel Deployment Guide - Single URL

## ✅ **What You Get:**
- **One URL**: `https://your-app.vercel.app`
- **Full-Stack**: Frontend + Backend in one deployment
- **No Separate Servers**: Everything runs on Vercel
- **Automatic Scaling**: Vercel handles traffic

## 🎯 **Deployment Steps:**

### **1. Prepare for Deployment**
```bash
cd quiz-frontend
npm run build
```

### **2. Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: quiz-app
# - Directory: ./
# - Override settings? No
```

### **3. Set Environment Variables (Optional)**
```bash
vercel env add OPENAI_API_KEY
vercel env add ANTHROPIC_API_KEY
```

### **4. Deploy to Production**
```bash
vercel --prod
```

## 🌟 **Your Single URL:**
```
https://your-app.vercel.app
```

## 📁 **File Structure for Vercel:**
```
quiz-frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate-quiz/route.ts    # Quiz generation
│   │   │   ├── signup/route.ts           # User signup
│   │   │   ├── login/route.ts            # User login
│   │   │   └── health/route.ts           # Health check
│   │   ├── page.tsx                      # Home page
│   │   ├── dashboard/page.tsx            # Dashboard
│   │   └── layout.tsx                    # Root layout
│   ├── components/
│   │   ├── QuizGenerator.tsx             # Quiz creation
│   │   ├── QuizTaker.tsx                 # Quiz taking
│   │   └── ThemeToggle.tsx               # Dark mode toggle
│   └── lib/
│       ├── auth.ts                       # Authentication
│       └── quiz-generator.ts             # AI quiz generation
├── vercel.json                           # Vercel config
└── package.json                          # Dependencies
```

## 🔧 **API Routes (Backend on Vercel):**

### **Quiz Generation**: `/api/generate-quiz`
- **Method**: POST
- **Input**: `{ topic, difficulty, num_questions, duration, tenant_id }`
- **Output**: Quiz with AI-generated questions

### **User Signup**: `/api/signup`
- **Method**: POST
- **Input**: `{ email, password, first_name, last_name, tenant_id }`
- **Output**: User + JWT token

### **User Login**: `/api/login`
- **Method**: POST
- **Input**: `{ email, password, tenant_id }`
- **Output**: User + JWT token

## 🎨 **Features Available:**

### ✅ **Frontend Features:**
- Modern React/Next.js UI
- Dark/Light theme toggle
- Responsive design
- Quiz creation interface
- Quiz taking interface
- Results display

### ✅ **Backend Features:**
- User authentication
- Quiz generation
- API endpoints
- JWT token management
- Multi-tenancy support

### ✅ **AI Integration:**
- Quiz question generation
- Multiple difficulty levels
- Custom topics
- Dynamic question count

## 🌐 **Access Your App:**

1. **Deploy**: `vercel --prod`
2. **Get URL**: `https://your-app.vercel.app`
3. **Share**: One link for everything!

## 🔄 **Development vs Production:**

### **Development (Local):**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8001`
- **Two URLs needed**

### **Production (Vercel):**
- Everything: `https://your-app.vercel.app`
- **One URL for everything!**

## 🚀 **Benefits of Vercel Deployment:**

1. **Single URL**: No need to manage separate frontend/backend
2. **Automatic Scaling**: Handles traffic spikes
3. **Global CDN**: Fast loading worldwide
4. **Zero Configuration**: Works out of the box
5. **Free Tier**: Generous free hosting
6. **Custom Domains**: Add your own domain
7. **Environment Variables**: Secure API keys
8. **Automatic Deployments**: Git integration

## 🎉 **Result:**
**One beautiful URL for your entire quiz application!**

```
https://your-app.vercel.app
```

**Everything works from this single link:**
- ✅ User registration/login
- ✅ Quiz creation
- ✅ Quiz taking
- ✅ Dark mode toggle
- ✅ AI-powered questions 