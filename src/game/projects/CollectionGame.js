
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
        
        this.Atoms = [];

        this.createAtoms(5)
        // Create atom


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

    // Move Atoms
    this.moveAtoms(deltaTime);

    this.checkatomCollisions();

    // Check collisions
    this.Atoms.forEach(atom => {

        if (Collision.check(this.player, atom)) {

            this.scoreManager.add(50);

            atom.x = Math.random() *
                (this.canvas.width - atom.width);

            atom.y = Math.random() *
                (this.canvas.height - atom.height);

        }

    });

    }

    moveatom() {
    this.Atoms.forEach(atom => {

        atom.x = Math.random() *
            (this.canvas.width - atom.width);

        atom.y = Math.random() *
            (this.canvas.height - atom.height);

        // Give each atom a new random direction
        atom.velocityX = (Math.random() - 0.5) * 200;
        atom.velocityY = (Math.random() - 0.5) * 200;

    });
}

    moveAtoms(deltaTime) {

    const temperatureFactor =
        (this.temperature - this.minTemperature) /
        (this.maxTemperature - this.minTemperature);

    const speedMultiplier = 0.5 + temperatureFactor * 2.5;

    this.Atoms.forEach(atom => {

        // Calculate temperature-dependent velocity
        atom.velocityX =
            atom.baseVelocityX * speedMultiplier;

        atom.velocityY =
            atom.baseVelocityY * speedMultiplier;

        // Move atom
        atom.x += atom.velocityX * deltaTime;
        atom.y += atom.velocityY * deltaTime;

        // Left wall
        if (atom.x < 0) {
            atom.x = 0;
            atom.baseVelocityX = Math.abs(atom.baseVelocityX);
        }

        // Right wall
        if (atom.x + atom.width > this.canvas.width) {
            atom.x = this.canvas.width - atom.width;
            atom.baseVelocityX = -Math.abs(atom.baseVelocityX);
        }

        // Top wall
        if (atom.y < 0) {
            atom.y = 0;
            atom.baseVelocityY = Math.abs(atom.baseVelocityY);
        }

        // Bottom wall
        if (atom.y + atom.height > this.canvas.height) {
            atom.y = this.canvas.height - atom.height;
            atom.baseVelocityY = -Math.abs(atom.baseVelocityY);
        }

    });
}

checkatomCollisions() {

    for (let i = 0; i < this.Atoms.length; i++) {

        for (let j = i + 1; j < this.Atoms.length; j++) {

            const a = this.Atoms[i];
            const b = this.Atoms[j];

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

setatomCount(number) {

    // Remove existing Atoms from the game
    this.Atoms.forEach(atom => {
        this.removeEntity(atom);
    });

    // Clear the existing array
    this.Atoms = [];

    // Create the requested number of Atoms
    this.createAtoms(number);

}

    createAtoms(number) {
    for (let i = 0; i < number; i++) {
        const atom = new Entity(0, 0, 20, 20);
        atom.color = "orange";

        // Assign random movement
        // atom.baseVelocityX = (Math.random() - 0.5) * 200;
        // atom.baseVelocityY = (Math.random() - 0.5) * 200;

        atom.baseVelocityX = (Math.random() - 0.5) * 500;
        atom.baseVelocityY = (Math.random() - 0.5) * 500;

        atom.velocityX = atom.baseVelocityX;
        atom.velocityY = atom.baseVelocityY;

        // Draw as a circle
        atom.draw = function(ctx) {
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

        this.Atoms.push(atom);
        this.addEntity(atom);
    }

    this.moveatom();
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

        this.moveatom();

        this.running = false;
        this.start();

    }

}
