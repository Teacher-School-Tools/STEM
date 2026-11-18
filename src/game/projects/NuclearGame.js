import Game from "../systems/Game.js";
import Input from "../systems/Input.js";
import Entity from "../systems/Entity.js";
import Score from "../systems/Score.js";

// =========================================
// Level Configuration
// =========================================

const LEVELS = {
    level0: {
        atomCount: 5,
        temperature: 298,
        atomHealth: 1,
        background: "#f5f5f5",
    },
    level1: {
        atomCount: 5,
        temperature: 298,
        atomHealth: 1,
        background: "#f5f5f5",
    },

    level2: {
        atomCount: 5,
        temperature: 398,
        atomHealth: 2,
        background: "#e8f4ff",
    },

    level3: {
        atomCount: 5,
        temperature: 598,
        atomHealth: 3,
        background: "#fff0e0",
    },
    
};

export default class NuclearGame extends Game {

    constructor(canvas) {
        super(canvas);

        // Game systems
        this.input = new Input();
        this.scoreManager = new Score();

        // Game state
        this.levelComplete = false;
        this.finalScore = 0;
        this.currentLevel = "level1";

        // Atom settings
        this.atomCount = 5;
        this.atomHealth = 1;
        this.atoms = [];

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
            barrelLength: 50,

            // Customization
            color: "#555555",
            emoji: ""
        };

        // Projectile settings
        this.projectiles = [];
        this.projectileSpeed = 400;
        this.projectileRadius = 5;
        this.fireCooldown = 0;
        this.fireRate = 0.4;

        // Initialize game
        this.createAtoms(this.atomCount);
        this.resetScore();
    }

    // =========================================
    // Level Management
    // =========================================

    setLevel(level) {

        const settings = LEVELS[level];

        if (!settings) return;

        this.currentLevel = level;

        this.atomHealth = settings.atomHealth;
        this.atomCount = settings.atomCount;

        this.setTemperature(settings.temperature);

        this.canvas.style.backgroundColor =
            settings.background;

        this.restart();
    }

    showCustomizationControls() {
        return this.currentLevel === "level0";
    }

    // =========================================
    // Cannon Customization
    // =========================================

    setCannonColor(color) {
    if (!/^#[0-9A-Fa-f]{6}$/.test(color)) return;

        this.cannon.color = color;
    }

    setCannonEmoji(emoji) {
        this.cannon.emoji = emoji;
    }

    resetCannonAppearance() {
        this.cannon.color = "#555555";
        this.cannon.emoji = "";
    }

    start() {

        if (this.levelComplete) {
            this.levelComplete = false;
            this.finalScore = 0;
        }

        super.start();
    }

    checkLevelCompletion() {

        if (this.atoms.length !== 0 || this.levelComplete) return;

        this.levelComplete = true;
        this.finalScore = this.scoreManager.getValue();

        this.state = "finished";
    }

    // =========================================
    // Temperature
    // =========================================

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

    // =========================================
    // Atom Management
    // =========================================

    createAtoms(number) {

        for (let i = 0; i < number; i++) {

            const atom = this.createAtom();

            this.atoms.push(atom);
            this.addEntity(atom);
        }

        this.resetAtoms();
    }

    createAtom() {

        const atom = new Entity(0, 0, 20, 20);

        atom.color = "orange";
        atom.maxHealth = this.atomHealth;
        atom.health = atom.maxHealth;

        // Initial movement velocity
        atom.baseVelocityX = (Math.random() - 0.5) * 100;
        atom.baseVelocityY = (Math.random() - 0.5) * 100;

        atom.velocityX = atom.baseVelocityX;
        atom.velocityY = atom.baseVelocityY;

        // Custom drawing
        atom.draw = function(ctx) {

            ctx.beginPath();

            ctx.arc(
                this.x + this.width / 2,
                this.y + this.height / 2,
                this.width / 2,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = this.getHealthColor
                ? this.getHealthColor()
                : (
                    this.health === this.maxHealth
                        ? "orange"
                        : this.health > 1
                            ? "gold"
                            : "red"
                );

            ctx.fill();
        };

        return atom;
    }

    setAtomCount(number) {

        // Only allow customization on Level 4
        if (this.currentLevel !== "level0") return;

        const count = Number(number);

        if (!Number.isFinite(count)) return;

        // Restrict the number of atoms to 1–50
        this.atomCount = Math.max(
            1,
            Math.min(50, Math.floor(count))
        );

        // Remove existing atoms
        this.atoms.forEach(atom => {
            this.removeEntity(atom);
        });

        this.atoms = [];

        // Remove existing projectiles
        this.projectiles = [];

        // Recreate atoms using the new count
        this.createAtoms(this.atomCount);

        // Reset score for the new atom count
        this.resetScore();

        // Reset completion state
        this.levelComplete = false;
        this.finalScore = 0;

        // Allow the player to restart if the previous game was completed
        if (this.state === "finished") {
            this.state = "menu";
        }
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

    // =========================================
    // Scoring
    // =========================================

    resetScore() {

        this.scoreManager.reset();

        this.scoreManager.add(5000 * this.atoms.length);
    }

    // =========================================
    // Cannon Controls
    // =========================================

    updateCannon(deltaTime) {

        this.updateFiring(deltaTime);

        if (this.currentLevel === "level3") {
        return;
        }
        const speed = this.cannon.rotationSpeed;

        // Horizontal rotation
        if (this.input.isDown("ArrowLeft")) {
            this.cannon.angle -= speed * deltaTime;
        }

        if (this.input.isDown("ArrowRight")) {
            this.cannon.angle += speed * deltaTime;
        }

        // Vertical adjustment
        if (this.input.isDown("ArrowUp")) {
            this.cannon.angle += speed / 2 * deltaTime;
        }

        if (this.input.isDown("ArrowDown")) {
            this.cannon.angle -= speed / 2 * deltaTime;
        }

        // Restrict cannon to upward firing angles
        this.cannon.angle = Math.max(
            -Math.PI + 0.2,
            Math.min(-0.2, this.cannon.angle)
        );

    }

    updateFiring(deltaTime) {

        this.fireCooldown -= deltaTime;

        if (
            this.input.isDown(" ") &&
            this.fireCooldown <= 0
        ) {
            this.fireProjectile();
            this.fireCooldown = this.fireRate;
        }
    }

    // =========================================
    // Projectile Management
    // =========================================

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

        // Remove projectiles attached to removed atoms
        this.projectiles = this.projectiles.filter(projectile => {

            return !projectile.attached ||
                this.atoms.includes(projectile.attachedTo);
        });

        this.projectiles.forEach(projectile => {

            if (projectile.attached) {
                this.updateAttachedProjectile(projectile);
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

    updateAttachedProjectile(projectile) {

        const atom = projectile.attachedTo;

        projectile.x =
            atom.x + atom.width / 2 + projectile.offsetX;

        projectile.y =
            atom.y + atom.height / 2 + projectile.offsetY;
    }

    // =========================================
    // Atom Movement
    // =========================================

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

            this.checkAtomBoundaries(atom);
        });
    }

    checkAtomBoundaries(atom) {

        const bottomBoundary = this.canvas.height - 30;

        // Left boundary
        if (atom.x < 0) {
            atom.x = 0;
            atom.baseVelocityX = Math.abs(atom.baseVelocityX);
        }

        // Right boundary
        if (atom.x + atom.width > this.canvas.width) {
            atom.x = this.canvas.width - atom.width;
            atom.baseVelocityX = -Math.abs(atom.baseVelocityX);
        }

        // Top boundary
        if (atom.y < 0) {
            atom.y = 0;
            atom.baseVelocityY = Math.abs(atom.baseVelocityY);
        }

        // Bottom boundary
        if (atom.y + atom.height > bottomBoundary) {
            atom.y = bottomBoundary - atom.height;
            atom.baseVelocityY = -Math.abs(atom.baseVelocityY);
        }
    }

    // =========================================
    // Collision Detection
    // =========================================

    getDistance(x1, y1, x2, y2) {

        const dx = x2 - x1;
        const dy = y2 - y1;

        return Math.sqrt(dx * dx + dy * dy);
    }

    checkAtomCollisions() {

        for (let i = 0; i < this.atoms.length; i++) {

            for (let j = i + 1; j < this.atoms.length; j++) {

                this.resolveAtomCollision(
                    this.atoms[i],
                    this.atoms[j]
                );
            }
        }
    }

    resolveAtomCollision(a, b) {

        const centerAX = a.x + a.width / 2;
        const centerAY = a.y + a.height / 2;

        const centerBX = b.x + b.width / 2;
        const centerBY = b.y + b.height / 2;

        const dx = centerBX - centerAX;
        const dy = centerBY - centerAY;

        const distance = this.getDistance(
            centerAX,
            centerAY,
            centerBX,
            centerBY
        );

        if (distance === 0) return;

        const radiusA = a.width / 2;
        const radiusB = b.width / 2;

        const overlap = radiusA + radiusB - distance;

        if (overlap <= 0) return;

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

            a.baseVelocityX += velocityAlongNormal * nx;
            a.baseVelocityY += velocityAlongNormal * ny;

            b.baseVelocityX -= velocityAlongNormal * nx;
            b.baseVelocityY -= velocityAlongNormal * ny;
        }

        // Separate overlapping atoms
        a.x -= nx * overlap / 2;
        a.y -= ny * overlap / 2;

        b.x += nx * overlap / 2;
        b.y += ny * overlap / 2;
    }

    checkProjectileCollisions() {

        // Copy array because collisions can remove projectiles
        [...this.projectiles].forEach(projectile => {

            if (projectile.attached) return;

            for (let i = this.atoms.length - 1; i >= 0; i--) {

                const atom = this.atoms[i];

                const atomX = atom.x + atom.width / 2;
                const atomY = atom.y + atom.height / 2;

                const distance = this.getDistance(
                    projectile.x,
                    projectile.y,
                    atomX,
                    atomY
                );

                if (distance < projectile.radius + atom.width / 2) {

                    this.attachProjectile(projectile, atom);
                    this.damageAtom(atom);

                    break;
                }
            }
        });
    }

    attachProjectile(projectile, atom) {

        projectile.attached = true;
        projectile.attachedTo = atom;

        projectile.offsetX =
            projectile.x - (atom.x + atom.width / 2);

        projectile.offsetY =
            projectile.y - (atom.y + atom.height / 2);
    }

    // =========================================
    // Atom Health and Removal
    // =========================================

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

        // Remove projectiles attached to this atom
        this.projectiles = this.projectiles.filter(
            projectile => projectile.attachedTo !== atom
        );
    }

    // =========================================
    // Game Update
    // =========================================

    update(deltaTime) {

        if (this.levelComplete) return;

        this.updateCannon(deltaTime);
        this.updateProjectiles(deltaTime);

        this.moveAtoms(deltaTime);

        this.checkAtomCollisions();
        this.checkProjectileCollisions();

        this.updateScore();

        this.checkLevelCompletion();
    }

    updateScore() {

        const multiplier =
            1 + (this.getTemperatureFactor() + 0.3);

        this.scoreManager.add(
            Math.round(multiplier ** 2)
        );
    }

    // =========================================
    // Drawing
    // =========================================

    draw() {

        super.draw();

        this.drawCannon();
        this.drawProjectiles();
        this.drawBottomBoundary();
        this.drawHUD();

        if (this.levelComplete) {
            this.drawLevelComplete();
        }
    }

    drawHUD() {

        const ctx = this.ctx;

        ctx.fillStyle = "black";
        ctx.font = "20px Atkinson Hyperlegible";

        ctx.fillText(
            `Cost: $ ${this.scoreManager.getValue()}`,
            10,
            25
        );

        ctx.fillText(
            `Atoms remaining: ${this.atoms.length}`,
            10,
            50
        );
    }

    drawBottomBoundary() {

        const ctx = this.ctx;
        const boundary = this.canvas.height - 30;

        ctx.save();

        ctx.beginPath();
        ctx.moveTo(0, boundary);
        ctx.lineTo(this.canvas.width, boundary);

        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    
    drawCannon() {

        const ctx = this.ctx;
        const cannon = this.cannon;

        // =====================================
        // Cannon Barrel
        // =====================================

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

        // =====================================
        // Cannon Semicircular Base
        // =====================================

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

        // =====================================
        // Cannon Emoji
        // =====================================

        if (cannon.emoji) {

            ctx.save();

            ctx.font = "18px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Position emoji in the centre of the semicircle
            ctx.fillText(
                cannon.emoji,
                cannon.x,
                cannon.y - 9
            );

            ctx.restore();

        }

        // =====================================
        // Trajectory
        // =====================================

        this.drawTrajectory();

    }


    drawTrajectory() {

        const ctx = this.ctx;
        const cannon = this.cannon;

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

    drawProjectiles() {

        const ctx = this.ctx;

        this.projectiles.forEach(projectile => {

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

    // =========================================
    // Restart
    // =========================================

    restart() {

        this.levelComplete = false;
        this.finalScore = 0;

        // Reset cannon
        this.cannon.angle = -Math.PI / 2;

        // Clear projectiles
        this.projectiles = [];
        this.fireCooldown = 0;

        // Remove existing atoms
        this.atoms.forEach(atom => {
            this.removeEntity(atom);
        });

        this.atoms = [];

        // Recreate atoms
        this.createAtoms(this.atomCount);

        // Reset score
        this.resetScore();

        // Reset game state
        this.state = "menu";
        this.running = false;

    }
}
