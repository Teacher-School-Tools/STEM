export default class CannonRenderer {

    constructor(game) {
        this.game = game;
    }

    draw() {
        this.drawBarrel();
        this.drawBase();
        this.drawEmoji();
        this.drawTrajectory();
    }

    drawBarrel() {
        const ctx = this.game.ctx;
        const cannon = this.game.cannon;

        ctx.save();

        ctx.translate(cannon.x, cannon.y);
        ctx.rotate(cannon.angle);

        ctx.fillStyle = cannon.color;

        ctx.fillRect(
            0,
            -8,
            cannon.barrelLength,
            16
        );

        ctx.strokeStyle = "black";

        ctx.strokeRect(
            0,
            -8,
            cannon.barrelLength,
            16
        );

        ctx.restore();
    }

    drawBase() {
        const ctx = this.game.ctx;
        const cannon = this.game.cannon;

        ctx.beginPath();

        ctx.arc(
            cannon.x,
            cannon.y,
            30,
            Math.PI,
            0
        );

        ctx.fillStyle = cannon.color;
        ctx.fill();

        ctx.strokeStyle = "black";
        ctx.stroke();
    }

    drawEmoji() {
        const ctx = this.game.ctx;
        const cannon = this.game.cannon;

        if (!cannon.emoji) return;

        ctx.save();

        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            cannon.emoji,
            cannon.x,
            cannon.y - 9
        );

        ctx.restore();
    }

    drawTrajectory() {
        const ctx = this.game.ctx;
        const cannon = this.game.cannon;

        const lineLength = 250;

        const startX =
            cannon.x +
            Math.cos(cannon.angle) * cannon.barrelLength;

        const startY =
            cannon.y +
            Math.sin(cannon.angle) * cannon.barrelLength;

        const endX =
            startX + Math.cos(cannon.angle) * lineLength;

        const endY =
            startY + Math.sin(cannon.angle) * lineLength;

        ctx.save();

        ctx.beginPath();
        ctx.setLineDash([5, 7]);

        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);

        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;

        ctx.stroke();

        ctx.restore();
    }
}
