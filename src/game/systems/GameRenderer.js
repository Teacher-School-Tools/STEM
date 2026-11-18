
import CannonRenderer from "./CannonRenderer.js";
import HUDRenderer from "./HUDRenderer.js";

export default class GameRenderer {

    constructor(game) {
        this.game = game;

        this.cannonRenderer = new CannonRenderer(game);
        this.hudRenderer = new HUDRenderer(game);
    }

    draw() {
        // Draw cannon
        this.cannonRenderer.draw();

        // Draw projectiles
        this.drawProjectiles();

        // Draw HUD and bottom boundary
        this.hudRenderer.draw();
    }

    drawProjectiles() {
        const ctx = this.game.ctx;

        this.game.projectiles.forEach(projectile => {
            ctx.beginPath();

            ctx.arc(
                projectile.x,
                projectile.y,
                projectile.radius,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = projectile.attached
                ? "red"
                : "black";

            ctx.fill();
        });
    }
}
