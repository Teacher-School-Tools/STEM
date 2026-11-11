
import Game from "../core/Game.js";
import Input from "../core/Input.js";
import Player from "../core/Player.js";
import Entity from "../core/Entity.js";
import Collision from "../core/Collision.js";
import Score from "../core/Score.js";

export default class CollectionGame extends Game {

    constructor(canvas) {

        super(canvas);

        this.input = new Input();
        this.scoreManager = new Score();
        
        this.temperature = 20;
        this.minTemperature = 0;
        this.maxTemperature = 500;

        // Create player
        this.player = new Player(
            50, 50, 30, 30
        );
        
        this.collectibles = [];

        this.createCollectibles(5)
        // Create collectible


        this.addEntity(this.player);

    }

    setTemperature(value) {

        this.temperature = Math.max(
            this.minTemperature,
            Math.min(this.maxTemperature, value)
        );

    }

    update(deltaTime) {

    const minSpeed = 100;
    const maxSpeed = 500;

    const temperatureFactor =
        (this.temperature - this.minTemperature) /
        (this.maxTemperature - this.minTemperature);

    this.player.speed =
        minSpeed + temperatureFactor * (maxSpeed - minSpeed);

    this.player.handleInput(this.input);

    // Update player
    this.player.update(deltaTime, this.canvas);

    // Move collectibles
    this.moveCollectibles(deltaTime);

    this.checkCollectibleCollisions();

    // Check collisions
    this.collectibles.forEach(collectible => {

        if (Collision.check(this.player, collectible)) {

            this.scoreManager.add(50);

            collectible.x = Math.random() *
                (this.canvas.width - collectible.width);

            collectible.y = Math.random() *
                (this.canvas.height - collectible.height);

        }

    });

    }

    moveCollectible() {
    this.collectibles.forEach(collectible => {

        collectible.x = Math.random() *
            (this.canvas.width - collectible.width);

        collectible.y = Math.random() *
            (this.canvas.height - collectible.height);

        // Give each collectible a new random direction
        collectible.velocityX = (Math.random() - 0.5) * 200;
        collectible.velocityY = (Math.random() - 0.5) * 200;

    });
}

    moveCollectibles(deltaTime) {

    const temperatureFactor =
        (this.temperature - this.minTemperature) /
        (this.maxTemperature - this.minTemperature);

    const speedMultiplier = 0.5 + temperatureFactor * 2.5;

    this.collectibles.forEach(collectible => {

        // Calculate temperature-dependent velocity
        collectible.velocityX =
            collectible.baseVelocityX * speedMultiplier;

        collectible.velocityY =
            collectible.baseVelocityY * speedMultiplier;

        // Move collectible
        collectible.x += collectible.velocityX * deltaTime;
        collectible.y += collectible.velocityY * deltaTime;

        // Left wall
        if (collectible.x < 0) {
            collectible.x = 0;
            collectible.baseVelocityX = Math.abs(collectible.baseVelocityX);
        }

        // Right wall
        if (collectible.x + collectible.width > this.canvas.width) {
            collectible.x = this.canvas.width - collectible.width;
            collectible.baseVelocityX = -Math.abs(collectible.baseVelocityX);
        }

        // Top wall
        if (collectible.y < 0) {
            collectible.y = 0;
            collectible.baseVelocityY = Math.abs(collectible.baseVelocityY);
        }

        // Bottom wall
        if (collectible.y + collectible.height > this.canvas.height) {
            collectible.y = this.canvas.height - collectible.height;
            collectible.baseVelocityY = -Math.abs(collectible.baseVelocityY);
        }

    });
}

checkCollectibleCollisions() {

    for (let i = 0; i < this.collectibles.length; i++) {

        for (let j = i + 1; j < this.collectibles.length; j++) {

            const a = this.collectibles[i];
            const b = this.collectibles[j];

            // Calculate distance between circle centres
            const dx = (b.x + b.width / 2) - (a.x + a.width / 2);
            const dy = (b.y + b.height / 2) - (a.y + a.height / 2);

            const distance = Math.sqrt(dx * dx + dy * dy);

            const radiusA = a.width / 2;
            const radiusB = b.width / 2;

            // Check for collision
            if (distance < radiusA + radiusB) {

                // Calculate collision normal
                const nx = dx / distance;
                const ny = dy / distance;

                // Calculate relative velocity
                const relativeVelocityX = b.velocityX - a.velocityX;
                const relativeVelocityY = b.velocityY - a.velocityY;

                const velocityAlongNormal =
                    relativeVelocityX * nx +
                    relativeVelocityY * ny;

                // Only resolve if objects are moving towards each other
                if (velocityAlongNormal < 0) {

                    const impulse = velocityAlongNormal;

                    a.velocityX += impulse * nx;
                    a.velocityY += impulse * ny;

                    b.velocityX -= impulse * nx;
                    b.velocityY -= impulse * ny;

                }

                // Separate overlapping circles
                const overlap = radiusA + radiusB - distance;

                a.x -= nx * overlap / 2;
                a.y -= ny * overlap / 2;

                b.x += nx * overlap / 2;
                b.y += ny * overlap / 2;

            }

        }

    }

}

setCollectibleCount(number) {

    // Remove existing collectibles from the game
    this.collectibles.forEach(collectible => {
        this.removeEntity(collectible);
    });

    // Clear the existing array
    this.collectibles = [];

    // Create the requested number of collectibles
    this.createCollectibles(number);

}

    createCollectibles(number) {
    for (let i = 0; i < number; i++) {
        const collectible = new Entity(0, 0, 20, 20);
        collectible.color = "orange";

        // Assign random movement
        // collectible.baseVelocityX = (Math.random() - 0.5) * 200;
        // collectible.baseVelocityY = (Math.random() - 0.5) * 200;

        collectible.baseVelocityX = (Math.random() - 0.5) * 500;
        collectible.baseVelocityY = (Math.random() - 0.5) * 500;

        collectible.velocityX = collectible.baseVelocityX;
        collectible.velocityY = collectible.baseVelocityY;

        // Draw as a circle
        collectible.draw = function(ctx) {
        ctx.beginPath();
        ctx.arc(
            this.x + this.width / 2,
            this.y + this.height / 2,
            this.width / 2,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = this.color;
        ctx.fill();
        };

        this.collectibles.push(collectible);
        this.addEntity(collectible);
    }

    this.moveCollectible();
    }

    draw() {

        super.draw();

        // Draw score
        this.ctx.fillStyle = "black";
        this.ctx.font = "20px Atkinson Hyperlegible";

        this.ctx.fillText(
            `Score: ${this.scoreManager.getValue()}`,
            10,
            25
        );

    }

    restart() {

        this.scoreManager.reset();

        this.player.x = 50;
        this.player.y = 50;

        this.moveCollectible();

        this.running = false;
        this.start();

    }

}
