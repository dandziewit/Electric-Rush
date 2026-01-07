# Electric Rush - Cyberpunk Racing Game

A modern, visually polished browser-based racing game inspired by classic Taxi Rush, built with HTML5 Canvas and vanilla JavaScript.

## Game Overview

Race your futuristic Cybertruck down a neon highway, dodging traffic and collecting power-ups. Complete as many laps as possible before time runs out!

## Controls

- **Move Left**: A or Left Arrow
- **Move Right**: D or Right Arrow
- **Accelerate**: W or Up Arrow
- **Brake**: S or Down Arrow
- **Jump**: SPACEBAR (jump over traffic!)

## Gameplay Features

### Continuous Lap System
- The game continues indefinitely until you fail to reach the finish line before time expires
- Each lap completed increases the difficulty:
  - Base speed increases by 0.5
  - Traffic spawns more frequently
  - Available time decreases by 2 seconds (minimum 20 seconds)
- Progressive difficulty scaling creates an authentic Taxi Rush experience

### Jump Mechanics
- Press SPACEBAR to jump over traffic vehicles
- While airborne, you're invulnerable to collisions
- Visual lift animation with dynamic shadow
- 1-second cooldown between jumps
- Landing creates screen shake and particle effects

### Scoring System
- Score increases based on:
  - Distance traveled (10 points per meter)
  - Speed (2x multiplier on speed)
  - Lap completion (1000 points per lap)
- Final score and lap count displayed on game over

### Power-Ups
- Lightning bolt power-ups appear randomly in lanes
- Collecting grants temporary speed boost (2.5 seconds)
- Visual effects: electric glow, motion blur, intensified road glow

### Visual Effects
- **Cyberpunk Aesthetic**: Neon cyan/blue color scheme with dark backgrounds
- **Dynamic Background**: Animated grid with parallax scrolling
- **Speed Lines**: Appear at high speeds for motion blur effect
- **Particle Systems**:
  - Electric sparks during boost
  - Impact debris on collisions
  - Jump and landing effects
  - Lap celebration particles
- **Screen Shake**: On collisions and landings
- **Depth Simulation**: Traffic vehicles scale as they approach
- **Glowing Effects**: Road edges, headlights, taillights all glow dynamically
- **Speed-Responsive Visuals**: Background intensity increases with speed

## Technical Details

### Architecture
- Clean separation of concerns:
  - Configuration constants (easily tweakable)
  - Game state management
  - Input handling
  - Update logic
  - Rendering system
  - Effects system

### Performance
- Smooth 60fps gameplay using `requestAnimationFrame`
- Efficient particle management
- Optimized collision detection with cooldowns
- No external dependencies

### Files
- `index.html` - Game structure and UI
- `style.css` - Modern cyberpunk styling
- `game.js` - Complete game logic and rendering

## Configuration

All gameplay values can be easily adjusted in the `CONFIG` object at the top of `game.js`:

```javascript
// Difficulty scaling
SPEED_INCREASE_PER_LAP: 0.5
TRAFFIC_SPAWN_DECREASE: 100
LAP_TIME_DECREASE: 2

// Jump mechanics
JUMP_DURATION: 0.4
JUMP_HEIGHT: 60
JUMP_COOLDOWN: 1.0

// Scoring
SCORE_PER_METER: 10
SCORE_PER_LAP: 1000
```

## Game Feel Features

- **Smooth Movement**: Easing-based lane changes and speed transitions
- **Fair Hitboxes**: Tight, predictable collision detection
- **Visual Feedback**: Every action has particle effects and visual responses
- **Progressive Challenge**: Difficulty ramps smoothly, not in sudden jumps
- **Audio-Visual Sync**: All effects timed for maximum impact

## How to Play

Simply open `index.html` in any modern web browser. No installation or server required!

## Credits

Developed as a modern take on classic arcade racing games, with heavy inspiration from Taxi Rush's addictive lap-based gameplay.
