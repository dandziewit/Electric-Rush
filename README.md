Electric Rush is a high-performance, browser-based arcade racing game built with HTML5 Canvas and vanilla JavaScript. Players navigate a neon-lit, top-down road, weaving through traffic, collecting lightning boosts, and competing for high scores on a dynamic leaderboard.

This project demonstrates pure frontend architecture with real-time gameplay, procedural difficulty scaling, and mobile-friendly controls—showcasing the ability to engineer interactive systems without external frameworks. Local leaderboard persistence using browser storage illustrates practical client-side state management.

The game combines collision detection, particle effects, and responsive input handling to deliver an engaging, arcade-style experience, highlighting both problem-solving and frontend performance optimization skills.

🎯 Key Features

Real-time top-down racing loop with collision detection and particle effects

Progressive difficulty scaling: speed, spawn rate, lane pressure, and lap timing

Lightning boost power-ups for risk-reward scoring dynamics

Local leaderboard persistence via browser localStorage

Multi-platform input support: keyboard (A/D, arrow keys) + mobile swipe controls

Audio integration with start/mute/unmute functionality

Mobile-optimized responsive layout

🧠 Technical Architecture

System Overview:
Electric Rush uses a single-page, Canvas-driven frontend architecture with a continuous game loop managing state updates, rendering, input handling, and particle effects.

Data Flow:

Input Handling: Keyboard events or swipe gestures captured and normalized

Game Logic Update: Player position, collisions, lap timers, and scoring updated each frame

Rendering Pipeline: Canvas 2D API draws road, traffic, effects, HUD, and score overlays

State Persistence: Local leaderboard entries saved in browser localStorage

Core Components:

Component	Description
game.js	Game state management, update loop, physics, collision detection, particles
index.html	Canvas initialization, HUD overlays, audio controls
style.css	Responsive layout, neon visual styling
localStorage	Persistent leaderboard storage
🛠 Tech Stack

Frontend: HTML5, CSS3, JavaScript (ES6+)

Rendering: Canvas 2D API

State Management: Browser localStorage

Audio/Media: HTML5 <audio> API

Deployment/CI: GitHub Pages, optional GitHub Actions

Tools: Node.js (serve) for local testing, Python HTTP server for quick deployment

📊 Results & Impact

Fully functional framework-free game engine running in the browser

Smooth 60 FPS gameplay loop on desktop and mobile devices

Persistent leaderboard allows competitive scoring for repeat engagement

Modular code structure demonstrates scalable architecture design

⚙️ Installation & Setup

No build step required. Static web project.

Option A – Open directly:

Download or clone repository

Open index.html in your browser

Option B – Run a local server (recommended):

Python:

python -m http.server 8080

Open: http://localhost:8080

Node (serve):

npx serve .

Open the URL shown in terminal

🔍 Controls

Keyboard: A / D or Left / Right arrows

Touch (mobile): Swipe left / right

Audio: Mute/unmute button in the UI overlay

🔍 Lessons Learned

Mastered Canvas 2D API optimizations for real-time rendering

Implemented deterministic collision detection in a dynamic environment

Learned to scale difficulty algorithmically for engaging gameplay

Balanced performance vs. feature complexity on desktop and mobile browsers

Gained experience in client-side state persistence with localStorage

🚀 Future Improvements

Modularize game.js into state, rendering, and system modules

Add deterministic balancing tests for lap difficulty progression

Integrate procedural track generation for dynamic gameplay

Implement AI-driven traffic patterns for smarter challenges

Add cloud-based leaderboard for global competition

📁 Project Structure
Electric Rush/
├─ .github/workflows/deploy.yml    # GitHub Pages CI workflow
├─ .nojekyll                        # Bypass Jekyll for Pages deployment
├─ index.html                        # Game shell, HUD, and canvas
├─ style.css                         # Styling & responsive layout
├─ game.js                           # Game logic, update loop, rendering
├─ music.mp3                         # Background audio
📌 Deployment (GitHub Pages)

Repository Settings → Pages → Source: Deploy from a branch

Branch: main / root

Save changes

Notes:

.nojekyll ensures all files bypass Jekyll processing

Optional: Use GitHub Actions for automated deployment

👤 Author

Daniel Dziewit – Aspiring IT & AI Engineer | Frontend Game Developer

GitHub: github.com/yourusername


Developed Electric Rush as a showcase of frontend engineering, real-time gameplay mechanics, and client-side state management. This project highlights both technical skill and creative problem-solving, designed to be scalable, performant, and recruiter-ready.
