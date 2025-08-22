# Crazy Balloon 技術実装仕様書
## 単一HTML実装の詳細設計

---

## 1. アーキテクチャ設計

### 1.1 全体構成（2ステージ版）
```
index.html (完全スタンドアローン ~60-80KB)
├── <!DOCTYPE html>
├── <head>
│   ├── <meta charset="UTF-8">
│   ├── <title>Crazy Balloon</title>
│   └── <style> (CSS統合 ~5KB)
├── <body>
│   ├── <canvas id="gameCanvas" width="224" height="256">
│   ├── <div id="ui"> (スコア表示)
│   └── <script> (統合JavaScript ~50KB)
│       ├── STAGES配列 (~5KB, 2ステージ分)
│       ├── CrazyBalloonクラス (~40KB)
│       └── 初期化コード (~1KB)
└── </html>
```

### 1.2 統合JavaScript構造
```javascript
<script>
// ===== 1. マップデータ（2ステージ） =====
const STAGES = [
    {   // Stage 1: map001.dat変換
        id: 1, name: "Simple Path", 
        grid: [...], start: {x,y}, goal: {x,y}
    },
    {   // Stage 2: map002.dat変換  
        id: 2, name: "Wide Corridor",
        grid: [...], start: {x,y}, goal: {x,y}
    }
];

// ===== 2. ゲーム定数 =====
const GAME_CONFIG = { /* 物理パラメータ等 */ };

// ===== 3. メインゲームクラス =====
class CrazyBalloon {
    // game.jsの内容をそのまま移植（fetch部分のみ変更）
}

// ===== 4. 初期化 =====
window.addEventListener('load', () => new CrazyBalloon());
</script>
```

---

## 2. データ変換詳細

### 2.1 マップデータ変換

#### 2.1.1 map001.dat (Simple Path)
```
# Crazy Balloon Map 001 - Simple Path
****************************
*                          *
*                       G  *
*   ******************     *
*                    *     *
*   S   ************       *
****************************
```

#### 2.1.2 map002.dat (Wide Corridor)
```
# Crazy Balloon Map 002 - Wide Corridor
****************************
*    ********************  *
*    *   G              *  *
*    ********************  *
*    *   S              *  *
****************************
```

#### 2.1.3 JavaScript配列変換
```javascript
const STAGES = [
    {   // Stage 1: Simple Path
        id: 1, name: "Simple Path", width: 28, height: 32,
        grid: [
            // 32x28の数値配列（0=空, 1=壁）
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            // ...30行分のマップデータ
        ],
        start: { x: 28, y: 212 },  // Sの位置（ピクセル）
        goal: { x: 188, y: 20 }    // Gの位置（ピクセル）
    },
    {   // Stage 2: Wide Corridor
        id: 2, name: "Wide Corridor", width: 28, height: 32,
        grid: [ /* 32x28配列 */ ],
        start: { x: 68, y: 212 },
        goal: { x: 68, y: 36 }
    }
];
// スタート・ゴールは座標で指定、グリッドは0/1のみ
```

#### 2.1.4 変換処理の変更点
```javascript
// 元のfetch処理（削除対象）
async loadStageData() {
    const mapFile = `maps/map${String(this.stage).padStart(3, '0')}.dat`;
    const response = await fetch(mapFile);
    const mapText = await response.text();
    await this.parseMapData(mapText);
}

// 新しい配列アクセス（単一ファイル版）
loadStageData() {
    const stageData = STAGES[this.stage - 1] || STAGES[0];
    this.currentStage = {
        start: stageData.start,
        goal: stageData.goal
    };
    this.mazeData = stageData.grid;
    console.log(`Loaded Stage ${stageData.id}: ${stageData.name}`);
}
```

### 2.2 設定データ統合
```javascript
const GAME_CONFIG = {
    // 画面設定
    canvas: {
        width: 224,
        height: 256,
        pixelRatio: window.devicePixelRatio || 1
    },
    
    // 物理パラメータ  
    physics: {
        playerSize: 4,
        speed: 32,
        balloonMinRadius: 4,
        balloonMaxRadius: 12,
        expandRate: 8,
        stringLength: 12,
        swayAmplitude: 8,
        swaySpeed: 0.002,
        dotSize: 2
    },
    
    // ゲーム設定
    game: {
        cellSize: 8,
        initialLives: 3,
        extendScore: 10000,
        targetFPS: 60,
        debugMode: false
    },
    
    // 色設定
    colors: {
        background: '#000000',
        player: '#ff8800', 
        balloon: '#ff4444',
        balloonGlow: 'rgba(255,68,68,0.3)',
        dot: '#00aaff',
        goal: '#00ff00',
        goalGlow: 'rgba(0,255,0,0.8)',
        string: '#666666',
        ui: '#ffffff'
    }
};
```

---

## 3. クラス設計詳細

### 3.1 メインゲームクラス
```javascript
class CrazyBalloon {
    constructor() {
        this.initCanvas();
        this.initState();
        this.initInput();
        this.initAssets();
        this.startGameLoop();
    }

    // 初期化メソッド群
    initCanvas() { /* Canvas設定 */ }
    initState() { /* ゲーム状態初期化 */ }
    initInput() { /* 入力処理設定 */ }  
    initAssets() { /* リソース準備 */ }

    // ゲームループ
    startGameLoop() { /* requestAnimationFrame */ }
    update(deltaTime) { /* ロジック更新 */ }
    render() { /* 描画処理 */ }

    // 状態管理
    changeState(newState) { /* 状態遷移 */ }
    
    // サブシステム
    updatePlayer(dt) { /* プレイヤー更新 */ }
    updateBalloon(dt) { /* 風船更新 */ }
    checkCollisions() { /* 衝突判定 */ }
    loadStage(stageId) { /* ステージ読込 */ }
}
```

### 3.2 サブクラス設計

#### 3.2.1 入力管理クラス
```javascript
class InputManager {
    constructor() {
        this.keys = new Set();
        this.keyMap = {
            'ArrowUp': 'up', 'KeyW': 'up',
            'ArrowDown': 'down', 'KeyS': 'down',
            'ArrowLeft': 'left', 'KeyA': 'left',
            'ArrowRight': 'right', 'KeyD': 'right',
            'Space': 'action'
        };
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            const key = this.keyMap[e.code];
            if (key) {
                this.keys.add(key);
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            const key = this.keyMap[e.code];
            if (key) {
                this.keys.delete(key);
                e.preventDefault();
            }
        });
    }

    getInputVector() {
        let x = 0, y = 0;
        if (this.keys.has('left')) x -= 1;
        if (this.keys.has('right')) x += 1;
        if (this.keys.has('up')) y -= 1;
        if (this.keys.has('down')) y += 1;
        
        // 正規化
        if (x !== 0 && y !== 0) {
            const len = Math.sqrt(x * x + y * y);
            x /= len;
            y /= len;
        }
        return { x, y };
    }

    isPressed(key) { return this.keys.has(key); }
}
```

#### 3.2.2 描画管理クラス
```javascript
class Renderer {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;
        this.setupCanvas();
    }

    setupCanvas() {
        const ratio = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * ratio;
        this.canvas.height = rect.height * ratio;
        this.ctx.scale(ratio, ratio);
        
        // ピクセルパーフェクト設定
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.textBaseline = 'top';
    }

    clear() {
        this.ctx.fillStyle = this.config.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawMaze(mazeData) {
        this.ctx.fillStyle = this.config.colors.dot;
        for (let row = 0; row < mazeData.length; row++) {
            for (let col = 0; col < mazeData[row].length; col++) {
                if (mazeData[row][col] === 1) { // 壁
                    const x = col * this.config.game.cellSize + this.config.game.cellSize / 2;
                    const y = row * this.config.game.cellSize + this.config.game.cellSize / 2;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, this.config.physics.dotSize, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
    }

    drawPlayer(player) {
        const { x, y } = player.pos;
        const size = player.size;
        
        this.ctx.fillStyle = this.config.colors.player;
        this.ctx.fillRect(x - size/2, y - size/2, size, size);
    }

    drawBalloon(balloon, player) {
        const { x, y, radius } = balloon;
        
        // 紐
        this.ctx.strokeStyle = this.config.colors.string;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(player.pos.x, player.pos.y - player.size/2);
        this.ctx.lineTo(x, y + radius);
        this.ctx.stroke();
        
        // 風船本体
        const gradient = this.ctx.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, 0,
            x, y, radius
        );
        gradient.addColorStop(0, '#ff8888');
        gradient.addColorStop(0.7, this.config.colors.balloon);
        gradient.addColorStop(1, '#cc0000');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // ハイライト
        this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
        this.ctx.beginPath();
        this.ctx.arc(x - radius * 0.4, y - radius * 0.4, radius * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawGoal(goal) {
        const { x, y } = goal;
        const pulse = Math.sin(Date.now() * 0.008) * 0.3 + 0.7;
        
        // グロー効果
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 20 * pulse);
        gradient.addColorStop(0, this.config.colors.goalGlow);
        gradient.addColorStop(1, 'rgba(0,255,0,0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - 20, y - 20, 40, 40);
        
        // ゴール本体
        this.ctx.fillStyle = this.config.colors.goal;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // テキスト
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '8px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GOAL', x, y - 2);
    }
}
```

#### 3.2.3 物理演算クラス
```javascript
class PhysicsEngine {
    constructor(config) {
        this.config = config;
    }

    updateBalloon(balloon, player, input, deltaTime) {
        const isMoving = input.x !== 0 || input.y !== 0;
        
        // 半径変更
        if (isMoving) {
            balloon.targetRadius = Math.min(this.config.physics.balloonMaxRadius, 
                balloon.radius + this.config.physics.expandRate * deltaTime / 1000);
        } else {
            balloon.targetRadius = Math.max(this.config.physics.balloonMinRadius,
                balloon.radius - this.config.physics.expandRate * deltaTime / 1000);
        }
        
        // スムーズな半径変化
        const radiusDiff = balloon.targetRadius - balloon.radius;
        balloon.radius += radiusDiff * 0.1;
        
        // 揺れ更新
        balloon.swayPhase += deltaTime * this.config.physics.swaySpeed;
        const swayOffset = Math.sin(balloon.swayPhase) * this.config.physics.swayAmplitude;
        
        // 位置更新
        balloon.pos.x = player.pos.x + swayOffset;
        balloon.pos.y = player.pos.y - this.config.physics.stringLength;
    }

    checkBalloonCollision(balloon, mazeData) {
        if (!mazeData || mazeData.length === 0) return false;
        
        for (let row = 0; row < mazeData.length; row++) {
            for (let col = 0; col < mazeData[row].length; col++) {
                if (mazeData[row][col] === 1) { // 壁ドット
                    const dotX = col * this.config.game.cellSize + this.config.game.cellSize / 2;
                    const dotY = row * this.config.game.cellSize + this.config.game.cellSize / 2;
                    
                    const distance = Math.sqrt(
                        Math.pow(balloon.pos.x - dotX, 2) + 
                        Math.pow(balloon.pos.y - dotY, 2)
                    );
                    
                    if (distance < balloon.radius + this.config.physics.dotSize) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    checkGoalReached(player, goal) {
        const distance = Math.sqrt(
            Math.pow(player.pos.x - goal.x, 2) + 
            Math.pow(player.pos.y - goal.y, 2)
        );
        return distance < 12; // ゴール判定距離
    }
}
```

---

## 4. パフォーマンス最適化

### 4.1 描画最適化

#### 4.1.1 オフスクリーンCanvas
```javascript
class OptimizedRenderer extends Renderer {
    constructor(canvas, config) {
        super(canvas, config);
        this.offscreenCanvas = new OffscreenCanvas(224, 256);
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        this.mazeCache = null;
    }

    cacheMaze(mazeData) {
        if (!this.mazeCache) {
            this.mazeCache = new OffscreenCanvas(224, 256);
            const ctx = this.mazeCache.getContext('2d');
            
            // マップを一度だけ描画してキャッシュ
            ctx.fillStyle = this.config.colors.dot;
            for (let row = 0; row < mazeData.length; row++) {
                for (let col = 0; col < mazeData[row].length; col++) {
                    if (mazeData[row][col] === 1) {
                        const x = col * 8 + 4;
                        const y = row * 8 + 4;
                        ctx.beginPath();
                        ctx.arc(x, y, 2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }
    }

    drawCachedMaze() {
        if (this.mazeCache) {
            this.ctx.drawImage(this.mazeCache, 0, 0);
        }
    }
}
```

#### 4.1.2 バッチ描画
```javascript
class BatchRenderer {
    constructor() {
        this.drawCalls = [];
    }

    addDrawCall(type, data) {
        this.drawCalls.push({ type, data });
    }

    flush(ctx) {
        // 描画タイプごとにまとめて処理
        const groups = this.groupByType(this.drawCalls);
        
        for (const [type, calls] of groups.entries()) {
            this.renderBatch(ctx, type, calls);
        }
        
        this.drawCalls.length = 0; // クリア
    }

    renderBatch(ctx, type, calls) {
        switch (type) {
            case 'circle':
                ctx.beginPath();
                calls.forEach(call => {
                    ctx.moveTo(call.data.x + call.data.r, call.data.y);
                    ctx.arc(call.data.x, call.data.y, call.data.r, 0, Math.PI * 2);
                });
                ctx.fill();
                break;
            // 他のタイプも同様
        }
    }
}
```

### 4.2 メモリ最適化

#### 4.2.1 オブジェクトプール
```javascript
class ParticlePool {
    constructor(size = 50) {
        this.pool = [];
        this.active = [];
        
        for (let i = 0; i < size; i++) {
            this.pool.push({
                x: 0, y: 0, vx: 0, vy: 0, 
                life: 0, maxLife: 1, 
                color: '#ff0000', active: false
            });
        }
    }

    get() {
        let particle = this.pool.pop();
        if (!particle) {
            // プール不足時は新規作成
            particle = { x: 0, y: 0, vx: 0, vy: 0, life: 0, maxLife: 1, color: '#ff0000', active: false };
        }
        particle.active = true;
        this.active.push(particle);
        return particle;
    }

    release(particle) {
        particle.active = false;
        const index = this.active.indexOf(particle);
        if (index >= 0) {
            this.active.splice(index, 1);
            this.pool.push(particle);
        }
    }

    update(deltaTime) {
        for (let i = this.active.length - 1; i >= 0; i--) {
            const p = this.active[i];
            p.x += p.vx * deltaTime / 1000;
            p.y += p.vy * deltaTime / 1000;
            p.life -= deltaTime / 1000;
            
            if (p.life <= 0) {
                this.release(p);
            }
        }
    }
}
```

#### 4.2.2 効率的な衝突判定
```javascript
class SpatialGrid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = new Array(this.cols * this.rows).fill(null).map(() => []);
    }

    clear() {
        for (let cell of this.grid) {
            cell.length = 0;
        }
    }

    add(obj, x, y) {
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        const index = row * this.cols + col;
        
        if (index >= 0 && index < this.grid.length) {
            this.grid[index].push(obj);
        }
    }

    getNearby(x, y, radius) {
        const nearby = [];
        const startCol = Math.floor((x - radius) / this.cellSize);
        const endCol = Math.floor((x + radius) / this.cellSize);
        const startRow = Math.floor((y - radius) / this.cellSize);
        const endRow = Math.floor((y + radius) / this.cellSize);

        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
                    const index = row * this.cols + col;
                    nearby.push(...this.grid[index]);
                }
            }
        }
        return nearby;
    }
}
```

---

## 5. デバッグ・テスト機能

### 5.1 デバッグ表示
```javascript
class DebugRenderer {
    constructor(renderer, config) {
        this.renderer = renderer;
        this.config = config;
        this.enabled = config.game.debugMode;
        this.metrics = {
            fps: 0,
            updateTime: 0,
            renderTime: 0,
            objectCount: 0
        };
    }

    toggle() {
        this.enabled = !this.enabled;
    }

    updateMetrics(fps, updateTime, renderTime, objectCount) {
        this.metrics.fps = Math.round(fps);
        this.metrics.updateTime = Math.round(updateTime * 100) / 100;
        this.metrics.renderTime = Math.round(renderTime * 100) / 100;
        this.metrics.objectCount = objectCount;
    }

    render(gameState) {
        if (!this.enabled) return;

        const ctx = this.renderer.ctx;
        
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(5, 5, 150, 120);
        
        // テキスト
        ctx.fillStyle = '#00ff00';
        ctx.font = '10px monospace';
        ctx.textAlign = 'left';
        
        const lines = [
            `FPS: ${this.metrics.fps}`,
            `Update: ${this.metrics.updateTime}ms`,
            `Render: ${this.metrics.renderTime}ms`,
            `Objects: ${this.metrics.objectCount}`,
            `State: ${gameState.current}`,
            `Player: ${Math.round(gameState.player.pos.x)}, ${Math.round(gameState.player.pos.y)}`,
            `Balloon: R=${Math.round(gameState.balloon.radius)}`,
            `Input: ${gameState.input.x}, ${gameState.input.y}`
        ];

        lines.forEach((line, i) => {
            ctx.fillText(line, 10, 20 + i * 12);
        });
    }

    drawCollisionBounds(balloon, mazeData) {
        if (!this.enabled) return;

        const ctx = this.renderer.ctx;
        
        // 風船の当たり判定円
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(balloon.pos.x, balloon.pos.y, balloon.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // ドットの当たり判定
        ctx.fillStyle = 'rgba(255, 0, 255, 0.3)';
        for (let row = 0; row < mazeData.length; row++) {
            for (let col = 0; col < mazeData[row].length; col++) {
                if (mazeData[row][col] === 1) {
                    const x = col * 8 + 4;
                    const y = row * 8 + 4;
                    ctx.beginPath();
                    ctx.arc(x, y, this.config.physics.dotSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
}
```

### 5.2 自動テスト機能
```javascript
class AutoTester {
    constructor(game) {
        this.game = game;
        this.tests = [];
        this.running = false;
    }

    addTest(name, testFn) {
        this.tests.push({ name, testFn, passed: null, error: null });
    }

    async runTests() {
        this.running = true;
        console.log('🧪 Starting automated tests...');
        
        for (let test of this.tests) {
            try {
                await test.testFn(this.game);
                test.passed = true;
                console.log(`✅ ${test.name}`);
            } catch (error) {
                test.passed = false;
                test.error = error;
                console.error(`❌ ${test.name}: ${error.message}`);
            }
        }
        
        const passed = this.tests.filter(t => t.passed).length;
        const total = this.tests.length;
        console.log(`🧪 Tests completed: ${passed}/${total} passed`);
        
        this.running = false;
        return { passed, total, tests: this.tests };
    }

    // テスト例
    setupBasicTests() {
        this.addTest('Game Initialization', async (game) => {
            if (!game.canvas) throw new Error('Canvas not initialized');
            if (!game.ctx) throw new Error('Context not initialized');
            if (game.gameState !== 'TITLE') throw new Error('Initial state should be TITLE');
        });

        this.addTest('Player Movement', async (game) => {
            const initialX = game.player.pos.x;
            game.input.keys.add('right');
            game.update(16.67); // 1 frame
            if (game.player.pos.x <= initialX) throw new Error('Player did not move right');
            game.input.keys.delete('right');
        });

        this.addTest('Balloon Physics', async (game) => {
            const initialRadius = game.balloon.radius;
            game.input.keys.add('right');
            
            // 移動中は膨らむはず
            for (let i = 0; i < 10; i++) {
                game.updateBalloon(16.67);
            }
            if (game.balloon.radius <= initialRadius) {
                throw new Error('Balloon should expand when moving');
            }
            
            game.input.keys.delete('right');
            
            // 停止中は縮むはず
            for (let i = 0; i < 20; i++) {
                game.updateBalloon(16.67);
            }
            if (game.balloon.radius >= game.balloon.targetRadius) {
                throw new Error('Balloon should contract when stationary');
            }
        });

        this.addTest('Collision Detection', async (game) => {
            // 風船を壁に意図的に配置
            game.balloon.pos.x = 4; // 壁の位置
            game.balloon.pos.y = 4;
            game.balloon.radius = 10;
            
            const collision = game.checkBalloonCollision();
            if (!collision) throw new Error('Collision not detected');
        });
    }
}
```

---

## 6. ブラウザ互換性・フォールバック

### 6.1 機能検出とフォールバック
```javascript
class CompatibilityLayer {
    constructor() {
        this.features = this.detectFeatures();
        this.setupPolyfills();
    }

    detectFeatures() {
        return {
            canvas: !!document.createElement('canvas').getContext,
            canvas2d: !!document.createElement('canvas').getContext('2d'),
            requestAnimationFrame: !!(window.requestAnimationFrame || window.webkitRequestAnimationFrame),
            localStorage: !!window.localStorage,
            performanceNow: !!(performance && performance.now),
            devicePixelRatio: !!window.devicePixelRatio
        };
    }

    setupPolyfills() {
        // requestAnimationFrame
        if (!this.features.requestAnimationFrame) {
            window.requestAnimationFrame = function(callback) {
                return setTimeout(callback, 16.67);
            };
        }

        // performance.now
        if (!this.features.performanceNow) {
            performance = { now: () => Date.now() };
        }

        // devicePixelRatio
        if (!this.features.devicePixelRatio) {
            window.devicePixelRatio = 1;
        }
    }

    checkMinimumRequirements() {
        const required = ['canvas', 'canvas2d'];
        const missing = required.filter(feature => !this.features[feature]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required features: ${missing.join(', ')}`);
        }
    }
}
```

### 6.2 エラーハンドリング
```javascript
class ErrorHandler {
    constructor() {
        this.setupGlobalHandlers();
        this.errors = [];
    }

    setupGlobalHandlers() {
        window.addEventListener('error', (event) => {
            this.handleError('JavaScript Error', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('Unhandled Promise Rejection', event.reason);
        });
    }

    handleError(type, error) {
        const errorInfo = {
            type,
            message: error.message || error,
            stack: error.stack || 'No stack trace',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        this.errors.push(errorInfo);
        console.error(`${type}:`, errorInfo);

        // ユーザーフレンドリーなエラー表示
        this.showUserError(errorInfo);
    }

    showUserError(errorInfo) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed; top: 10px; right: 10px; 
            background: #ff0000; color: white; 
            padding: 10px; border-radius: 5px; 
            font-family: monospace; font-size: 12px;
            max-width: 300px; z-index: 9999;
        `;
        errorDiv.innerHTML = `
            <strong>Game Error</strong><br>
            ${errorInfo.message}<br>
            <small>Check console for details</small>
        `;

        document.body.appendChild(errorDiv);

        // 5秒後に消去
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 5000);
    }
}
```

---

## 7. 最終統合・最適化

### 7.1 最終HTML構造（2ステージ版）
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crazy Balloon</title>
    <style>
        /* 元index.htmlから統合したCSS */
        body { margin: 0; padding: 0; background: #000; color: #fff; ... }
        #gameCanvas { border: 2px solid #444; image-rendering: pixelated; ... }
        .debug { position: absolute; top: 10px; right: 10px; ... }
    </style>
</head>
<body>
    <canvas id="gameCanvas" width="224" height="256"></canvas>
    <div id="ui">
        <div>SCORE: <span id="score">0</span></div>
        <div>STAGE: <span id="stage">1</span></div>
        <div>LIVES: <span id="lives">3</span></div>
    </div>
    
    <script>
        // マップデータ（2ステージ）
        const STAGES = [ /* Stage 1, Stage 2 */ ];
        
        // ゲームクラス（game.jsから移植）
        class CrazyBalloon { /* 全メソッド */ }
        
        // 初期化
        window.addEventListener('load', () => new CrazyBalloon());
    </script>
</body>
</html>
```

### 7.2 ファイルサイズ最適化（2ステージ版）
```
予想ファイルサイズ:
├── HTML構造: ~2KB
├── CSS統合: ~5KB  
├── JavaScript: ~45KB
│   ├── STAGES配列: ~5KB (2ステージ分)
│   ├── CrazyBalloonクラス: ~35KB
│   └── その他: ~5KB
└── 合計: 約50-60KB

最適化後: ~40-50KB
├── 変数名短縮: 10-15%削減
├── 不要コメント削除: 5-10%削減
├── デバッグコード削除: 5%削減
└── 空白・改行圧縮: 10-15%削減
```

### 7.3 配布・利用方法
```
完成したindex.html:
1. ダブルクリックで直接ブラウザ起動
2. ローカルサーバー不要  
3. インターネット接続不要
4. CORS問題なし
5. ファイル1つで完結

対応ブラウザ:
├── Chrome 60+ ✓
├── Firefox 55+ ✓  
├── Safari 12+ ✓
└── Edge 79+ ✓
```

---

この技術実装仕様書により、元の`baloon`プロジェクトを完全に単一HTMLファイルに変換するための全ての技術詳細が提供されています。パフォーマンス、互換性、保守性を考慮した実装ガイドラインに従って、確実に動作するゲームを作成できます。