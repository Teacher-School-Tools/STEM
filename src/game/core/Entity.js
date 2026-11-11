
export default class Entity {

    constructor(x, y, width, height) {

        this.x = x;
        this.y = y;

        this.width = width;
        this.height = height;

        this.color = "blue";

        this.velocityX = 0;
        this.velocityY = 0;

        this.active = true;
    }

    update(deltaTime) {

        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;

    }

    draw(ctx) {

        ctx.fillStyle = this.color;

        ctx.fillRect(
            this.x,
            this.y,
            this.width,
            this.height
        );
    }
}
