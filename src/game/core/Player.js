
import Entity from "./Entity.js";

export default class Player extends Entity {

    constructor(x, y, width, height) {

        super(x, y, width, height);

        this.color = "blue";
        this.speed = 220;

    }

    handleInput(input) {

        this.velocityX = 0;
        this.velocityY = 0;

        if (input.isMovingLeft()) {
            this.velocityX = -this.speed;
        }

        if (input.isMovingRight()) {
            this.velocityX = this.speed;
        }

        if (input.isMovingUp()) {
            this.velocityY = -this.speed;
        }

        if (input.isMovingDown()) {
            this.velocityY = this.speed;
        }

    }

    update(deltaTime, canvas) {

        super.update(deltaTime);

        // Keep player inside game boundaries

        this.x = Math.max(
            0,
            Math.min(canvas.width - this.width, this.x)
        );

        this.y = Math.max(
            0,
            Math.min(canvas.height - this.height, this.y)
        );

    }
}
