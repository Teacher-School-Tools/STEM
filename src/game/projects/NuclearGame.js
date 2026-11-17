
import Game from "../core/Game.js";
import Input from "../core/Input.js";
import Entity from "../core/Entity.js";
import Score from "../core/Score.js";

// -----------------------------------------
// Level Configuration
// -----------------------------------------

const LEVELS = {
    level1: {
        atomCount: 5,
        temperature: 298,
        atomHealth: 1,
        background: "#f5f5f5"
    },

    level2: {
        atomCount: 5,
        temperature: 398,
        atomHealth: 2,
        background: "#e8f4ff"
    },

    level3: {
        atomCount: 5,
        temperature: 598,
        atomHealth: 3,
        background: "#fff0e0"
    }
};

export default class NuclearGame extends Game {

    constructor(canvas) {
        super(canvas);

        // Game systems
        this.input = new Input();
        this.scoreManager = new Score();

        this.levelComplete = false;
        this.finalScore = 0;

        // Level settings
        this.currentLevel = "level1";
        this.atomCount = 5;
        this.atomHealth = 1;

        // Temperature settings
        this.minTemperature = 298;
        this.maxTemperature = 798;
        this.temperature = 298;

        // Cannon settings
        this.cannon = {
            x: canvas.width / 2,
            y: canvas.height,
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
        this.createAtoms(this.atomCount);

        // Initial score
        this.resetScore();
    }

    // -----------------------------------------
    // Level Management
    // -----------------------------------------

    setLevel(level) {

        const selectedLevel = LEVELS[level];

        if (!selectedLevel) return;

        this.currentLevel = level;

        this.atomHealth = selectedLevel.atomHealth;
        this.atomCount = selectedLevel.atomCount;

        this.setTemperature(selectedLevel.temperature);

        this.canvas.style.backgroundColor =
            selectedLevel.background;

        this.restart();
    }

    start() {

        if (this.levelComplete) {
            this.levelComplete = false;
            this.finalScore = 0;
        }

        super.start();
    }

    // -----------------------------------------
    // Level Completion
    // -----------------------------------------

    checkLevelCompletion() {

        if (this.atoms.length === 0 && !this.levelComplete) {

            this.levelComplete = true;
            this.finalScore = this.scoreManager.getValue();

            this.state = "finished";
        }
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

            atom.maxHealth = this.atomHealth;
            atom.health = atom.maxHealth;

            // Base movement velocity
            atom.baseVelocityX = (Math.random() - 0.5) * 100;
            atom.baseVelocityY = (Math.random() - 0.5) * 100;

            atom.velocityX = atom.baseVelocityX;
            atom.velocityY = atom.baseVelocityY;

            // Custom atom drawing
            atom.draw = function(ctx) {

                ctx.beginPath();

                ctx.arc(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    this.width / 2,
                    0,
                    Math.PI * 2
                );

                if (this.health === this.maxHealth) {
                    ctx.fillStyle = "orange";
                } else if (this.health > 1) {
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
        this.atomCount = number;
    }

    resetAtoms() {

        this.atoms.forEach(atom => {

            atom.x = Math.random() *
                (this.canvas.width - atom.width);

            atom.y = Math.random() *
                (this.canvas.height - atom.height - 60);

            atom.baseVelocityX = (Math.random() - 0.5) * 500;
            atom.baseVelocityY = (Math.random() - 0.5) * 500;

            atom.velocityX = atom.baseVelocityX;
            atom.velocityY = atom.baseVelocityY;
        });
    }

    // -----------------------------------------
    // Scoring
    // -----------------------------------------

    resetScore() {

        this.scoreManager.reset();

        this.scoreManager.add(5000 * this.atoms.length);
    }

    // -----------------------------------------
    // Cannon Controls
    // -----------------------------------------

    updateCannon(deltaTime) {

        const speed = this.cannon.rotationSpeed;

        // Cannon rotation
        if (this.input.isDown("ArrowLeft")) {
            this.cannon.angle -= speed * deltaTime;
        }

        if (this.input.isDown("ArrowRight")) {
            this.cannon.angle += speed * deltaTime;
        }

        if (this.input.isDown("ArrowUp")) {
            this.cannon.angle += speed / 2 * deltaTime;
        }

        if (this.input.isDown("ArrowDown")) {
            this.cannon.angle -= speed / 2 * deltaTime;
        }

        // Restrict firing to upward angles
        this.cannon.angle = Math.max(
            -Math.PI + 0.2,
            Math.min(-0.2, this.cannon.angle)
        );

        // Projectile firing cooldown
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

            velocityX: Math.cos(angle) * this.projectileSpeed,
            velocityY: Math.sin(angle) * this.projectileSpeed,

            radius: this.projectileRadius,

            attached: false,
            attachedTo: null,

            offsetX: 0,
            offsetY: 0
        };

        this.projectiles.push(projectile);

        this.scoreManager.add(5000);
    }

    updateProjectiles(deltaTime) {

    this.projectiles = this.projectiles.filter(projectile => {

        // Remove projectiles whose attached atom no longer exists
        if (
            projectile.attached &&
            !this.atoms.includes(projectile.attachedTo)
        ) {
            return false;
        }

        return true;
    });

    this.projectiles.forEach(projectile => {

        if (projectile.attached) {

            const atom = projectile.attachedTo;

            projectile.x =
                atom.x + atom.width / 2 + projectile.offsetX;

            projectile.y =
                atom.y + atom.height / 2 + projectile.offsetY;

            return;
        }

        projectile.x += projectile.velocityX * deltaTime;
        projectile.y += projectile.velocityY * deltaTime;
    });

    // Remove projectiles outside the canvas
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

            if (atom.y + atom.height > this.canvas.height - 60) {

                atom.y = this.canvas.height - atom.height - 60;
                atom.baseVelocityY = -Math.abs(atom.baseVelocityY);
            }
        });
    }

    // -----------------------------------------
    // Atom Collision Detection
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

                // Exchange velocity along collision normal
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
    // Projectile Collision Detection
    // -----------------------------------------

    checkProjectileCollisions() {

    // Use a copy because removing an atom also modifies this.projectiles
    [...this.projectiles].forEach(projectile => {

        if (projectile.attached) return;

        for (let i = this.atoms.length - 1; i >= 0; i--) {

            const atom = this.atoms[i];

            const dx =
                projectile.x - (atom.x + atom.width / 2);

            const dy =
                projectile.y - (atom.y + atom.height / 2);

            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < projectile.radius + atom.width / 2) {

                // Attach projectile first
                projectile.attached = true;
                projectile.attachedTo = atom;

                projectile.offsetX = dx;
                projectile.offsetY = dy;

                // Then damage the atom
                this.damageAtom(atom);

                break;
            }
        }
    });
}

    damageAtom(atom) {

        atom.health--;


        if (atom.health <= 0) {
            this.removeAtom(atom);
        }
    }

    removeAtom(atom) {

    this.removeEntity(atom);

    this.atoms = this.atoms.filter(
        existingAtom => existingAtom !== atom
    );

    // Remove every projectile attached to this atom
    this.projectiles = this.projectiles.filter(
        projectile => projectile.attachedTo !== atom
    );

}

    // -----------------------------------------
    // Game Update
    // -----------------------------------------

    update(deltaTime) {

        if (this.levelComplete) return;

        this.updateCannon(deltaTime);
        this.updateProjectiles(deltaTime);

        this.moveAtoms(deltaTime);

        this.checkAtomCollisions();
        this.checkProjectileCollisions();

        // Passive score accumulation
        this.scoreManager.add(
            Math.round(
                (1 + (this.getTemperatureFactor() + 0.3)) ** 2
            )
        );

        this.checkLevelCompletion();
    }

    // -----------------------------------------
    // Drawing
    // -----------------------------------------

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

        if (this.levelComplete) {
            this.drawLevelComplete();
        }
    }

    drawCannon() {

        const ctx = this.ctx;
        const cannon = this.cannon;

        ctx.save();

        ctx.translate(cannon.x, cannon.y);
        ctx.rotate(cannon.angle);

        // Cannon barrel
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

    drawLevelComplete() {

        const ctx = this.ctx;

        ctx.save();

        // Dark overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.75)";

        ctx.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        ctx.textAlign = "center";
        ctx.fillStyle = "white";

        // Completion message
        ctx.font = "bold 36px Atkinson Hyperlegible";

        ctx.fillText(
            "Level completed!",
            this.canvas.width / 2,
            this.canvas.height / 2 - 30
        );

        // Final score
        ctx.font = "24px Atkinson Hyperlegible";

        ctx.fillText(
            `Money Spent: $${this.finalScore.toLocaleString()}`,
            this.canvas.width / 2,
            this.canvas.height / 2 + 20
        );

        ctx.restore();
    }

    // -----------------------------------------
    // Restart
    // -----------------------------------------

    restart() {

        this.levelComplete = false;
        this.finalScore = 0;

        this.cannon.angle = -Math.PI / 2;

        this.projectiles = [];
        this.fireCooldown = 0;

        // Remove existing atoms
        this.atoms.forEach(atom => {
            this.removeEntity(atom);
        });

        this.atoms = [];

        // Recreate atoms using current level settings
        this.createAtoms(this.atomCount);

        // Reset score
        this.resetScore();

        this.state = "menu";
        this.running = false;

        this.start();
    }
}
