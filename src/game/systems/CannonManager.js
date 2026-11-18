export default class CannonManager {

    constructor(game) {
        this.game = game;
    }

    update(deltaTime) {
        const game = this.game;

        this.updateFiring(deltaTime);

        // Level 3 has fixed aiming.
        if (game.currentLevel === "level3") return;

        const speed = game.cannon.rotationSpeed;

        if (game.input.isDown("ArrowLeft")) {
            game.cannon.angle -= speed * deltaTime;
        }

        if (game.input.isDown("ArrowRight")) {
            game.cannon.angle += speed * deltaTime;
        }

        if (game.input.isDown("ArrowUp")) {
            game.cannon.angle += speed / 2 * deltaTime;
        }

        if (game.input.isDown("ArrowDown")) {
            game.cannon.angle -= speed / 2 * deltaTime;
        }

        game.cannon.angle = Math.max(
            -Math.PI + 0.2,
            Math.min(-0.2, game.cannon.angle)
        );
    }

    updateFiring(deltaTime) {
        const game = this.game;

        game.fireCooldown -= deltaTime;

        if (
            game.input.isDown(" ") &&
            game.fireCooldown <= 0
        ) {
            game.projectileManager.fire();

            game.fireCooldown = game.fireRate;
        }
    }

    setColor(color) {
        if (!/^#[0-9A-Fa-f]{6}$/.test(color)) return;

        this.game.cannon.color = color;
    }

    setEmoji(emoji) {
        this.game.cannon.emoji = emoji;
    }

    resetAppearance() {
        this.game.cannon.color = "#555555";
        this.game.cannon.emoji = "";
    }
    resetPosition() {
        this.game.cannon.angle = -Math.PI / 2;
    }
}
