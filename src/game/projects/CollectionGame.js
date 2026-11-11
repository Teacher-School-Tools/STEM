
import Game from "../core/Game.js";
import Input from "../core/Input.js";
import Player from "../core/Player.js";
import Entity from "../core/Entity.js";
import Collision from "../core/Collision.js";
import Score from "../core/Score.js";

export default class CollectionGame extends Game {

    constructor(canvas) {
        super(canvas);

        // Game systems
        this.input = new Input();
        this.scoreManager = new Score();

        // Temperature settings
        this.temperature = 298;
        this.minTemperature = 298;
        this.maxTemperature = 798;

        // Player
        this.player = new Player(50, 50, 30, 30);
        this.addEntity(this.player);

        // Atoms
        this.atoms = [];
        this.createAtoms(5);
        this.scoreManager.add(5000 * this.atoms.length);

    }

    // -----------------------------------------
    // Temperature
    // -----------------------------------------

    setTemperature(value) {
        this.temperature = Math.max(
            this.minTemperature,
            Math.min(this.maxTemperature, value)
        );
    }

    getTemperatureFactor() {
        return (
            (this.temperature - this.minTemperature) /
            (this.maxTemperature - this.minTemperature)
        );
    }

    // -----------------------------------------
    // Game Update
    // -----------------------------------------

    update(deltaTime) {

        this.updatePlayer(deltaTime);
        this.moveAtoms(deltaTime);
        this.checkAtomCollisions();
        this.checkPlayerCollisions();
        this.scoreManager.add(Math.round((1 + (this.getTemperatureFactor() + 0.3)) ** 2))

    }

    updatePlayer(deltaTime) {

        const minSpeed = 100;
        const maxSpeed = 500;

        const factor = this.getTemperatureFactor();

        this.player.speed =
            minSpeed + factor * (maxSpeed - minSpeed);

        this.player.handleInput(this.input);
        this.player.update(deltaTime, this.canvas);

    }

    // -----------------------------------------
    // Atom Management
    // -----------------------------------------

    createAtoms(number) {

    for (let i = 0; i < number; i++) {

        const atom = new Entity(0, 0, 20, 20);

        atom.color = "orange";

        atom.baseVelocityX = (Math.random() - 0.5) * 100;
        atom.baseVelocityY = (Math.random() - 0.5) * 100;

        atom.velocityX = atom.baseVelocityX;
        atom.velocityY = atom.baseVelocityY;

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

        this.atoms.push(atom);
        this.addEntity(atom);
    }

    this.resetAtoms();
}

    setAtomCount(number) {

    this.atoms.forEach(atom => {
        this.removeEntity(atom);
    });

    this.atoms = [];

    this.createAtoms(number);

    // Reset score based on atom count
    this.scoreManager.reset();
    this.scoreManager.add(5000 * this.atoms.length);

}

    resetAtoms() {

        this.atoms.forEach(atom => {

            // Random position
            atom.x = Math.random() *
                (this.canvas.width - atom.width);

            atom.y = Math.random() *
                (this.canvas.height - atom.height);

            // Random direction
            atom.baseVelocityX = (Math.random() - 0.5) * 500;
            atom.baseVelocityY = (Math.random() - 0.5) * 500;

            atom.velocityX = atom.baseVelocityX;
            atom.velocityY = atom.baseVelocityY;

        });

    }

    // -----------------------------------------
    // Atom Movement
    // -----------------------------------------

    moveAtoms(deltaTime) {

        const speedMultiplier =
            0.5 + this.getTemperatureFactor() * 2.5;

        this.atoms.forEach(atom => {

            atom.velocityX = atom.baseVelocityX * speedMultiplier;
            atom.velocityY = atom.baseVelocityY * speedMultiplier;

            atom.x += atom.velocityX * deltaTime;
            atom.y += atom.velocityY * deltaTime;

            // Horizontal boundaries
            if (atom.x < 0) {
                atom.x = 0;
                atom.baseVelocityX = Math.abs(atom.baseVelocityX);
            }

            if (atom.x + atom.width > this.canvas.width) {
                atom.x = this.canvas.width - atom.width;
                atom.baseVelocityX = -Math.abs(atom.baseVelocityX);
            }

            // Vertical boundaries
            if (atom.y < 0) {
                atom.y = 0;
                atom.baseVelocityY = Math.abs(atom.baseVelocityY);
            }

            if (atom.y + atom.height > this.canvas.height) {
                atom.y = this.canvas.height - atom.height;
                atom.baseVelocityY = -Math.abs(atom.baseVelocityY);
            }

        });

    }

    // -----------------------------------------
    // Collision Detection
    // -----------------------------------------

    checkPlayerCollisions() {

        this.atoms.forEach(atom => {

            if (Collision.check(this.player, atom)) {

                this.scoreManager.add(50);
                this.resetAtom(atom);

            }

        });

    }

    resetAtom(atom) {

        atom.x = Math.random() *
            (this.canvas.width - atom.width);

        atom.y = Math.random() *
            (this.canvas.height - atom.height);

    }

    checkAtomCollisions() {

        for (let i = 0; i < this.atoms.length; i++) {

            for (let j = i + 1; j < this.atoms.length; j++) {

                const a = this.atoms[i];
                const b = this.atoms[j];

                const dx =
                    (b.x + b.width / 2) -
                    (a.x + a.width / 2);

                const dy =
                    (b.y + b.height / 2) -
                    (a.y + a.height / 2);

                const distance = Math.sqrt(dx * dx + dy * dy);

                const radiusA = a.width / 2;
                const radiusB = b.width / 2;

                if (distance >= radiusA + radiusB) continue;

                // Collision normal
                const nx = dx / distance;
                const ny = dy / distance;

                // Relative velocity
                // Relative velocity using base velocities
                const relativeVelocityX = b.baseVelocityX - a.baseVelocityX;
                const relativeVelocityY = b.baseVelocityY - a.baseVelocityY;

                const velocityAlongNormal =
                    relativeVelocityX * nx +
                    relativeVelocityY * ny;

                // Only resolve if atoms are approaching
                if (velocityAlongNormal < 0) {

                    const impulse = velocityAlongNormal;

                    a.baseVelocityX += impulse * nx;
                    a.baseVelocityY += impulse * ny;

                    b.baseVelocityX -= impulse * nx;
                    b.baseVelocityY -= impulse * ny;

}

                // Separate overlapping atoms
                const overlap = radiusA + radiusB - distance;

                a.x -= nx * overlap / 2;
                a.y -= ny * overlap / 2;

                b.x += nx * overlap / 2;
                b.y += ny * overlap / 2;

            }

        }

    }

    // -----------------------------------------
    // Drawing
    // -----------------------------------------

    draw() {

        super.draw();

        this.ctx.fillStyle = "black";
        this.ctx.font = "20px Atkinson Hyperlegible";

        this.ctx.fillText(
            `Cost: $ ${this.scoreManager.getValue()}`,
            10,
            25
        );

    }

    // -----------------------------------------
    // Restart
    // -----------------------------------------

    restart() {

        this.scoreManager.reset();

        this.player.x = 50;
        this.player.y = 50;

        this.resetAtoms();

        this.running = false;
        this.start();
        this.scoreManager.add(5000 * this.atoms.length);

    }

}
