# Electric Rush

Electric Rush is a browser-based arcade racing game built with HTML5 Canvas and vanilla JavaScript. The player weaves through traffic in a top-down neon road environment, collects lightning boosts, survives collisions with a limited life pool, and pushes for higher laps and leaderboard scores.

## Why This Project Stands Out

- Pure frontend game architecture (no frameworks, no build step)
- Real-time gameplay loop with collision, particles, and screen effects
- Progressive difficulty scaling across speed, spawn rate, lane pressure, and lap timing
- Local leaderboard persistence using browser storage
- Mobile-friendly controls (swipe) plus keyboard input

## Gameplay Summary

- Perspective: top-down road view
- Core objective: survive as long as possible while finishing laps before the timer expires
- Failure conditions:
  - Timer reaches 0
  - Lives reach 0
- Power-up: lightning boost temporarily increases speed and score potential
- Risk/reward: near misses grant bonus points

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- Canvas 2D API
- Browser localStorage for leaderboard persistence

## Quick Start

No installation is required. This is a static web project.

### Option A: Open directly

1. Open index.html in your browser.

### Option B: Run a local server (recommended)

Using Python:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

Using Node (serve):

```bash
npx serve .
```

Then open the URL shown in your terminal.

## Controls

- Keyboard: A / D or Left / Right arrows
- Touch: swipe left / right
- Audio: mute button in the UI overlay

## Project Structure

```text
Electric Rush/
  .github/
    workflows/
      deploy.yml           # GitHub Pages deployment workflow
  .nojekyll                # Disables Jekyll processing on GitHub Pages
  game.js                  # Core game state, update loop, rendering, effects
  index.html               # App shell, HUD, overlays, and game canvas
  style.css                # Visual styling and responsive layout
  music.mp3                # Background soundtrack
```

## Deployment (GitHub Pages)

This project supports static deployment to GitHub Pages.

Recommended setup:

1. Repository Settings -> Pages
2. Source: Deploy from a branch
3. Branch: main / root
4. Save

Notes:

- .nojekyll is included to bypass Jekyll processing.
- If you use GitHub Actions Pages deployment, ensure repository permissions and Pages source settings are aligned.

## Troubleshooting

### 1) GitHub Pages shows Jekyll build errors

Possible causes:

- Pages source is misconfigured
- Branch deployment is trying to process files with Jekyll defaults

Fix:

- Confirm .nojekyll exists at repository root
- In Settings -> Pages, use Deploy from a branch (main/root) unless Actions deployment is intentionally configured

### 2) Site did not update after push

- Wait 1 to 3 minutes for Pages rebuild
- Check latest commit on main
- Hard refresh browser cache (Ctrl+Shift+R)
- Verify Pages source points to the same branch you pushed

### 3) No leaderboard entries persist

- localStorage may be disabled in the browser
- Private/incognito windows may clear storage automatically
- Clearing browser data removes saved scores

### 4) Music does not play automatically

Many browsers block autoplay until user interaction.

Fix:

- Click Start Game first
- Use the mute/unmute button to re-trigger playback after interaction

## Collaboration Guide

### Recommended workflow

1. Create a feature branch
2. Keep gameplay changes isolated and test in desktop + mobile emulation
3. Open a pull request with before/after notes

### Areas for improvement

- Split game.js into modules (state, rendering, systems)
- Add deterministic balancing tests for lap difficulty progression
- Add CI checks for linting and static validation

## License

No license file is currently included. Add a LICENSE file before public reuse or external contributions.
