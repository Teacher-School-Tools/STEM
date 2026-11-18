import { LEVELS } from "../config/levels.js";

export default class LevelManager {

    constructor(game) {
        this.game = game;
    }

    setLevel(level) {
        const game = this.game;
        const settings = LEVELS[level];

        if (!settings) return;

        game.currentLevel = level;

        game.atomHealth = settings.atomHealth;
        game.atomCount = settings.atomCount;

        game.setTemperature(settings.temperature);

        game.canvas.style.backgroundColor =
            settings.background;

        game.restart();
    }

    showCustomizationControls() {
        return this.game.currentLevel === "level0";
    }

    checkCompletion() {
        const game = this.game;

        if (game.atoms.length !== 0 || game.levelComplete) {
            return;
        }

        game.levelComplete = true;
        game.finalScore = game.scoreManager.getValue();

        game.state = "finished";
    }

    start() {
        const game = this.game;

        if (game.levelComplete) {
            game.levelComplete = false;
            game.finalScore = 0;
        }

        game.start();
    }

        

    restart() {
        const game = this.game;

        game.levelComplete = false;
        game.finalScore = 0;

        // Reset cannon
        game.cannon.angle = -Math.PI / 2;

        // Reset projectiles
        game.projectiles = [];
        game.fireCooldown = 0;

        // Reset atoms
        game.atomManager.clearAtoms();
        game.atomManager.createAtoms(game.atomCount);

        // Reset score
        game.resetScore();

        game.start()
    }


}
