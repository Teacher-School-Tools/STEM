export default class HUDRenderer {

    constructor(game) {
        this.game = game;
    }

    draw() {
        this.drawHUD();
        this.drawBottomBoundary();

        if (this.game.levelComplete) {
            this.drawLevelComplete();
        }
    }

    drawHUD() {
        const game = this.game;
        const ctx = game.ctx;

        ctx.fillStyle = "black";
        ctx.font = "20px Atkinson Hyperlegible";

        ctx.fillText(
            `Cost: $ ${game.scoreManager.getValue()}`,
            10,
            25
        );

        ctx.fillText(
            `Atoms remaining: ${game.atoms.length}`,
            10,
            50
        );
    }

    drawBottomBoundary() {
        const game = this.game;
        const ctx = game.ctx;

        const boundary = game.canvas.height - 30;

        ctx.save();

        ctx.beginPath();
        ctx.moveTo(0, boundary);
        ctx.lineTo(game.canvas.width, boundary);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;

        ctx.stroke();

        ctx.restore();
    }

    drawLevelComplete() {
        const game = this.game;
        const ctx = game.ctx;

        ctx.save();

        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";

        ctx.fillRect(
            0,
            0,
            game.canvas.width,
            game.canvas.height
        );

        ctx.textAlign = "center";
        ctx.fillStyle = "white";

        ctx.font = "bold 36px Atkinson Hyperlegible";

        ctx.fillText(
            "Level completed!",
            game.canvas.width / 2,
            game.canvas.height / 2 - 30
        );

        ctx.font = "24px Atkinson Hyperlegible";

        ctx.fillText(
            `Money Spent: $${game.finalScore.toLocaleString()}`,
            game.canvas.width / 2,
            game.canvas.height / 2 + 20
        );

        ctx.restore();
    }
}
