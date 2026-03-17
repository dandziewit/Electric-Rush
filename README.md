# Electric Rush

**Electric Rush** is a high-performance, browser-based **top-down arcade racing game** built with **HTML5 Canvas** and **vanilla JavaScript**. Race down a neon-lit highway, weave through traffic, collect lightning boosts, and chase a high score—optimized for both **desktop and mobile**.

## Demo
- **Play (GitHub Pages):** _Add your GitHub Pages link here_
- **Repo:** dandziewit/Electric-Rush

---

## Features

- **Real-time gameplay loop** (update + render) with smooth Canvas 2D rendering
- **Collision detection** + **particle effects** for responsive arcade feedback
- **Progressive difficulty scaling** (speed, spawn rate, lane pressure, lap timing)
- **Lightning boost power-ups** for risk/reward score strategy
- **Local leaderboard** saved to **`localStorage`**
- **Multi-platform controls**
  - Keyboard: **A/D** or **←/→**
  - Mobile: **swipe left/right**
- **Audio controls** (start + mute/unmute)
- **Mobile-optimized responsive layout**

---

## Tech Stack

- **HTML5 / CSS3 / JavaScript (ES6+)**
- **Rendering:** Canvas 2D API  
- **Persistence:** Browser `localStorage`
- **Audio:** HTML5 `<audio>`
- **Deploy:** GitHub Pages (optionally via GitHub Actions)

---

## Project Structure

```
Electric Rush/
├─ .github/workflows/deploy.yml     # GitHub Pages CI workflow
├─ .nojekyll                        # Bypass Jekyll processing for Pages
├─ index.html                       # Game shell, HUD, and canvas
├─ style.css                        # Styling & responsive layout
├─ game.js                          # Game loop, logic, rendering, collisions, particles
├─ music.mp3                        # Background audio
```

---

## How It Works (Architecture)

Electric Rush is a single-page, Canvas-driven game with a continuous loop that manages:

1. **Input handling**  
   Keyboard events and mobile swipe gestures are captured and normalized.

2. **Game state updates**  
   Player movement, collisions, lap timing, score updates, and difficulty scaling are processed each frame.

3. **Rendering pipeline**  
   The Canvas 2D API draws the road, traffic, effects, HUD, and score overlays.

4. **Persistence**  
   Leaderboard entries are stored locally using browser `localStorage`.

---

## Getting Started

No build step required—this is a static project.

### Option A: Run directly
1. Clone or download the repository  
2. Open `index.html` in your browser

### Option B: Run a local server (recommended)

**Python**
```bash
python -m http.server 8080
```
Then open:
- `http://localhost:8080`

**Node (serve)**
```bash
npx serve .
```
Open the URL printed in your terminal.

---

## Controls

- **Keyboard:** A / D or Left / Right arrows  
- **Mobile:** Swipe left / right  
- **Audio:** Use the in-game UI button to mute/unmute

---

## Results

- Framework-free game engine running fully in the browser
- Smooth **60 FPS** gameplay loop on desktop and mobile
- Persistent leaderboard encourages repeat play and score chasing
- Modular, readable structure that demonstrates scalable frontend architecture

---

## Lessons Learned

- Optimized Canvas 2D rendering for real-time gameplay
- Built deterministic collision detection for a dynamic environment
- Designed algorithmic difficulty scaling to keep gameplay engaging
- Balanced performance vs. visual effects across desktop and mobile
- Implemented client-side persistence using `localStorage`

---

## Roadmap / Future Improvements

- Split `game.js` into modules (state, rendering, systems)
- Add balancing tests for lap/difficulty progression
- Add procedural track generation
- Implement smarter traffic patterns / AI behavior
- Add a cloud-based leaderboard for global competition

---

## License

MIT — see the `LICENSE` file for details.

---

## Author

**Daniel Dziewit** — Aspiring IT & AI Engineer | Frontend Game Developer  
- GitHub: `https://github.com/dandziewit`
- Project: Electric Rush

> Built as a showcase of frontend engineering, real-time gameplay systems, and client-side state management.
