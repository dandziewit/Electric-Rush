// =======================
// GAME CONFIGURATION
// =======================
const CONFIG = {
    // Canvas
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    
    // Game mechanics - Taxi Rush style automatic speed increase
    BASE_SPEED: 6, // Starting speed (increased from 5)
    MAX_SPEED: 25, // Much higher ceiling for intense late-game (was 15)
    MIN_SPEED: 3, // Minimum after collisions
    ACCELERATION: 0.5, // Faster acceleration feel
    DECELERATION: 0.3, // Faster braking
    LANE_CHANGE_SPEED: 22, // MUCH faster reflexes for dodging (was 15)
    LANE_SNAP_THRESHOLD: 0.15, // Snap to lane when within this distance
    
    // Timer & distance (per lap) - TIME is the main challenge, not traffic
    INITIAL_LAP_TIME: 33, // More time for early laps (was 30)
    LAP_TIME_DECREASE: 1.1, // Slower time pressure increase (was 1.3)
    MIN_LAP_TIME: 8, // Very tight but infinite endgame - no artificial cap (was 16)
    FINISH_LINE_DISTANCE: 1500, // Longer starting distance (was 1300)
    
    // ===== PROGRESSIVE DIFFICULTY CURVE =====
    // Difficulty scales across 6 dimensions each lap:
    // 1. Speed: Exponential increase via SPEED_INCREASE_MULTIPLIER
    // 2. Spawn Rate: Linear decrease via TRAFFIC_SPAWN_DECREASE
    // 3. Multi-spawn: 1 car -> 2 cars -> 3 cars per spawn cycle
    // 4. Gap Reduction: Multiplicative shrinking via TRAFFIC_GAP_REDUCTION
    // 5. Road Length: +100m per lap makes each lap progressively longer
    // 6. Powerup Rarity: +1s per lap makes boosts more precious
    
    // Difficulty scaling per lap - Gentler progression for longer play
    SPEED_INCREASE_PER_LAP: 1.0, // Increased speed gain for better time completion
    SPEED_INCREASE_MULTIPLIER: 1.12, // More noticeable speed boost per lap
    TRAFFIC_SPAWN_DECREASE: 40, // Even slower traffic increase (was 50)
    MIN_SPAWN_INTERVAL: 280, // Lower floor for lap 10+ difficulty
    TRAFFIC_GAP_REDUCTION: 0.97, // Wider gaps (was 0.96)
    
    // Traffic - Base values for spawning and movement
    TRAFFIC_SPAWN_INTERVAL: 1500, // Keep traffic manageable (was 1400)
    TRAFFIC_BASE_SPEED: 2.5, // Slower than player for dodging opportunities
    TRAFFIC_SPEED_VARIANCE: 2, // Speed randomization for dynamic patterns
    MIN_TRAFFIC_DISTANCE: 105, // More spacing to avoid clutter (was 100)
    
    // Jump mechanics - Arcade tight
    JUMP_DURATION: 0.45, // Higher, more satisfying jump (was 0.35)
    JUMP_HEIGHT: 80, // Much higher jump for better clearance (was 55)
    JUMP_COOLDOWN: 0.8, // Faster cooldown base (was 1.0)
    JUMP_BUFFER_TIME: 0.15, // Early input buffering (seconds)
    JUMP_HITSTOP_DURATION: 0.08, // Landing impact freeze (seconds)
    
    // Power-ups
    POWERUP_SPAWN_INTERVAL: 5000, // Every 5 seconds (was 7000)
    BOOST_DURATION: 2000, // Shorter, more intense (was 2500)
    BOOST_SPEED_MULTIPLIER: 1.8, // Slightly less extreme (was 2.0)
    
    // Collision - MAXIMUM PENALTY: Complete stop
    COLLISION_PENALTY: 0.0, // 100% speed loss - complete stop
    COLLISION_DURATION: 1200, // Faster recovery (was 1500)
    COLLISION_HITSTOP: 0.25, // Strong impact feedback (was 0.18)
    
    // Near-miss system
    NEAR_MISS_DISTANCE: 25, // Pixels from car edge
    NEAR_MISS_SCORE: 25, // Reduced bonus (was 50)
    NEAR_MISS_COOLDOWN: 0.3, // Prevent spam scoring
    
    // Scoring - More balanced progression
    SCORE_PER_METER: 0.5, // Slower score gain (was 1)
    SCORE_PER_LAP: 500, // Lower lap bonus (was 1000)
    SPEED_SCORE_MULTIPLIER: 0.3, // Minimal speed bonus (was 1)
    
    // Visual effects
    PARTICLES_PER_FRAME: 2,
    SCREEN_SHAKE_INTENSITY: 10, // Stronger (was 8)
    SCREEN_SHAKE_DURATION: 250, // Snappier (was 300)
    SPEED_LINES_THRESHOLD: 12, // Start later (was 10)
    CAMERA_ZOOM_MAX: 1.08, // Subtle zoom at high speed
    CAMERA_ZOOM_SPEED_THRESHOLD: 18,
    
    // Road
    NUM_LANES: 4,
    LANE_MARKER_SPEED: 10,
    ROAD_GLOW_INTENSITY: 0.5
};

// =======================
// GAME STATE
// =======================
const game = {
    canvas: null,
    ctx: null,
    
    // State
    state: 'menu', // 'menu', 'playing', 'lapComplete', 'gameOver'
    
    // Player
    player: {
        x: 0,
        y: 0,
        width: 50,
        height: 80,
        currentLane: 1.5, // 0-3
        targetLane: 1.5,
        speed: CONFIG.BASE_SPEED,
        targetSpeed: CONFIG.BASE_SPEED,
        boosted: false,
        boostEndTime: 0,
        
        // Jump mechanics
        isJumping: false,
        jumpProgress: 0, // 0 to 1
        jumpCooldown: 0,
        jumpHeight: 0, // current height off ground
        jumpBuffered: false, // Jump input buffering
        jumpBufferTime: 0
    },
    
    // Game progress
    distance: 0,
    lapDistance: 0, // distance in current lap
    currentLap: 1,
    score: 0,
    timer: CONFIG.INITIAL_LAP_TIME,
    lastTime: 0,
    
    // Difficulty scaling - Exponential curve
    currentSpeedBonus: 0,
    currentSpawnInterval: CONFIG.TRAFFIC_SPAWN_INTERVAL,
    currentLapTime: CONFIG.INITIAL_LAP_TIME,
    trafficGapMultiplier: 1.0, // Reduces safe gaps over time
    currentFinishDistance: CONFIG.FINISH_LINE_DISTANCE, // Increases slightly per lap
    carsPerSpawn: 1, // Number of cars to spawn per cycle (increases with laps)
    
    // Entities
    traffic: [],
    powerups: [],
    particles: [],
    speedLines: [], // for motion blur effect
    
    // Timers
    lastTrafficSpawn: 0,
    lastPowerupSpawn: 0,
    
    // Effects
    screenShake: { x: 0, y: 0, intensity: 0, endTime: 0 },
    damageFlash: { active: false, endTime: 0 },
    collisionCooldown: 0,
    hitStop: { active: false, endTime: 0 }, // Freeze frame effect
    cameraZoom: 1.0, // Dynamic zoom at high speed
    
    // Near-miss tracking
    nearMissTracking: new Map(), // Track cars we've near-missed
    nearMissCooldown: 0,
    
    // Input
    keys: {},
    lastPressedKey: null,
    
    // Audio
    bgMusic: null,
    musicMuted: false,
    
    // Background
    backgroundOffset: 0,
    laneMarkerOffset: 0,
    
    // Road dimensions
    roadWidth: 0,
    roadLeft: 0,
    laneWidth: 0
};

// =======================
// INITIALIZATION
// =======================
function init() {
    game.canvas = document.getElementById('gameCanvas');
    game.ctx = game.canvas.getContext('2d');
    
    // Add roundRect polyfill for browsers that don't support it
    if (!CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
            this.moveTo(x + radius, y);
            this.lineTo(x + width - radius, y);
            this.arcTo(x + width, y, x + width, y + radius, radius);
            this.lineTo(x + width, y + height - radius);
            this.arcTo(x + width, y + height, x + width - radius, y + height, radius);
            this.lineTo(x + radius, y + height);
            this.arcTo(x, y + height, x, y + height - radius, radius);
            this.lineTo(x, y + radius);
            this.arcTo(x, y, x + radius, y, radius);
        };
    }
    
    // Set canvas size
    game.canvas.width = CONFIG.CANVAS_WIDTH;
    game.canvas.height = CONFIG.CANVAS_HEIGHT;
    
    // Calculate road dimensions
    game.roadWidth = CONFIG.CANVAS_WIDTH * 0.6;
    game.roadLeft = (CONFIG.CANVAS_WIDTH - game.roadWidth) / 2;
    game.laneWidth = game.roadWidth / CONFIG.NUM_LANES;
    
    // Setup audio
    game.bgMusic = document.getElementById('bgMusic');
    if (game.bgMusic) {
        game.bgMusic.volume = 0.55; // Set volume to 55%
    }
    
    // Setup input
    setupInput();
    
    // Setup UI
    setupUI();
    
    // Start game loop
    requestAnimationFrame(gameLoop);
}

function setupInput() {
    window.addEventListener('keydown', (e) => {
        if (!game.keys[e.key.toLowerCase()]) {
            game.lastPressedKey = e.key.toLowerCase();
        }
        game.keys[e.key.toLowerCase()] = true;
        game.keys[e.key] = true;
    });
    
    window.addEventListener('keyup', (e) => {
        game.keys[e.key.toLowerCase()] = false;
        game.keys[e.key] = false;
        if (game.lastPressedKey === e.key.toLowerCase()) {
            game.lastPressedKey = null;
        }
    });
}

function setupUI() {
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('submit-score-btn').addEventListener('click', () => {
        const name = document.getElementById('player-name').value;
        submitScore(name, game.score);
    });
    
    // Allow Enter key to submit score
    document.getElementById('player-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const name = document.getElementById('player-name').value;
            submitScore(name, game.score);
        }
    });
}

function startGame() {
    // Hide start screen
    document.getElementById('start-screen').classList.add('hidden');
    
    // Reset game state
    game.state = 'playing';
    game.distance = 0;
    game.lapDistance = 0;
    game.currentLap = 1;
    game.score = 0;
    game.timer = CONFIG.INITIAL_LAP_TIME;
    game.currentLapTime = CONFIG.INITIAL_LAP_TIME;
    game.lastTime = performance.now();
    game.lastTrafficSpawn = 0;
    game.lastPowerupSpawn = 0;
    
    // Reset difficulty
    game.currentSpeedBonus = 0;
    game.currentSpawnInterval = CONFIG.TRAFFIC_SPAWN_INTERVAL;
    game.trafficGapMultiplier = 1.0;
    game.currentFinishDistance = CONFIG.FINISH_LINE_DISTANCE;
    game.carsPerSpawn = 1;
    
    // Reset player
    game.player.currentLane = 1.5;
    game.player.targetLane = 1.5;
    game.player.speed = CONFIG.BASE_SPEED;
    game.player.targetSpeed = CONFIG.BASE_SPEED;
    game.player.boosted = false;
    game.player.y = CONFIG.CANVAS_HEIGHT - 150;
    game.player.isJumping = false;
    game.player.jumpProgress = 0;
    game.player.jumpCooldown = 0;
    game.player.jumpHeight = 0;
    game.player.jumpBuffered = false;
    game.player.jumpBufferTime = 0;
    
    // Start background music
    if (game.bgMusic && !game.musicMuted) {
        game.bgMusic.play().catch(e => console.log('Music play failed:', e));
    }
    
    // Clear entities
    game.traffic = [];
    game.powerups = [];
    game.particles = [];
    game.speedLines = [];
    game.nearMissTracking.clear();
    game.nearMissCooldown = 0;
    
    // Reset effects
    game.screenShake = { x: 0, y: 0, intensity: 0, endTime: 0 };
    game.damageFlash = { active: false, endTime: 0 };
    game.hitStop = { active: false, endTime: 0 };
    game.cameraZoom = 1.0;
    game.backgroundOffset = 0;
    game.laneMarkerOffset = 0;
}

function restartGame() {
    document.getElementById('game-over-screen').classList.add('hidden');
    startGame();
}

// =======================
// GAME LOOP
// =======================
function gameLoop(timestamp) {
    const deltaTime = Math.min((timestamp - game.lastTime) / 1000, 0.1);
    game.lastTime = timestamp;
    
    // Hit-stop (freeze frame effect)
    if (game.hitStop.active) {
        if (timestamp < game.hitStop.endTime) {
            // Freeze - only render, don't update
            render();
            requestAnimationFrame(gameLoop);
            return;
        } else {
            game.hitStop.active = false;
        }
    }
    
    if (game.state === 'playing') {
        update(deltaTime, timestamp);
    }
    
    render();
    
    requestAnimationFrame(gameLoop);
}

// =======================
// UPDATE
// =======================
function update(deltaTime, timestamp) {
    // Update timer
    game.timer -= deltaTime;
    if (game.timer <= 0) {
        endGame();
        return;
    }
    
    // Check lap completion - distance increases each lap for progressive challenge
    if (game.lapDistance >= game.currentFinishDistance) {
        completeLap();
        // Don't return - continue playing immediately for instant transition
    }
    
    // Handle input
    handleInput(deltaTime, timestamp);
    
    // Update player
    updatePlayer(deltaTime);
    
    // Update distance and score
    const distanceGained = game.player.speed * deltaTime * 10;
    game.distance += distanceGained;
    game.lapDistance += distanceGained;
    
    // Score based on distance and speed
    game.score += distanceGained * CONFIG.SCORE_PER_METER;
    game.score += game.player.speed * CONFIG.SPEED_SCORE_MULTIPLIER * deltaTime;
    
    // Spawn traffic
    if (timestamp - game.lastTrafficSpawn > game.currentSpawnInterval) {
        spawnTraffic();
        game.lastTrafficSpawn = timestamp;
    }
    
    // Spawn powerups - slightly rarer in higher laps to keep them meaningful
    // Base: 10s, increases by 1s per lap (capped at 15s)
    const powerupInterval = Math.min(15000, CONFIG.POWERUP_SPAWN_INTERVAL + (game.currentLap * 1000));
    if (timestamp - game.lastPowerupSpawn > powerupInterval) {
        spawnPowerup();
        game.lastPowerupSpawn = timestamp;
    }
    
    // Update entities
    updateTraffic(deltaTime);
    updatePowerups(deltaTime, timestamp);
    updateParticles(deltaTime);
    updateSpeedLines(deltaTime);
    
    // Check boost expiration
    if (game.player.boosted && timestamp > game.player.boostEndTime) {
        game.player.boosted = false;
    }
    
    // Update effects
    updateScreenShake(timestamp);
    updateDamageFlash(timestamp);
    
    // Update background (faster at higher speeds)
    const speedMultiplier = 1 + (game.player.speed / CONFIG.MAX_SPEED) * 0.5;
    game.backgroundOffset += game.player.speed * deltaTime * 50 * speedMultiplier;
    game.laneMarkerOffset += (game.player.speed * CONFIG.LANE_MARKER_SPEED * deltaTime);
    if (game.laneMarkerOffset > 60) game.laneMarkerOffset = 0;
    
    // Generate speed lines at high speed
    if (game.player.speed > CONFIG.SPEED_LINES_THRESHOLD && Math.random() < 0.3) {
        addSpeedLine();
    }
    
    // Update UI
    updateUI();
}

function handleInput(deltaTime, timestamp) {
    // SIDE-TO-SIDE MOVEMENT ONLY (Taxi Rush style)
    // Player cannot control forward speed - it's automatic
    
    // Only process new key press to prevent lane skipping
    if (game.lastPressedKey === 'a' || game.lastPressedKey === 'arrowleft') {
        const currentLaneInt = Math.round(game.player.currentLane);
        game.player.targetLane = Math.max(0, currentLaneInt - 1);
        game.lastPressedKey = null; // Clear to prevent repeat
    }
    
    if (game.lastPressedKey === 'd' || game.lastPressedKey === 'arrowright') {
        const currentLaneInt = Math.round(game.player.currentLane);
        game.player.targetLane = Math.min(3, currentLaneInt + 1);
        game.lastPressedKey = null; // Clear to prevent repeat
    }
    
    // FORWARD SPEED IS AUTOMATIC - No W/S or Up/Down controls
    // Speed automatically increases each lap (Taxi Rush style)
    // Only modified by lightning bolt power-ups
    
    // Jump - INSTANT response when space pressed
    if (game.lastPressedKey === ' ' || game.lastPressedKey === 'space') {
        if (!game.player.isJumping) {
            initiateJump(timestamp);
            game.lastPressedKey = null; // Clear to prevent repeat
        }
    }
}

function updatePlayer(deltaTime) {
    // Smooth lane transition (fast snapping)
    game.player.currentLane += (game.player.targetLane - game.player.currentLane) * CONFIG.LANE_CHANGE_SPEED * deltaTime;
    
    // AUTOMATIC FORWARD SPEED (Taxi Rush style)
    // Speed is determined by lap difficulty and power-ups, not player input
    // 14.97 internal speed = 93 MPH (speed * 10 * 0.621371)
    const automaticSpeed = Math.min(14.97, CONFIG.BASE_SPEED + game.currentSpeedBonus);
    game.player.targetSpeed = game.player.boosted ? 
        Math.min(14.97, automaticSpeed * CONFIG.BOOST_SPEED_MULTIPLIER) : 
        automaticSpeed;
    
    // Smooth speed transition
    game.player.speed += (game.player.targetSpeed - game.player.speed) * 5 * deltaTime;
    
    // Calculate player position - center in lane
    game.player.x = game.roadLeft + (game.player.currentLane * game.laneWidth) + (game.laneWidth / 2) - (game.player.width / 2);
    
    // Add particles when boosted (electric arcs)
    if (game.player.boosted && Math.random() < 0.9) {
        for (let i = 0; i < 4; i++) {
            addParticle(
                game.player.x + game.player.width / 2 + (Math.random() - 0.5) * game.player.width * 1.5,
                game.player.y + game.player.height * Math.random(),
                'electric'
            );
        }
    }
    
    // Update camera zoom based on speed
    const speedRatio = Math.max(0, game.player.speed - CONFIG.CAMERA_ZOOM_SPEED_THRESHOLD) / (CONFIG.MAX_SPEED - CONFIG.CAMERA_ZOOM_SPEED_THRESHOLD);
    const targetZoom = 1 + (speedRatio * (CONFIG.CAMERA_ZOOM_MAX - 1));
    game.cameraZoom += (targetZoom - game.cameraZoom) * 3 * deltaTime;
}

function updateTraffic(deltaTime) {
    // Update near-miss cooldown
    if (game.nearMissCooldown > 0) {
        game.nearMissCooldown -= deltaTime;
    }
    
    for (let i = game.traffic.length - 1; i >= 0; i--) {
        const car = game.traffic[i];
        
        // Move car - normal movement
        car.y += (game.player.speed + car.speed) * deltaTime * 60;
        
        // Scale effect for depth (cars get bigger as they approach)
        const depthFactor = Math.max(0.7, Math.min(1.3, 1 + (car.y - 200) / 600));
        car.scale = depthFactor;
        
        // Remove if off screen
        if (car.y > CONFIG.CANVAS_HEIGHT + 100) {
            game.traffic.splice(i, 1);
            game.nearMissTracking.delete(car);
            continue;
        }
        
        // Near-miss detection
        if (game.nearMissCooldown <= 0 && !game.nearMissTracking.has(car)) {
            if (checkNearMiss(game.player, car)) {
                handleNearMiss(car);
            }
        }
        
        // Check collision - NO JUMPING to avoid
        if (checkCollision(game.player, car) && game.collisionCooldown <= 0) {
            handleCollision(car);
        }
    }
    
    if (game.collisionCooldown > 0) {
        game.collisionCooldown -= deltaTime;
    }
}

// Near-miss detection - Close call without collision
function checkNearMiss(player, car) {
    const playerCenterX = player.x + player.width / 2;
    const carCenterX = car.x + car.width / 2;
    const horizontalDist = Math.abs(playerCenterX - carCenterX);
    
    const verticalOverlap = player.y < car.y + car.height && player.y + player.height > car.y;
    
    // Near-miss if horizontally close but not colliding, and vertically aligned
    if (verticalOverlap && horizontalDist > player.width / 2 + car.width / 2 && 
        horizontalDist < player.width / 2 + car.width / 2 + CONFIG.NEAR_MISS_DISTANCE) {
        return true;
    }
    
    return false;
}

function handleNearMiss(car) {
    // Mark this car as near-missed
    game.nearMissTracking.set(car, true);
    
    // Score bonus
    game.score += CONFIG.NEAR_MISS_SCORE;
    
    // Visual feedback - brief flash
    for (let i = 0; i < 5; i++) {
        addParticle(
            car.x + car.width / 2 + (Math.random() - 0.5) * car.width,
            car.y + car.height / 2,
            'nearmiss'
        );
    }
    
    // Cooldown to prevent spam
    game.nearMissCooldown = CONFIG.NEAR_MISS_COOLDOWN;
}

function updatePowerups(deltaTime, timestamp) {
    for (let i = game.powerups.length - 1; i >= 0; i--) {
        const powerup = game.powerups[i];
        
        // Move powerup
        powerup.y += game.player.speed * deltaTime * 60;
        
        // Animate
        powerup.rotation += deltaTime * 3;
        powerup.pulseOffset += deltaTime * 5;
        
        // Remove if off screen
        if (powerup.y > CONFIG.CANVAS_HEIGHT + 100) {
            game.powerups.splice(i, 1);
            continue;
        }
        
        // Check collection
        if (checkCollision(game.player, powerup)) {
            collectPowerup(timestamp);
            game.powerups.splice(i, 1);
        }
    }
}

function updateParticles(deltaTime) {
    for (let i = game.particles.length - 1; i >= 0; i--) {
        const p = game.particles[i];
        
        p.x += p.vx * deltaTime * 60;
        p.y += p.vy * deltaTime * 60;
        p.life -= deltaTime;
        p.alpha = Math.max(0, p.life / p.maxLife);
        
        if (p.life <= 0) {
            game.particles.splice(i, 1);
        }
    }
}

function updateScreenShake(timestamp) {
    if (timestamp < game.screenShake.endTime) {
        const intensity = game.screenShake.intensity;
        game.screenShake.x = (Math.random() - 0.5) * intensity;
        game.screenShake.y = (Math.random() - 0.5) * intensity;
    } else {
        game.screenShake.x = 0;
        game.screenShake.y = 0;
        game.screenShake.intensity = 0;
    }
}

function updateDamageFlash(timestamp) {
    game.damageFlash.active = timestamp < game.damageFlash.endTime;
}

function updateUI() {
    document.getElementById('timer-value').textContent = Math.ceil(game.timer);
    // Show distance with lap's total distance (increases per lap)
    document.getElementById('distance-value').textContent = Math.floor(game.lapDistance) + '/' + game.currentFinishDistance;
    
    // Display speed in MPH (Miles Per Hour)
    // Internal speed × 10 gives km/h, then × 0.621371 converts to MPH
    const mph = Math.floor(game.player.speed * 10 * 0.621371);
    document.getElementById('speed-value').textContent = mph;
    
    document.getElementById('lap-value').textContent = game.currentLap;
    document.getElementById('score-value').textContent = Math.floor(game.score);
}

// =======================
// NEW GAME MECHANICS
// =======================
function initiateJump(timestamp) {
    game.player.isJumping = true;
    game.player.jumpProgress = 0;
    game.player.jumpBuffered = false; // Clear buffer
    
    // Jump particles - electric burst
    for (let i = 0; i < 20; i++) {
        addParticle(
            game.player.x + game.player.width / 2 + (Math.random() - 0.5) * game.player.width,
            game.player.y + game.player.height,
            'jump'
        );
    }
}

function completeLap() {
    game.currentLap++;
    game.lapDistance = 0;
    // No score bonus for completing lap - removed
    
    // ===== PROGRESSIVE DIFFICULTY SCALING =====
    // Each lap exponentially increases challenge across multiple dimensions
    
    // 1. SPEED SCALING - Exponential increase per lap
    // Early laps: +0.8, +0.92, +1.06... Caps at lap 10
    if (game.currentLap <= 10) {
        const lapMultiplier = Math.pow(CONFIG.SPEED_INCREASE_MULTIPLIER, game.currentLap - 1);
        game.currentSpeedBonus += CONFIG.SPEED_INCREASE_PER_LAP * lapMultiplier;
    }
    
    // 2. TRAFFIC SPAWN RATE - Faster spawning each lap
    // Laps 1-8: gentle, Lap 9: moderate, Lap 10: aggressive, 11-12: very aggressive, 13+: relentless
    if (game.currentLap <= 10) {
        let spawnDecrease;
        if (game.currentLap === 10) {
            spawnDecrease = CONFIG.TRAFFIC_SPAWN_DECREASE * 3.0; // Very aggressive for lap 10
        } else if (game.currentLap === 9) {
            spawnDecrease = CONFIG.TRAFFIC_SPAWN_DECREASE * 1.5; // Moderate for lap 9
        } else {
            spawnDecrease = CONFIG.TRAFFIC_SPAWN_DECREASE; // Gentle for laps 1-8
        }
        game.currentSpawnInterval = Math.max(
            CONFIG.MIN_SPAWN_INTERVAL,
            game.currentSpawnInterval - spawnDecrease
        );
    } else if (game.currentLap <= 12) {
        // Lap 11-12: Continue aggressive increase
        game.currentSpawnInterval = Math.max(
            CONFIG.MIN_SPAWN_INTERVAL,
            game.currentSpawnInterval - CONFIG.TRAFFIC_SPAWN_DECREASE * 2.0
        );
    } else {
        // Lap 13+: Relentless increase until impossible
        game.currentSpawnInterval = Math.max(
            200, // Lower absolute minimum for lap 13+
            game.currentSpawnInterval - CONFIG.TRAFFIC_SPAWN_DECREASE * 2.5
        );
    }
    
    // 3. MULTI-CAR SPAWNING - More cars spawn together in higher laps
    // Lap 1-5: 1 car, Lap 6+: 2 cars (ensures 2 lanes always open)
    if (game.currentLap >= 6) {
        game.carsPerSpawn = 2; // Max 2 cars to keep 2 lanes open
    } else {
        game.carsPerSpawn = 1; // Single car spawns early game
    }
    
    // 4. GAP REDUCTION - Traffic packs tighter each lap
    // Laps 1-8: gentle, Lap 9: moderate, Lap 10: aggressive, 11-12: continues, 13+: relentless
    let gapReduction;
    if (game.currentLap > 12) {
        gapReduction = CONFIG.TRAFFIC_GAP_REDUCTION * 0.97; // Relentless after lap 12
    } else if (game.currentLap > 10) {
        gapReduction = CONFIG.TRAFFIC_GAP_REDUCTION * 0.985; // Continue slowly laps 11-12
    } else if (game.currentLap === 10) {
        gapReduction = CONFIG.TRAFFIC_GAP_REDUCTION * 0.93; // Aggressive for lap 10
    } else if (game.currentLap === 9) {
        gapReduction = CONFIG.TRAFFIC_GAP_REDUCTION * 0.96; // Moderate for lap 9
    } else {
        gapReduction = CONFIG.TRAFFIC_GAP_REDUCTION; // Gentle for laps 1-8
    }
    game.trafficGapMultiplier *= gapReduction;
    
    // 5. ROAD LENGTHENING - Longer distance to finish each lap
    // Laps 1-7: +200m per lap, Laps 8-10: stays at lap 7, Lap 11+: 3000m
    if (game.currentLap > 10) {
        game.currentFinishDistance = 3000; // Fixed 3000m after lap 10
    } else {
        const lapForDistance = Math.min(game.currentLap, 7);
        game.currentFinishDistance = CONFIG.FINISH_LINE_DISTANCE + (lapForDistance * 200);
    }
    
    // 6. TIME PRESSURE - Reduce available time per lap
    // Laps 1-8: gentle, Lap 9: moderate, Lap 10: aggressive, 11-12: steady, 13+: relentless
    if (game.currentLap <= 10) {
        let timeDecrease;
        if (game.currentLap === 10) {
            timeDecrease = CONFIG.LAP_TIME_DECREASE * 2.0; // Aggressive for lap 10
        } else if (game.currentLap === 9) {
            timeDecrease = CONFIG.LAP_TIME_DECREASE * 1.3; // Moderate for lap 9
        } else {
            timeDecrease = CONFIG.LAP_TIME_DECREASE; // Gentle for laps 1-8
        }
        game.currentLapTime = Math.max(
            CONFIG.MIN_LAP_TIME,
            game.currentLapTime - timeDecrease
        );
    } else if (game.currentLap > 12) {
        // Lap 13+: Continue reducing time until impossible
        game.currentLapTime = Math.max(
            6, // Lower absolute minimum for lap 13+
            game.currentLapTime - CONFIG.LAP_TIME_DECREASE * 0.8
        );
    }
    
    // Reset timer for next lap
    game.timer = game.currentLapTime;
    
    // Automatically increase player speed for Taxi Rush feel
    game.player.targetSpeed = Math.min(
        CONFIG.MAX_SPEED + game.currentSpeedBonus,
        CONFIG.BASE_SPEED + game.currentSpeedBonus
    );
    
    // DON'T clear traffic - keeps gameplay flowing without delay
    // Traffic continues seamlessly into next lap
    game.nearMissTracking.clear();
    
    // Celebration particles - explosive
    for (let i = 0; i < 80; i++) {
        addParticle(
            CONFIG.CANVAS_WIDTH / 2 + (Math.random() - 0.5) * 300,
            CONFIG.CANVAS_HEIGHT / 2 + (Math.random() - 0.5) * 300,
            'celebrate'
        );
    }
}

function updateSpeedLines(deltaTime) {
    for (let i = game.speedLines.length - 1; i >= 0; i--) {
        const line = game.speedLines[i];
        
        line.y += line.speed * deltaTime * 60;
        line.life -= deltaTime;
        line.alpha = Math.max(0, line.life / line.maxLife);
        
        if (line.life <= 0 || line.y > CONFIG.CANVAS_HEIGHT) {
            game.speedLines.splice(i, 1);
        }
    }
}

function addSpeedLine() {
    game.speedLines.push({
        x: Math.random() * CONFIG.CANVAS_WIDTH,
        y: -10,
        speed: game.player.speed * 2 + Math.random() * 5,
        life: 0.8,
        maxLife: 0.8,
        alpha: 1,
        length: 30 + Math.random() * 40
    });
}

// =======================
// SPAWNING
// =======================
function spawnTraffic() {
    // ===== MULTI-CAR SPAWNING SYSTEM =====
    // Spawn multiple cars per cycle based on current lap difficulty
    // Higher laps = more cars spawned simultaneously = much harder dodging
    
    const carsToSpawn = game.carsPerSpawn;
    const availableLanes = [0, 1, 2, 3];
    const spawnedLanes = [];
    
    // Apply gap reduction from difficulty scaling
    // Gaps shrink each lap: 80px -> 74px -> 68px -> 62px...
    const minDistance = CONFIG.MIN_TRAFFIC_DISTANCE * game.trafficGapMultiplier;
    
    for (let i = 0; i < carsToSpawn; i++) {
        // Pick a random lane that hasn't been used yet this spawn
        const remainingLanes = availableLanes.filter(l => !spawnedLanes.includes(l));
        if (remainingLanes.length === 0) break; // All lanes used
        
        const lane = remainingLanes[Math.floor(Math.random() * remainingLanes.length)];
        
        // Check if lane is clear (respects minimum distance)
        let laneBlocked = false;
        for (const car of game.traffic) {
            const carLane = Math.floor((car.x - game.roadLeft) / game.laneWidth);
            if (carLane === lane && car.y < minDistance) {
                laneBlocked = true;
                break;
            }
        }
        
        if (!laneBlocked) {
            const types = ['sedan', 'suv', 'sports'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            // Visual variety - more color options, modern look
            const colors = [
                'hsl(0, 80%, 55%)',    // Red
                'hsl(210, 80%, 55%)',  // Blue  
                'hsl(45, 80%, 55%)',   // Yellow
                'hsl(280, 80%, 55%)',  // Purple
                'hsl(160, 80%, 55%)',  // Cyan
                'hsl(30, 80%, 55%)',   // Orange
                'hsl(0, 0%, 20%)',     // Dark gray
                'hsl(0, 0%, 95%)'      // White
            ];
            
            game.traffic.push({
                x: game.roadLeft + lane * game.laneWidth + game.laneWidth / 2 - 25,
                y: -100,
                width: 50,
                height: type === 'suv' ? 90 : 80,
                speed: CONFIG.TRAFFIC_BASE_SPEED + (Math.random() - 0.5) * CONFIG.TRAFFIC_SPEED_VARIANCE,
                type: type,
                color: colors[Math.floor(Math.random() * colors.length)],
                scale: 1
            });
            
            spawnedLanes.push(lane);
        }
    }
}

function spawnPowerup() {
    const lane = Math.floor(Math.random() * CONFIG.NUM_LANES);
    
    game.powerups.push({
        x: game.roadLeft + lane * game.laneWidth + game.laneWidth / 2 - 15,
        y: -100,
        width: 30,
        height: 30,
        rotation: 0,
        pulseOffset: 0
    });
}

// =======================
// COLLISION & EFFECTS
// =======================
function checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function handleCollision(car) {
    // Hit-stop effect (freeze frame for impact)
    game.hitStop.active = true;
    game.hitStop.endTime = performance.now() + CONFIG.COLLISION_HITSTOP * 1000;
    
    // MASSIVE SPEED PENALTY - Collision is very punishing
    // Player loses most of their speed and must recover
    game.player.speed *= CONFIG.COLLISION_PENALTY;
    game.player.targetSpeed *= CONFIG.COLLISION_PENALTY;
    
    // Score penalty for collision
    game.score = Math.max(0, game.score - 250);
    
    // Strong screen shake
    game.screenShake.intensity = CONFIG.SCREEN_SHAKE_INTENSITY * 1.5;
    game.screenShake.endTime = performance.now() + CONFIG.SCREEN_SHAKE_DURATION * 1.5;
    
    // Damage flash
    game.damageFlash.active = true;
    game.damageFlash.endTime = performance.now() + CONFIG.COLLISION_DURATION;
    
    // Collision cooldown
    game.collisionCooldown = 1;
    
    // Explosive impact particles
    for (let i = 0; i < 25; i++) {
        addParticle(
            car.x + car.width / 2,
            car.y + car.height / 2,
            'impact'
        );
    }
}

function collectPowerup(timestamp) {
    // Activate boost - explosive feel
    game.player.boosted = true;
    game.player.boostEndTime = timestamp + CONFIG.BOOST_DURATION;
    game.player.targetSpeed = (CONFIG.MAX_SPEED + game.currentSpeedBonus) * CONFIG.BOOST_SPEED_MULTIPLIER;
    
    // Add score boost for collecting powerup
    game.score += 500;
    
    // Explosive screen shake
    game.screenShake.intensity = CONFIG.SCREEN_SHAKE_INTENSITY * 0.8;
    game.screenShake.endTime = timestamp + 200;
    
    // Massive particle burst
    for (let i = 0; i < 40; i++) {
        addParticle(
            game.player.x + game.player.width / 2,
            game.player.y + game.player.height / 2,
            'collect'
        );
    }
}

function addParticle(x, y, type) {
    const particle = {
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        life: 1,
        maxLife: 1,
        alpha: 1,
        size: Math.random() * 3 + 2,
        color: '#0ff'
    };
    
    if (type === 'electric') {
        // Electric arc particles - crackle effect
        particle.color = `hsl(${180 + Math.random() * 60}, 100%, ${70 + Math.random() * 20}%)`;
        particle.vy += 3;
        particle.vx *= 2;
        particle.life = 0.4;
        particle.maxLife = 0.4;
        particle.size = Math.random() * 2 + 1;
    } else if (type === 'impact') {
        particle.color = `hsl(${Math.random() * 60}, 100%, 50%)`; // Red-orange
        particle.vx *= 4;
        particle.vy *= 4;
        particle.life = 0.6;
        particle.maxLife = 0.6;
        particle.size = Math.random() * 5 + 3;
    } else if (type === 'collect') {
        // Explosive collection effect
        particle.color = `hsl(${180 + Math.random() * 60}, 100%, 60%)`;
        particle.vx *= 3;
        particle.vy *= 3;
        particle.life = 1.2;
        particle.maxLife = 1.2;
        particle.size = Math.random() * 4 + 2;
    } else if (type === 'jump') {
        particle.color = `hsl(${180 + Math.random() * 60}, 100%, 70%)`;
        particle.vy = -Math.random() * 4 - 3;
        particle.vx *= 1.5;
        particle.life = 0.5;
        particle.maxLife = 0.5;
    } else if (type === 'landing') {
        particle.color = `rgba(255, 255, 255, ${0.6 + Math.random() * 0.4})`;
        particle.vx *= 2;
        particle.vy = -Math.random() * 3;
        particle.life = 0.3;
        particle.maxLife = 0.3;
        particle.size = Math.random() * 3 + 2;
    } else if (type === 'celebrate') {
        particle.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
        particle.vx = (Math.random() - 0.5) * 10;
        particle.vy = -Math.random() * 10 - 8;
        particle.life = 2.0;
        particle.maxLife = 2.0;
        particle.size = Math.random() * 6 + 3;
    } else if (type === 'nearmiss') {
        // Near-miss indicator - yellow flash
        particle.color = `hsl(60, 100%, ${60 + Math.random() * 20}%)`;
        particle.vx *= 1.5;
        particle.vy *= 1.5;
        particle.life = 0.4;
        particle.maxLife = 0.4;
        particle.size = Math.random() * 3 + 2;
    }
    
    game.particles.push(particle);
}

// =======================
// RENDERING
// =======================
function render() {
    const ctx = game.ctx;
    
    // Apply screen shake
    ctx.save();
    ctx.translate(game.screenShake.x, game.screenShake.y);
    
    // Apply camera zoom (subtle at high speeds)
    if (game.cameraZoom !== 1.0) {
        const centerX = CONFIG.CANVAS_WIDTH / 2;
        const centerY = CONFIG.CANVAS_HEIGHT / 2;
        ctx.translate(centerX, centerY);
        ctx.scale(game.cameraZoom, game.cameraZoom);
        ctx.translate(-centerX, -centerY);
    }
    
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    
    // Draw background
    drawBackground();
    
    // Draw speed lines (behind everything)
    drawSpeedLines();
    
    // Draw road
    drawRoad();
    
    // Draw entities
    drawTraffic();
    drawPowerups();
    drawPlayer();
    drawParticles();
    
    // Draw damage flash
    if (game.damageFlash.active) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
    }
    
    ctx.restore();
}

function drawBackground() {
    const ctx = game.ctx;
    
    // Parallax background - starfield/grid effect
    ctx.save();
    
    const offset = game.backgroundOffset % 100;
    const speedIntensity = Math.min(1, game.player.speed / CONFIG.MAX_SPEED);
    
    // Grid lines
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.05 + speedIntensity * 0.1})`;
    ctx.lineWidth = 1;
    
    for (let i = -1; i < 8; i++) {
        const y = i * 100 - offset;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CONFIG.CANVAS_WIDTH, y);
        ctx.stroke();
    }
    
    // Vertical lines with perspective
    for (let i = 0; i < 10; i++) {
        const x = i * 100;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + offset * 0.5, CONFIG.CANVAS_HEIGHT);
        ctx.stroke();
    }
    
    // Ambient glow points (intensify with speed or boost)
    const glowIntensity = (game.player.boosted ? 1 : speedIntensity);
    if (glowIntensity > 0.3) {
        for (let i = 0; i < 30; i++) {
            const x = (i * 137.5 + game.backgroundOffset * 2) % CONFIG.CANVAS_WIDTH;
            const y = (i * 97.3 + game.backgroundOffset) % CONFIG.CANVAS_HEIGHT;
            const size = 2 + Math.sin(game.backgroundOffset * 0.01 + i) * 1;
            
            ctx.fillStyle = `rgba(0, 255, 255, ${0.2 * glowIntensity + Math.sin(game.backgroundOffset * 0.02 + i) * 0.1})`;
            ctx.fillRect(x, y, size, size);
        }
    }
    
    ctx.restore();
}

function drawSpeedLines() {
    const ctx = game.ctx;
    
    // Speed lines intensity increases with speed
    const speedRatio = game.player.speed / CONFIG.MAX_SPEED;
    const alpha = Math.min(0.6, speedRatio * 0.8);
    
    for (const line of game.speedLines) {
        ctx.strokeStyle = `rgba(0, 255, 255, ${line.alpha * alpha})`;
        ctx.lineWidth = 2 + speedRatio * 2; // Thicker at high speed
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x, line.y + line.length * (1 + speedRatio));
        ctx.stroke();
    }
}

function drawRoad() {
    const ctx = game.ctx;
    const roadCenterX = CONFIG.CANVAS_WIDTH / 2;
    
    // Road gradient with glow
    const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(0.5, '#1a1a1a');
    gradient.addColorStop(1, '#0a0a0a');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(game.roadLeft, 0, game.roadWidth, CONFIG.CANVAS_HEIGHT);
    
    // Road edge glow (stronger at high speed and boost)
    const speedIntensity = Math.min(1, game.player.speed / CONFIG.MAX_SPEED);
    const boostMultiplier = game.player.boosted ? 1.8 : 1;
    const glowIntensity = (0.4 + speedIntensity * 0.5) * boostMultiplier;
    
    ctx.shadowBlur = (20 + speedIntensity * 30) * boostMultiplier;
    ctx.shadowColor = `rgba(0, 255, 255, ${Math.min(1, glowIntensity)})`;
    ctx.strokeStyle = `rgba(0, 255, 255, ${Math.min(1, glowIntensity)})`;
    ctx.lineWidth = game.player.boosted ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(game.roadLeft, 0);
    ctx.lineTo(game.roadLeft, CONFIG.CANVAS_HEIGHT);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(game.roadLeft + game.roadWidth, 0);
    ctx.lineTo(game.roadLeft + game.roadWidth, CONFIG.CANVAS_HEIGHT);
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    
    // Lane markers with animation
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    
    for (let i = 1; i < CONFIG.NUM_LANES; i++) {
        const x = game.roadLeft + i * game.laneWidth;
        ctx.save();
        ctx.translate(0, -game.laneMarkerOffset);
        ctx.beginPath();
        ctx.moveTo(x, -60);
        ctx.lineTo(x, CONFIG.CANVAS_HEIGHT + 60);
        ctx.stroke();
        ctx.restore();
    }
    
    ctx.setLineDash([]);
    
    // Lap progress indicator - uses current lap's finish distance
    const distanceToFinish = game.currentFinishDistance - game.lapDistance;
    if (distanceToFinish < 500 && distanceToFinish > 0) {
        const finishY = CONFIG.CANVAS_HEIGHT * (1 - distanceToFinish / 500);
        
        ctx.strokeStyle = `rgba(0, 255, 0, ${Math.sin(performance.now() * 0.01) * 0.3 + 0.5})`;
        ctx.lineWidth = 4;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(game.roadLeft, finishY);
        ctx.lineTo(game.roadLeft + game.roadWidth, finishY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Finish text
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#0f0';
        ctx.font = 'bold 20px Courier New';
        ctx.fillStyle = '#0f0';
        ctx.textAlign = 'center';
        ctx.fillText(`LAP ${game.currentLap} FINISH`, roadCenterX, finishY - 10);
        ctx.shadowBlur = 0;
    }
}

function drawPlayer() {
    const ctx = game.ctx;
    const p = game.player;
    
    ctx.save();
    
    // Boost glow
    if (p.boosted) {
        ctx.shadowBlur = 40;
        ctx.shadowColor = 'rgba(0, 255, 255, 1)';
        
        // Electric aura (pulsing)
        const pulse = Math.sin(performance.now() * 0.01) * 0.3 + 0.7;
        ctx.strokeStyle = `rgba(0, 255, 255, ${pulse})`;
        ctx.lineWidth = 4;
        ctx.strokeRect(p.x - 8, p.y - 8, p.width + 16, p.height + 16);
    }
    
    // IMPROVED CYBERTRUCK - angular futuristic design
    // Base metallic color with gradient
    const bodyGradient = ctx.createLinearGradient(p.x, p.y, p.x + p.width, p.y);
    bodyGradient.addColorStop(0, '#666');
    bodyGradient.addColorStop(0.5, '#999');
    bodyGradient.addColorStop(1, '#666');
    ctx.fillStyle = bodyGradient;
    
    // Main body
    ctx.beginPath();
    ctx.moveTo(p.x + p.width * 0.5, p.y); // Top center
    ctx.lineTo(p.x + p.width * 0.9, p.y + p.height * 0.3); // Top right
    ctx.lineTo(p.x + p.width, p.y + p.height * 0.7); // Bottom right
    ctx.lineTo(p.x + p.width * 0.8, p.y + p.height); // Bottom right corner
    ctx.lineTo(p.x + p.width * 0.2, p.y + p.height); // Bottom left corner
    ctx.lineTo(p.x, p.y + p.height * 0.7); // Bottom left
    ctx.lineTo(p.x + p.width * 0.1, p.y + p.height * 0.3); // Top left
    ctx.closePath();
    ctx.fill();
    
    // Metallic highlights
    const highlightGradient = ctx.createLinearGradient(p.x, p.y, p.x + p.width, p.y);
    highlightGradient.addColorStop(0, 'rgba(200, 200, 200, 0.3)');
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
    highlightGradient.addColorStop(1, 'rgba(200, 200, 200, 0.3)');
    
    ctx.fillStyle = highlightGradient;
    ctx.beginPath();
    ctx.moveTo(p.x + p.width * 0.5, p.y + 5);
    ctx.lineTo(p.x + p.width * 0.85, p.y + p.height * 0.35);
    ctx.lineTo(p.x + p.width * 0.7, p.y + p.height * 0.5);
    ctx.lineTo(p.x + p.width * 0.3, p.y + p.height * 0.5);
    ctx.lineTo(p.x + p.width * 0.15, p.y + p.height * 0.35);
    ctx.closePath();
    ctx.fill();
    
    // Windows (dark)
    ctx.fillStyle = 'rgba(0, 50, 100, 0.8)';
    ctx.beginPath();
    ctx.moveTo(p.x + p.width * 0.5, p.y + 10);
    ctx.lineTo(p.x + p.width * 0.75, p.y + p.height * 0.35);
    ctx.lineTo(p.x + p.width * 0.6, p.y + p.height * 0.45);
    ctx.lineTo(p.x + p.width * 0.4, p.y + p.height * 0.45);
    ctx.lineTo(p.x + p.width * 0.25, p.y + p.height * 0.35);
    ctx.closePath();
    ctx.fill();
    
    // Headlights glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = p.boosted ? '#0ff' : '#fff';
    ctx.fillStyle = p.boosted ? '#0ff' : '#fff';
    ctx.fillRect(p.x + 5, p.y + p.height - 10, 8, 8);
    ctx.fillRect(p.x + p.width - 13, p.y + p.height - 10, 8, 8);
    
    // Cyber glow outline
    ctx.shadowBlur = 0;
    ctx.strokeStyle = p.boosted ? '#0ff' : '#0aa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x + p.width * 0.5, p.y);
    ctx.lineTo(p.x + p.width * 0.9, p.y + p.height * 0.3);
    ctx.lineTo(p.x + p.width, p.y + p.height * 0.7);
    ctx.lineTo(p.x + p.width * 0.8, p.y + p.height);
    ctx.lineTo(p.x + p.width * 0.2, p.y + p.height);
    ctx.lineTo(p.x, p.y + p.height * 0.7);
    ctx.lineTo(p.x + p.width * 0.1, p.y + p.height * 0.3);
    ctx.closePath();
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    ctx.restore();
}

function drawTraffic() {
    const ctx = game.ctx;
    
    for (const car of game.traffic) {
        ctx.save();
        
        // Apply depth scaling for perspective
        const scale = car.scale || 1;
        const scaledWidth = car.width * scale;
        const scaledHeight = car.height * scale;
        const offsetX = (car.width - scaledWidth) / 2;
        const offsetY = (car.height - scaledHeight) / 2;
        
        const drawX = car.x + offsetX;
        const drawY = car.y + offsetY;
        
        if (car.type === 'sedan') {
            // Modern sedan with rounded edges
            ctx.fillStyle = car.color;
            
            // Main body
            ctx.beginPath();
            ctx.roundRect(drawX, drawY + scaledHeight * 0.3, scaledWidth, scaledHeight * 0.7, 5 * scale);
            ctx.fill();
            
            // Roof/cabin (darker, rounded)
            const gradient = ctx.createLinearGradient(drawX, drawY, drawX, drawY + scaledHeight * 0.5);
            gradient.addColorStop(0, car.color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(drawX + scaledWidth * 0.15, drawY + scaledHeight * 0.05, scaledWidth * 0.7, scaledHeight * 0.4, 5 * scale);
            ctx.fill();
            
            // Windows (dark blue tint)
            ctx.fillStyle = 'rgba(100, 150, 200, 0.3)';
            ctx.fillRect(drawX + scaledWidth * 0.2, drawY + scaledHeight * 0.1, scaledWidth * 0.25, scaledHeight * 0.25);
            ctx.fillRect(drawX + scaledWidth * 0.55, drawY + scaledHeight * 0.1, scaledWidth * 0.25, scaledHeight * 0.25);
            
        } else if (car.type === 'suv') {
            // Boxy SUV/truck
            ctx.fillStyle = car.color;
            
            // Main body (taller)
            ctx.fillRect(drawX, drawY + scaledHeight * 0.2, scaledWidth, scaledHeight * 0.8);
            
            // Cabin
            const gradient = ctx.createLinearGradient(drawX, drawY, drawX, drawY + scaledHeight * 0.4);
            gradient.addColorStop(0, car.color);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
            ctx.fillStyle = gradient;
            ctx.fillRect(drawX + scaledWidth * 0.1, drawY, scaledWidth * 0.8, scaledHeight * 0.35);
            
            // Windows
            ctx.fillStyle = 'rgba(100, 150, 200, 0.4)';
            ctx.fillRect(drawX + scaledWidth * 0.15, drawY + scaledHeight * 0.05, scaledWidth * 0.3, scaledHeight * 0.22);
            ctx.fillRect(drawX + scaledWidth * 0.55, drawY + scaledHeight * 0.05, scaledWidth * 0.3, scaledHeight * 0.22);
            
        } else if (car.type === 'sports') {
            // Sleek sports car (low profile)
            ctx.fillStyle = car.color;
            
            // Body (aerodynamic)
            ctx.beginPath();
            ctx.moveTo(drawX + scaledWidth * 0.5, drawY + scaledHeight * 0.1);
            ctx.lineTo(drawX + scaledWidth * 0.95, drawY + scaledHeight * 0.4);
            ctx.lineTo(drawX + scaledWidth, drawY + scaledHeight);
            ctx.lineTo(drawX, drawY + scaledHeight);
            ctx.lineTo(drawX + scaledWidth * 0.05, drawY + scaledHeight * 0.4);
            ctx.closePath();
            ctx.fill();
            
            // Spoiler
            ctx.fillRect(drawX + scaledWidth * 0.2, drawY + scaledHeight * 0.05, scaledWidth * 0.6, 3 * scale);
            
            // Window (small, dark)
            ctx.fillStyle = 'rgba(50, 50, 100, 0.6)';
            ctx.beginPath();
            ctx.moveTo(drawX + scaledWidth * 0.5, drawY + scaledHeight * 0.15);
            ctx.lineTo(drawX + scaledWidth * 0.75, drawY + scaledHeight * 0.35);
            ctx.lineTo(drawX + scaledWidth * 0.25, drawY + scaledHeight * 0.35);
            ctx.closePath();
            ctx.fill();
        }
        
        // Bright glowing taillights (RED)
        ctx.shadowBlur = 15 * scale;
        ctx.shadowColor = '#ff0000';
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.ellipse(drawX + scaledWidth * 0.15, drawY + 3 * scale, 5 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(drawX + scaledWidth * 0.85, drawY + 3 * scale, 5 * scale, 3 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Headlights (WHITE/YELLOW) - when facing away they're not visible, but add glow
        ctx.shadowBlur = 8 * scale;
        ctx.shadowColor = '#ffff99';
        ctx.fillStyle = '#ffff99';
        ctx.fillRect(drawX + scaledWidth * 0.1, drawY + scaledHeight - 5 * scale, 8 * scale, 3 * scale);
        ctx.fillRect(drawX + scaledWidth * 0.82, drawY + scaledHeight - 5 * scale, 8 * scale, 3 * scale);
        ctx.shadowBlur = 0;
        
        // Metallic outline
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(drawX, drawY, scaledWidth, scaledHeight);
        
        ctx.restore();
    }
}

function drawPowerups() {
    const ctx = game.ctx;
    
    for (const powerup of game.powerups) {
        ctx.save();
        
        const centerX = powerup.x + powerup.width / 2;
        const centerY = powerup.y + powerup.height / 2;
        
        // Intense pulsing glow with strong flicker
        const pulse = Math.sin(powerup.pulseOffset) * 0.5 + 0.7;
        const flicker = Math.random() > 0.15 ? 1 : 0.3; // Strong flicker effect
        
        // Outer electric ring (yellow/cyan)
        ctx.shadowBlur = 40 * pulse * flicker;
        ctx.shadowColor = '#ffff00';
        ctx.strokeStyle = `rgba(255, 255, 0, ${0.5 * pulse * flicker})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 25 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner electric ring (cyan)
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.6 * pulse * flicker})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 18 * pulse, 0, Math.PI * 2);
        ctx.stroke();
        
        // Rotate lightning bolt
        ctx.translate(centerX, centerY);
        ctx.rotate(powerup.rotation);
        
        // JAGGED LIGHTNING BOLT SHAPE
        const boltAlpha = flicker;
        ctx.globalAlpha = boltAlpha;
        
        // Outer bolt (bright yellow)
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ffff00';
        ctx.fillStyle = '#ffff00';
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'miter';
        
        ctx.beginPath();
        // Jagged lightning bolt path
        ctx.moveTo(-6, -18);
        ctx.lineTo(2, -8);
        ctx.lineTo(-2, -6);
        ctx.lineTo(4, -2);
        ctx.lineTo(-1, 0);
        ctx.lineTo(10, 18);
        ctx.lineTo(2, 8);
        ctx.lineTo(4, 4);
        ctx.lineTo(-2, 2);
        ctx.lineTo(1, -2);
        ctx.lineTo(-4, -4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Inner bright core (white)
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffffff';
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-3, -14);
        ctx.lineTo(1, -6);
        ctx.lineTo(-1, -4);
        ctx.lineTo(2, -1);
        ctx.lineTo(0, 0);
        ctx.lineTo(6, 14);
        ctx.lineTo(1, 6);
        ctx.lineTo(2, 3);
        ctx.lineTo(-1, 1);
        ctx.lineTo(0, -1);
        ctx.lineTo(-2, -3);
        ctx.closePath();
        ctx.fill();
        
        // Add electric sparks around bolt
        if (Math.random() > 0.7) {
            ctx.fillStyle = `rgba(255, 255, 0, ${Math.random() * 0.8})`;
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 15 + Math.random() * 10;
                const sparkX = Math.cos(angle) * dist;
                const sparkY = Math.sin(angle) * dist;
                ctx.fillRect(sparkX - 1, sparkY - 1, 2, 2);
            }
        }
        
        ctx.restore();
    }
}

function drawParticles() {
    const ctx = game.ctx;
    
    for (const p of game.particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    
    ctx.globalAlpha = 1;
}

// =======================
// LEADERBOARD
// =======================
function loadLeaderboard() {
    const saved = localStorage.getItem('electricRushLeaderboard');
    return saved ? JSON.parse(saved) : [];
}

function saveLeaderboard(leaderboard) {
    localStorage.setItem('electricRushLeaderboard', JSON.stringify(leaderboard));
}

function updateLeaderboardDisplay() {
    const leaderboard = loadLeaderboard();
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    
    if (leaderboard.length === 0) {
        list.innerHTML = '<li style="list-style: none; text-align: center;">No scores yet!</li>';
        return;
    }
    
    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');
        li.textContent = `${entry.name}: ${entry.score}`;
        list.appendChild(li);
    });
}

function submitScore(name, score) {
    if (!name || name.trim() === '') {
        alert('Please enter your name!');
        return;
    }
    
    let leaderboard = loadLeaderboard();
    
    // Add new score
    leaderboard.push({ name: name.trim(), score: Math.floor(score) });
    
    // Sort by score (highest first)
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Keep only top 5
    leaderboard = leaderboard.slice(0, 5);
    
    // Save
    saveLeaderboard(leaderboard);
    
    // Update display
    updateLeaderboardDisplay();
    
    // Hide name input section
    document.getElementById('name-input-section').style.display = 'none';
}

// =======================
// GAME END
// =======================
function endGame() {
    game.state = 'gameOver';
    
    // Stop music
    if (game.bgMusic) {
        game.bgMusic.pause();
        game.bgMusic.currentTime = 0;
    }
    
    const screen = document.getElementById('game-over-screen');
    const title = document.getElementById('result-title');
    const message = document.getElementById('result-message');
    const finalScore = document.getElementById('final-score');
    
    title.textContent = 'TIME\'S UP!';
    title.style.color = '#f00';
    message.textContent = `You completed ${game.currentLap - 1} lap${game.currentLap - 1 !== 1 ? 's' : ''}!`;
    finalScore.textContent = `Final Score: ${Math.floor(game.score)}`;
    
    // Show name input section and update leaderboard
    document.getElementById('name-input-section').style.display = 'block';
    document.getElementById('player-name').value = '';
    updateLeaderboardDisplay();
    
    screen.classList.remove('hidden');
}

// =======================
// START
// =======================
window.addEventListener('load', init);
