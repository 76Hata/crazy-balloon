# Crazy Balloon ゲーム仕様書
## HTML/CSS/JavaScript 単一ファイル実装版

---

## 1. 概要

### 1.1 プロジェクト概要
- **目的**: 1980年タイトー『クレイジーバルーン』を**単一のindex.htmlファイル**として完全実装
- **対象**: Webブラウザで動作する完全スタンドアローンなゲーム
- **特徴**: 外部ファイル依存なし、ダブルクリックして即座にプレイ可能
- **実装範囲**: 2ステージ（プロトタイプ版）

### 1.2 ゲームの基本概念
- **ジャンル**: アクション迷路ゲーム
- **プレイヤー**: 赤い風船を操作
- **目標**: 青いドットの迷路を通り抜けてゴール（緑色）に到達
- **挑戦**: 風船が動くと膨らみ、静止すると縮む。大きくなると狭い通路を通れない
- **危険**: 青いドットに触れると風船が割れてミス

---

## 2. 現在の実装解析

### 2.1 ファイル構造比較

#### 元プロジェクト
```
baloon/
├── index.html          # メインゲームページ（224x256px canvas）
├── game.js            # ゲームロジック（787行、クラス形式）
├── maps/              # 21個のステージファイル（ASCII形式）
│   ├── map001.dat - map021.dat
├── test.html          # マップ解析テストページ
├── e2e-test.html      # E2Eテストページ
└── 仕様書.md          # 詳細仕様書（391行）
```

#### 単一ファイル版（目標）
```
index.html             # 完全スタンドアローン（全機能内蔵）
├── <head>
│   └── <style>        # CSS統合（元index.htmlから）
├── <body>
│   └── <canvas>       # ゲーム描画領域
└── <script>
    ├── マップデータ   # map001.dat, map002.dat → JavaScript配列
    ├── ゲームロジック # game.js → 内蔵
    └── 初期化処理     # 統合処理
```

### 2.2 技術スタック（変更点）
- **HTML5**: Canvas API使用（変更なし）
- **CSS**: `<style>`タグ内に統合
- **JavaScript**: ES6クラス、**fetch API削除** → 配列アクセス
- **データ**: JavaScript配列として埋込（2ステージ分）

---

## 3. ゲームコア仕様

### 3.1 画面仕様
- **解像度**: 224×256px（横×縦）
- **描画**: Canvas 2D API
- **UI配置**:
  - 右上: SCORE, HI-SCORE, STAGE, LIVES（風船アイコン）
  - 中央: ゲーム画面（迷路と風船）
  - デバッグ表示: FPS, 座標情報

### 3.2 プレイヤー（風船）システム

#### 3.2.1 構成要素
```javascript
// プレイヤー（下部の操作キャラクター）
player: {
    pos: {x, y},           // 座標
    size: 4                // サイズ（正方形）
}

// 風船（プレイヤーの上に浮遊）
balloon: {
    pos: {x, y},           // 座標（プレイヤー追従+左右揺れ）
    radius: 4-12,          // 可変半径
    targetRadius: 4-12,    // 目標半径
    swayPhase: 0,          // 左右揺れの位相
    swayAmplitude: 8,      // 揺れ幅
    stringLength: 12       // プレイヤーからの距離
}
```

#### 3.2.2 風船の動作
1. **サイズ変化**:
   - 移動中: `targetRadius` を最大値（12px）に向けて拡張
   - 静止中: `targetRadius` を最小値（4px）に向けて収縮
   - 実際の半径は目標値に向けてスムーズに変化

2. **左右揺れ**:
   ```javascript
   swayOffset = Math.sin(swayPhase) * swayAmplitude
   balloon.pos.x = player.pos.x + swayOffset
   balloon.pos.y = player.pos.y - stringLength
   ```

3. **衝突判定**: 風船の円と迷路ドットの距離計算

### 3.3 入力システム
```javascript
// サポートキー
keyMap: {
    'ArrowUp/KeyW': 'up',
    'ArrowDown/KeyS': 'down',
    'ArrowLeft/KeyA': 'left', 
    'ArrowRight/KeyD': 'right',
    'Space': 'start'
}

// 斜め移動対応（正規化）
if (x !== 0 && y !== 0) {
    length = Math.sqrt(x*x + y*y)
    x /= length; y /= length
}
```

### 3.4 マップシステム（単一ファイル版）

#### 3.4.1 元マップデータ（参考）
```
# Stage 1: Simple Path
****************************
*S                        G*
*   ******************     *
*                    *     *
****************************

# Stage 2: Wide Corridor  
****************************
*    ********************  *
*    *   G              *  *
*    ********************  *
*    *   S              *  *
****************************
```

#### 3.4.2 JavaScript配列形式（実装）
```javascript
const STAGES = [
    {   // Stage 1: Simple Path
        id: 1,
        name: "Simple Path",
        width: 28,
        height: 32,
        grid: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
            // ...30行分のマップデータ
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        start: { x: 12, y: 208 },  // ピクセル座標
        goal: { x: 212, y: 20 }
    },
    {   // Stage 2: Wide Corridor
        id: 2,
        name: "Wide Corridor", 
        width: 28,
        height: 32,
        grid: [ /* Stage 2のマップデータ */ ],
        start: { x: 68, y: 212 },
        goal: { x: 68, y: 36 }
    }
];
// 0=空, 1=壁, スタート・ゴールは座標で指定
```

#### 3.4.3 ロード処理（変更）
```javascript
// 元のfetch処理
async loadStageData() {
    const response = await fetch(`maps/map${stage}.dat`);
    const mapText = await response.text();
    await this.parseMapData(mapText);
}

// 新しい配列アクセス
loadStageData() {
    const stageData = STAGES[this.stage - 1] || STAGES[0];
    this.currentStage = {
        start: stageData.start,
        goal: stageData.goal
    };
    this.mazeData = stageData.grid;
    console.log(`Loaded ${stageData.name}`);
}
```

### 3.5 衝突検出
```javascript
checkBalloonCollision() {
    for (dot in mazeData) {
        distance = sqrt((balloon.x - dot.x)² + (balloon.y - dot.y)²)
        if (distance < balloon.radius + DOT_SIZE) return true
    }
}
```

### 3.6 ゲーム状態管理
```javascript
gameState: 'TITLE' | 'LOADING' | 'PLAYING' | 'GAME_OVER'

// 状態遷移
TITLE → [SPACE] → LOADING → PLAYING
PLAYING → [衝突] → GAME_OVER → [SPACE] → LOADING
PLAYING → [ゴール] → LOADING（次ステージ）
```

---

## 4. 単一HTMLファイル実装詳細

### 4.1 ファイル統合仕様

#### 4.1.1 HTML構造
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crazy Balloon</title>
    <style>
        /* 元index.htmlのCSSを全て統合 */
        body { margin: 0; padding: 0; background: #000; ... }
        #gameCanvas { border: 2px solid #444; ... }
        .debug { position: absolute; top: 10px; right: 10px; ... }
    </style>
</head>
<body>
    <canvas id="gameCanvas" width="224" height="256"></canvas>
    <div id="ui">...</div>
    
    <script>
        // ===== マップデータ =====
        const STAGES = [ /* 2ステージ分 */ ];
        
        // ===== ゲームロジック =====
        class CrazyBalloon { /* game.jsの内容 */ }
        
        // ===== 初期化 =====
        window.addEventListener('load', () => new CrazyBalloon());
    </script>
</body>
</html>
```

#### 4.1.2 主要変更点
1. **fetch API削除**: `async loadStageData()` → 同期配列アクセス
2. **外部CSS統合**: style.cssなし → `<style>`タグ内
3. **ステージ制限**: 21ステージ → 2ステージ（map001.dat, map002.dat）
4. **エラーハンドリング簡素化**: ファイル読み込みエラー処理削除

#### 4.1.3 データ変換
```javascript
// 元データ（map001.dat）
"*S                        G*"

// 変換後配列
[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1]
// スタート・ゴールは座標として別途指定
start: { x: 12, y: 208 }  // S位置
goal: { x: 212, y: 20 }   // G位置
```

### 4.2 ファイルサイズ・パフォーマンス

#### 4.2.1 予想ファイルサイズ
```
単一index.html (2ステージ版): 約60-80KB
├── HTML構造: ~2KB
├── CSS統合: ~5KB  
├── JavaScript: ~50KB (game.js統合)
└── マップデータ: ~5KB (2ステージ配列)
```

#### 4.2.2 最適化ポイント
- **マップ読み込み**: fetch削除により高速化
- **初期化**: 外部ファイル待機なし
- **CORS問題**: ローカルファイルアクセスエラー解消
- **デバッグ簡素化**: test.html, e2e-test.html不要

---

## 5. 技術実装詳細

### 5.1 HTML構造
```html
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>Crazy Balloon</title>
    <style>
        /* 全スタイル埋込 */
    </style>
</head>
<body>
    <canvas id="gameCanvas" width="224" height="256"></canvas>
    <div id="ui">...</div>
    
    <script>
        /* 全ゲームロジック埋込 */
    </script>
</body>
</html>
```

### 5.2 マップエンコーディング戦略

#### 5.2.1 Base64エンコード版
```javascript
// 各ステージを1文字=1セル でBase64エンコード
const STAGES_B64 = {
    1: "SUfigHVlbnhlbGFzbEJhc2U2NEVuY29kZWRNYXBEYXRh...",
    // デコード時: atob() → バイナリ → マップ配列
}
```

#### 5.2.2 JSON配列版（推奨）
```javascript
const STAGES = [
    {   // Stage 1
        name: "Simple Path",
        grid: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1],
            // 0=空, 1=壁, 3=スタート, 2=ゴール
        ],
        start: [3,26],
        goal: [23,2]
    }
    // ... 21ステージ
];
```

### 5.3 ファイルサイズ最適化

#### 5.3.1 コード圧縮
- 変数名短縮（player→p, balloon→b）
- 不要コメント削除
- console.log削除（本番）

#### 5.3.2 マップ最適化
- 重複パターンの共通化
- 対称マップの半分データ化
- プロシージャル生成の併用

---

## 6. ゲーム定数・パラメータ

### 6.1 物理パラメータ
```javascript
const GAME_CONFIG = {
    // 画面
    CANVAS_WIDTH: 224,
    CANVAS_HEIGHT: 256,
    CELL_SIZE: 8,
    
    // プレイヤー
    PLAYER_SIZE: 4,
    SPEED: 32,              // px/s
    
    // 風船
    BALLOON_MIN_R: 4,
    BALLOON_MAX_R: 12,
    EXPAND_RATE: 8,         // px/s
    STRING_LENGTH: 12,
    SWAY_AMPLITUDE: 8,
    SWAY_SPEED: 0.002,
    
    // ドット
    DOT_SIZE: 2,
    DOT_COLOR: '#00aaff',
    
    // ゲーム
    INITIAL_LIVES: 3,
    EXTEND_SCORE: 10000,
    TARGET_FPS: 60
};
```

### 6.2 色定義
```javascript
const COLORS = {
    BACKGROUND: '#000000',
    PLAYER: '#ff8800',      // オレンジ
    BALLOON: '#ff4444',     // 赤
    BALLOON_HIGHLIGHT: 'rgba(255,255,255,0.5)',
    DOT: '#00aaff',         // シアン
    GOAL: '#00ff00',        // 緑
    GOAL_GLOW: 'rgba(0,255,0,0.8)',
    STRING: '#666666',
    UI_TEXT: '#ffffff'
};
```

---

## 7. 実装推奨技術

### 7.1 最適な言語選択
**推奨**: HTML5 + CSS3 + Vanilla JavaScript（ES6+）

**理由**:
- ブラウザ標準サポート
- 外部ライブラリ不要
- パフォーマンス優秀
- デバッグが容易
- クロスプラットフォーム対応

**代替案検討**:
- **TypeScript**: 型安全性向上、ただしコンパイル必要
- **WebAssembly**: パフォーマンス向上、ただし複雑
- **Canvas vs SVG**: Canvas推奨（ピクセルパーフェクト、高FPS）

### 7.2 フレームワーク不使用の理由
- **jQuery**: DOM操作中心、ゲームループに不適
- **React/Vue**: 仮想DOM、リアルタイム描画に不適
- **Phaser.js**: 高機能だがファイルサイズ大、単純ゲームに過大

### 7.3 最適化手法
```javascript
// 1. オブジェクトプールイング
const particlePool = new Array(50).fill(null).map(() => ({
    x: 0, y: 0, vx: 0, vy: 0, life: 0, active: false
}));

// 2. プリ計算済み三角関数
const SIN_TABLE = new Array(360).fill(0).map((_, i) => 
    Math.sin(i * Math.PI / 180)
);

// 3. ビットマスク判定
const COLLISION_GRID = new Uint8Array(28 * 32); // 1バイト/セル
```

---

## 8. テスト・デバッグ仕様

### 8.1 デバッグ機能
```javascript
const DEBUG = {
    showCollisionBounds: false,
    showGridLines: false,
    logFPS: false,
    godMode: false,
    slowMotion: 1.0
};

// デバッグ切り替え
// Ctrl+D: デバッグ表示切り替え
// Ctrl+G: 無敵モード
// Ctrl+S: スローモーション
```

### 8.2 パフォーマンス監視
```javascript
class PerformanceMonitor {
    constructor() {
        this.frameTime = 0;
        this.updateTime = 0;
        this.renderTime = 0;
    }
    
    measure(fn, label) {
        const start = performance.now();
        const result = fn();
        this[label + 'Time'] = performance.now() - start;
        return result;
    }
}
```

---

## 9. ブラウザ互換性

### 9.1 最小要件
- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+

### 9.2 必要API
- Canvas 2D Context
- requestAnimationFrame
- KeyboardEvent
- localStorage
- performance.now()

### 9.3 フォールバック
```javascript
// レガシーブラウザ対応
const requestFrame = window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame ||
    ((cb) => setTimeout(cb, 16));

const perfNow = performance.now || 
    performance.webkitNow ||
    (() => Date.now());
```

---

## 10. 配布・保守性

### 10.1 ファイル構成（完成版）
```
crazy-balloon.html     # 完全スタンドアローン（100-200KB予想）
├── HTML構造
├── CSS埋込（~5KB）
├── JavaScript埋込（~80KB）
└── マップデータ埋込（~30KB）
```

### 10.2 設定可能項目
```javascript
// HTML内でカスタマイズ可能な定数
const GAME_SETTINGS = {
    difficulty: 'NORMAL',   // EASY/NORMAL/HARD
    lives: 3,
    debugMode: false,
    soundEnabled: true,     // 将来対応
    touchControls: true     // モバイル対応
};
```

### 10.3 拡張性
- 新ステージ追加: `STAGES`配列に追加
- ギミック追加: マップデータ形式拡張
- サウンド追加: Web Audio API統合
- セーブ機能: localStorage活用

---

## 11. 実装優先度

### 11.1 Phase 1（必須機能）
1. ✅ 基本ゲームループ
2. ✅ プレイヤー移動・風船物理
3. ✅ マップ描画・衝突判定  
4. ✅ ゲーム状態管理
5. 🔄 外部ファイル依存排除

### 11.2 Phase 2（品質向上）
1. マップデータ最適化
2. パフォーマンス最適化
3. エラーハンドリング
4. ブラウザ互換性確保

### 11.3 Phase 3（追加機能）
1. タッチ操作対応
2. サウンド効果
3. アニメーション強化
4. 実績システム

---

## 12. 開発指針

### 12.1 コード品質
- ESLint準拠
- 関数分割（100行以下）
- 適切な命名規則
- 型安全性考慮（JSDoc使用）

### 12.2 互換性重視
- ポリフィル使用
- グレースフルデグラデーション
- プログレッシブエンハンスメント

### 12.3 パフォーマンス
- 60FPS維持
- メモリ使用量最小化
- 初期ロード時間短縮

---

この仕様書に基づいて、元の`baloon`プロジェクトを完全にスタンドアローンなHTML単一ファイルに変換可能です。全ての必要な情報とアーキテクチャが定義されており、ClaudeCodeでの実装に十分な詳細度を提供しています。