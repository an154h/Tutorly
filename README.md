# Tutorly React App

The **Tutorly Dashboard** is a web application built with [React](https://react.dev/) and [Vite](https://vitejs.dev/).  
It provides a simple **Login/Signup**, **AI Chatbot**, **Todo List**, **Calendar**, and **Assignments Database**.

---

## 🚀 Features
- 🔑 **Authentication (basic)** — Login / Sign Up form
- 💬 **Chatbot Tool** — A simple placeholder chatbot
- ✅ **Todo List** — Add, mark as done, and filter tasks
- 📅 **Calendar View** — Pick dates and plan
- 📝 **Assignments Database** — Add and view assignments
- 🎨 **Responsive Styling** — Clean layout with `styles.css`

---

## 📂 Project Structure

Tutorly-React/
├── public/ # Static files
│ └── index.html # Entry HTML file
├── src/ # React source code
│ ├── App.jsx # Main app component
│ ├── main.jsx # Entry point
│ ├── styles.css # Global styles
│ └── components/ # Feature components
│ ├── Auth.jsx
│ ├── Chatbot.jsx
│ ├── TodoList.jsx
│ ├── Calendar.jsx
│ └── Assignments.jsx
├── package.json # npm project configuration
├── vite.config.js # Vite config
└── README.md # Documentation

Tutorly-React/
├── public/ # Static files
│ └── index.html # Entry HTML file
├── src/ # React source code
│ ├── App.jsx # Main app component
│ ├── main.jsx # Entry point
│ ├── styles.css # Global styles
│ └── components/ # Feature components
│ ├── Auth.jsx
│ ├── Chatbot.jsx
│ ├── TodoList.jsx
│ ├── Calendar.jsx
│ └── Assignments.jsx
├── package.json # npm project configuration
├── vite.config.js # Vite config
└── README.md # Documentation

⚡ Getting Started
1. Clone the project
git clone https://github.com/your-username/tutorly-react.git
cd tutorly-react

2. Install dependencies
npm install

3. Run the development server
npm run dev
  VITE v7.1.2  ready in 300ms
  ➜  Local:   http://localhost:5173/
Open the link in your browser.

📦 Building for Production
Create an optimized build:
npm run build

Preview the production build locally:
npm run preview
The production build is output to the dist/ folder.

🌍 Deployment
You can deploy the built project (dist/ folder) to many hosting services:
Vercel
Install Vercel CLI
 or connect your GitHub repo.
Run:
vercel
Done! Your app is live.

Netlify
Push your code to GitHub.
Go to Netlify
, create a new site.
Select your repo, set build command: npm run build, and publish directory: dist.
Deploy.
GitHub Pages (static hosting)
Install GitHub Pages adapter:
npm install gh-pages --save-dev

Add these to package.json:
"homepage": "https://your-username.github.io/tutorly-react",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}

Deploy:
npm run deploy

🐛 Troubleshooting
❌ Import errors (e.g., “Failed to resolve import”)
Always include the .jsx extension when importing local components:
import Auth from "./components/Auth.jsx";

❌ Browser showing old code / weird errors
Stop the dev server (Ctrl + C in terminal).
Clear browser cache or open in Incognito.
Run npm run dev again.

❌ Packages missing
Reinstall dependencies:
rm -rf node_modules package-lock.json
npm install

📌 Next Steps
🔒 Integrate real authentication (Firebase, Supabase, etc.)
🤖 Replace dummy chatbot with an AI API
🗄 Add a database for todos & assignments (MongoDB, PostgreSQL, etc.)
🎨 Improve UI with a component library (e.g., Tailwind, Material UI)

License
MIT License

Copyright (c) 2025 Anisah Suhailah Binti Iskandar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
