import { LEVELS, DEFAULT_LEVEL } from "../config/levels.js";

export default class LevelManager {
    constructor(game) {
        this.game = game;

        // Highest level the user has unlocked
        this.unlockedLevel = DEFAULT_LEVEL;
    }

    getLevelNumber(level) {
        return Number(level.replace("level", ""));
    }

    setLevel(level) {
        const game = this.game;

        // Check that the requested level exists
        if (!LEVELS[level]) {
            return false;
        }

        // Prevent skipping locked levels
        if (
            this.getLevelNumber(level) >
            this.getLevelNumber(this.unlockedLevel)
        ) {
            return false;
        }

        game.currentLevel = level;

        const config = LEVELS[level];

        game.atomCount = config.atomCount;
        game.temperature = config.temperature;
        game.atomHealth = config.atomHealth;

        game.canvas.style.backgroundColor = config.background;

        game.levelComplete = false;
        game.finalScore = 0;

        game.projectiles = [];

        game.atomManager.clearAtoms();
        game.atomManager.createAtoms(game.atomCount);

        game.resetScore();
        
        game.start()

        return true;
    }

    showCustomizationControls() {
        return this.game.currentLevel === "level0";
    }

    checkCompletion() {
        const game = this.game;

        if (game.atoms.length > 0 || game.levelComplete) {
            return;
        }

        game.levelComplete = true;
        game.finalScore = game.scoreManager.getValue();
        game.state = "finished";

        this.unlockNextLevel();
    }

    unlockNextLevel() {
    const currentNumber = this.getLevelNumber(
        this.game.currentLevel
    );

    const nextLevel = `level${currentNumber + 1}`;

    if (
        LEVELS[nextLevel] &&
        currentNumber >= this.getLevelNumber(this.unlockedLevel)
    ) {
        this.unlockedLevel = nextLevel;

        // Refresh the level dropdown
        if (typeof this.game.onLevelProgress === "function") {
            this.game.onLevelProgress();
        }
    }
}

    restart() {
        const game = this.game;

        game.levelComplete = false;
        game.finalScore = 0;

        game.cannon.angle = -Math.PI / 2;

        game.projectiles = [];
        game.fireCooldown = 0;

        game.atomManager.clearAtoms();
        game.atomManager.createAtoms(game.atomCount);

        game.resetScore();

        game.start()
    }
}