import Entity from "../core/Entity";

export default class AtomManager {

    constructor(game) {
        this.game = game;
    }

    createAtoms(number) {
        const game = this.game;

        for (let i = 0; i < number; i++) {
            const atom = this.createAtom();

            game.atoms.push(atom);
            game.addEntity(atom);
        }

        this.resetAtoms();
    }

    createAtom() {
        const game = this.game;

        const atom = new Entity(0, 0, 20, 20);

        atom.color = "orange";
        atom.maxHealth = game.atomHealth;
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

            ctx.fillStyle = this.health === this.maxHealth
                ? "orange"
                : this.health > 1
                    ? "gold"
                    : "red";

            ctx.fill();
        };

        return atom;
    }

    resetAtoms() {
        const game = this.game;

        game.atoms.forEach(atom => {
            atom.x = Math.random() *
                (game.canvas.width - atom.width);

            atom.y = Math.random() *
                (game.canvas.height - atom.height - 60);

            atom.baseVelocityX = (Math.random() - 0.5) * 500;
            atom.baseVelocityY = (Math.random() - 0.5) * 500;

            atom.velocityX = atom.baseVelocityX;
            atom.velocityY = atom.baseVelocityY;
        });
    }

    moveAtoms(deltaTime) {
        const game = this.game;

        const speedMultiplier =
            0.5 + game.getTemperatureFactor() * 2.5;

        game.atoms.forEach(atom => {
            atom.velocityX =
                atom.baseVelocityX * speedMultiplier;

            atom.velocityY =
                atom.baseVelocityY * speedMultiplier;

            atom.x += atom.velocityX * deltaTime;
            atom.y += atom.velocityY * deltaTime;

            this.checkBoundaries(atom);
        });
    }

    checkBoundaries(atom) {
        const game = this.game;

        const bottomBoundary = game.canvas.height - 30;

        if (atom.x < 0) {
            atom.x = 0;
            atom.baseVelocityX = Math.abs(atom.baseVelocityX);
        }

        if (atom.x + atom.width > game.canvas.width) {
            atom.x = game.canvas.width - atom.width;
            atom.baseVelocityX = -Math.abs(atom.baseVelocityX);
        }

        if (atom.y < 0) {
            atom.y = 0;
            atom.baseVelocityY = Math.abs(atom.baseVelocityY);
        }

        if (atom.y + atom.height > bottomBoundary) {
            atom.y = bottomBoundary - atom.height;
            atom.baseVelocityY = -Math.abs(atom.baseVelocityY);
        }
    }

    damageAtom(atom) {
        atom.health--;

        if (atom.health <= 0) {
            this.removeAtom(atom);
        }
    }

    removeAtom(atom) {
        const game = this.game;

        game.removeEntity(atom);

        game.atoms = game.atoms.filter(
            existing => existing !== atom
        );

        game.projectiles = game.projectiles.filter(
            projectile => projectile.attachedTo !== atom
        );
    }

    setAtomCount(number) {
        const game = this.game;

        if (game.currentLevel !== "level0") return;

        const count = Number(number);

        if (!Number.isFinite(count)) return;

        game.atomCount = Math.max(
            1,
            Math.min(50, Math.floor(count))
        );

        this.clearAtoms();

        game.projectiles = [];

        this.createAtoms(game.atomCount);

        game.resetScore();

        game.levelComplete = false;
        game.finalScore = 0;

        if (game.state === "finished") {
            game.state = "menu";
        }
    }

    clearAtoms() {
        const game = this.game;

        game.atoms.forEach(atom => {
            game.removeEntity(atom);
        });

        game.atoms = [];
    }
}
