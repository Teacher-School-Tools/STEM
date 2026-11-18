export default class ProjectileManager {

    constructor(game) {
        this.game = game;
    }

    fire() {
        const game = this.game;
        const angle = game.cannon.angle;

        const projectile = {
            x: game.cannon.x +
                Math.cos(angle) * game.cannon.barrelLength,

            y: game.cannon.y +
                Math.sin(angle) * game.cannon.barrelLength,

            velocityX: Math.cos(angle) * game.projectileSpeed,
            velocityY: Math.sin(angle) * game.projectileSpeed,

            radius: game.projectileRadius,

            attached: false,
            attachedTo: null,

            offsetX: 0,
            offsetY: 0
        };

        game.projectiles.push(projectile);

        game.scoreManager.add(5000);
    }

    update(deltaTime) {
        const game = this.game;

        game.projectiles = game.projectiles.filter(projectile =>
            !projectile.attached ||
            game.atoms.includes(projectile.attachedTo)
        );

        game.projectiles.forEach(projectile => {
            if (projectile.attached) {
                this.updateAttached(projectile);
                return;
            }

            projectile.x += projectile.velocityX * deltaTime;
            projectile.y += projectile.velocityY * deltaTime;
        });

        game.projectiles = game.projectiles.filter(projectile => {
            if (projectile.attached) return true;

            return (
                projectile.x >= 0 &&
                projectile.x <= game.canvas.width &&
                projectile.y >= 0 &&
                projectile.y <= game.canvas.height
            );
        });
    }

    attach(projectile, atom) {
        projectile.attached = true;
        projectile.attachedTo = atom;

        projectile.offsetX =
            projectile.x - (atom.x + atom.width / 2);

        projectile.offsetY =
            projectile.y - (atom.y + atom.height / 2);
    }

    updateAttached(projectile) {
        const atom = projectile.attachedTo;

        projectile.x =
            atom.x + atom.width / 2 + projectile.offsetX;

        projectile.y =
            atom.y + atom.height / 2 + projectile.offsetY;
    }
}
