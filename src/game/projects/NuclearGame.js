
import Game from "../core/Game.js";
import Input from "../core/Input.js";
import Entity from "../core/Entity.js";
import Collision from "../core/Collision.js";
import Score from "../core/Score.js";

export default class NuclearGame extends Game {

    constructor(canvas) {
        super(canvas);

        // Game systems
        this.input = new Input();
        this.scoreManager = new Score();

        // Temperature settings
        this.temperature = 298;
        this.minTemperature = 298;
        this.maxTemperature = 798;

        // Level settings
        this.currentLevel = "level1";

        // Cannon settings
        this.cannon = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 30,
            angle: -Math.PI / 2,
            rotationSpeed: 2,
            barrelLength: 35
        };

        // Projectile settings
        this.projectiles = [];
        this.projectileSpeed = 400;
        this.projectileRadius = 5;
        this.fireCooldown = 0;
        this.fireRate = 0.4;

        // Atom settings
        this.atoms = [];
        this.createAtoms(5);

        this.scoreManager.add(5000 * this.atoms.length);
    }

    // -----------------------------------------
    // Level Management
    // -----------------------------------------

    setLevel(level) {

        const levels = {
            level1: {
                atomCount: 5,
                temperature: 298,
                background: "#f5f5f5"
            },

            level2: {
                atomCount: 15,
                temperature: 398,
                background: "#e8f4ff"
            },

            level3: {
                atomCount: 30,
                temperature: 598,
                background: "#fff0e0"
            }
        };

        const selectedLevel = levels[level];

        if (!selectedLevel) return;

        this.currentLevel = level;

        this.setTemperature(selectedLevel.temperature);
        this.setAtomCount(selectedLevel.atomCount);

        this.canvas.style.backgroundColor =
            selectedLevel.background;

        this.restart();
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
    // Atom Management
    // -----------------------------------------

    createAtoms(number) {

    for (let i = 0; i < number; i++) {

        const atom = new Entity(0, 0, 20, 20);

        atom.color = "orange";

        // Atom health
        atom.maxHealth = 3;
        atom.health = atom.maxHealth;

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

            // Change colour based on health
            if (this.health === 3) {
                ctx.fillStyle = "orange";
            } else if (this.health === 2) {
                ctx.fillStyle = "gold";
            } else {
                ctx.fillStyle = "red";
            }

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

        this.scoreManager.reset();

        this.scoreManager.add(5000 * this.atoms.length);

    }

    resetAtoms() {

        this.atoms.forEach(atom => {

            atom.x = Math.random() *
                (this.canvas.width - atom.width);

            atom.y = Math.random() *
                (this.canvas.height - atom.height - 60);

            atom.baseVelocityX =
                (Math.random() - 0.5) * 500;

            atom.baseVelocityY =
                (Math.random() - 0.5) * 500;

            atom.velocityX = atom.baseVelocityX;
            atom.velocityY = atom.baseVelocityY;

        });

    }

    // -----------------------------------------
    // Cannon Controls
    // -----------------------------------------

    updateCannon(deltaTime) {

        const rotationSpeed = this.cannon.rotationSpeed;

        if (this.input.isDown("ArrowLeft")) {
            this.cannon.angle -= rotationSpeed * deltaTime;
        }
        if (this.input.isDown("ArrowRight")) {
            this.cannon.angle += rotationSpeed * deltaTime;
        }
        if (this.input.isDown("ArrowUp")) {
            this.cannon.angle += rotationSpeed / 2 * deltaTime;
        }
        if (this.input.isDown("ArrowDown")) {
            this.cannon.angle -= rotationSpeed / 2 * deltaTime;
        }
        // Restrict cannon to upward firing angles
        this.cannon.angle = Math.max(
            -Math.PI + 0.2,
            Math.min(-0.2, this.cannon.angle)
        );

        // Firing cooldown
        this.fireCooldown -= deltaTime;

        if (
            this.input.isDown(" ") &&
            this.fireCooldown <= 0
        ) {
            this.fireProjectile();
            this.fireCooldown = this.fireRate;
        }

    }

    // -----------------------------------------
    // Projectile Management
    // -----------------------------------------

    fireProjectile() {

    const angle = this.cannon.angle;

    const projectile = {

        x: this.cannon.x +
            Math.cos(angle) * this.cannon.barrelLength,

        y: this.cannon.y +
            Math.sin(angle) * this.cannon.barrelLength,

        velocityX:
            Math.cos(angle) * this.projectileSpeed,

        velocityY:
            Math.sin(angle) * this.projectileSpeed,

        radius: this.projectileRadius,

        attached: false

    };

    this.projectiles.push(projectile);

}

    updateProjectiles(deltaTime) {

    this.projectiles.forEach(projectile => {

        // Attached projectiles follow their atom
        if (projectile.attached) {

            const atom = projectile.attachedTo;

            projectile.x =
                atom.x + atom.width / 2 +
                projectile.offsetX;

            projectile.y =
                atom.y + atom.height / 2 +
                projectile.offsetY;

            return;
        }

        // Normal projectile movement
        projectile.x += projectile.velocityX * deltaTime;
        projectile.y += projectile.velocityY * deltaTime;

    });

    // Remove projectiles outside canvas only if unattached
    this.projectiles = this.projectiles.filter(projectile => {

        if (projectile.attached) return true;

        return (
            projectile.x >= 0 &&
            projectile.x <= this.canvas.width &&
            projectile.y >= 0 &&
            projectile.y <= this.canvas.height
        );

    });

}

    // -----------------------------------------
    // Atom Movement
    // -----------------------------------------

    moveAtoms(deltaTime) {

        const speedMultiplier =
            0.5 + this.getTemperatureFactor() * 2.5;

        this.atoms.forEach(atom => {

            atom.velocityX =
                atom.baseVelocityX * speedMultiplier;

            atom.velocityY =
                atom.baseVelocityY * speedMultiplier;

            atom.x += atom.velocityX * deltaTime;
            atom.y += atom.velocityY * deltaTime;

            // Horizontal boundaries
            if (atom.x < 0) {

                atom.x = 0;

                atom.baseVelocityX =
                    Math.abs(atom.baseVelocityX);

            }

            if (atom.x + atom.width > this.canvas.width) {

                atom.x = this.canvas.width - atom.width;

                atom.baseVelocityX =
                    -Math.abs(atom.baseVelocityX);

            }

            // Vertical boundaries
            if (atom.y < 0) {

                atom.y = 0;

                atom.baseVelocityY =
                    Math.abs(atom.baseVelocityY);

            }

            if (atom.y + atom.height > this.canvas.height - 60) {

                atom.y = this.canvas.height - atom.height - 60;

                atom.baseVelocityY =
                    -Math.abs(atom.baseVelocityY);

            }

        });

    }

    // -----------------------------------------
    // Collision Detection
    // -----------------------------------------

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

                if (distance === 0) continue;

                const radiusA = a.width / 2;
                const radiusB = b.width / 2;

                if (distance >= radiusA + radiusB) continue;

                const nx = dx / distance;
                const ny = dy / distance;

                const relativeVelocityX =
                    b.baseVelocityX - a.baseVelocityX;

                const relativeVelocityY =
                    b.baseVelocityY - a.baseVelocityY;

                const velocityAlongNormal =
                    relativeVelocityX * nx +
                    relativeVelocityY * ny;

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

    checkProjectileCollisions() {

    this.projectiles.forEach(projectile => {

        // Ignore projectiles that are already attached
        if (projectile.attached) return;

        for (let i = this.atoms.length - 1; i >= 0; i--) {

            const atom = this.atoms[i];

            const dx =
                projectile.x - (atom.x + atom.width / 2);

            const dy =
                projectile.y - (atom.y + atom.height / 2);

            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < projectile.radius + atom.width / 2) {

                // Reduce atom health
                atom.health--;

                // Award points
                this.scoreManager.add(50);

                // Attach projectile to atom
                projectile.attached = true;
                projectile.attachedTo = atom;

                // Preserve projectile's relative position
                projectile.offsetX = dx;
                projectile.offsetY = dy;

                // Remove atom if health reaches zero
                if (atom.health <= 0) {

                    this.removeEntity(atom);
                    this.atoms.splice(i, 1);

                    this.scoreManager.add(200);

                    // Remove all projectiles attached to this atom
                    this.projectiles = this.projectiles.filter(
                        p => p.attachedTo !== atom
                    );

                }

                break;

            }

        }

    });

}

    // -----------------------------------------
    // Game Update
    // -----------------------------------------

    update(deltaTime) {

        this.updateCannon(deltaTime);
        this.updateProjectiles(deltaTime);

        this.moveAtoms(deltaTime);

        this.checkAtomCollisions();
        this.checkProjectileCollisions();

        this.scoreManager.add(
            Math.round(
                (1 + (this.getTemperatureFactor() + 0.3)) ** 2
            )
        );

    }

    // -----------------------------------------
    // Drawing
    // -----------------------------------------

    drawCannon() {

        const ctx = this.ctx;
        const cannon = this.cannon;

        ctx.save();

        ctx.translate(cannon.x, cannon.y);
        ctx.rotate(cannon.angle);

        // Barrel
        ctx.fillStyle = "#444";

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

        // Cannon base
        ctx.beginPath();

        ctx.arc(
            cannon.x,
            cannon.y,
            18,
            Math.PI,
            0
        );

        ctx.fillStyle = "#555";
        ctx.fill();

        ctx.strokeStyle = "black";
        ctx.stroke();

    }

    drawProjectiles() {

    this.projectiles.forEach(projectile => {

        this.ctx.beginPath();

        this.ctx.arc(
            projectile.x,
            projectile.y,
            projectile.radius,
            0,
            Math.PI * 2
        );

        this.ctx.fillStyle = projectile.attached
            ? "red"
            : "black";

        this.ctx.fill();

    });

}

    draw() {

        super.draw();

        this.drawCannon();
        this.drawProjectiles();

        this.ctx.fillStyle = "black";
        this.ctx.font = "20px Atkinson Hyperlegible";

        this.ctx.fillText(
            `Cost: $ ${this.scoreManager.getValue()}`,
            10,
            25
        );

        this.ctx.fillText(
            `Atoms remaining: ${this.atoms.length}`,
            10,
            50
        );

    }

    // -----------------------------------------
    // Restart
    // -----------------------------------------

    restart() {

        this.scoreManager.reset();

        this.cannon.angle = -Math.PI / 2;

        this.projectiles = [];

        this.fireCooldown = 0;

        this.resetAtoms();

        this.scoreManager.add(5000 * this.atoms.length);

        this.running = false;

    }

}
