
export default class CollisionManager {

    constructor(game) {
        this.game = game;
    }

    getDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;

        return Math.sqrt(dx * dx + dy * dy);
    }

    checkAtomCollisions() {
        const atoms = this.game.atoms;

        for (let i = 0; i < atoms.length; i++) {
            for (let j = i + 1; j < atoms.length; j++) {
                this.resolveAtomCollision(
                    atoms[i],
                    atoms[j]
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

        if (velocityAlongNormal < 0) {
            a.baseVelocityX += velocityAlongNormal * nx;
            a.baseVelocityY += velocityAlongNormal * ny;

            b.baseVelocityX -= velocityAlongNormal * nx;
            b.baseVelocityY -= velocityAlongNormal * ny;
        }

        a.x -= nx * overlap / 2;
        a.y -= ny * overlap / 2;

        b.x += nx * overlap / 2;
        b.y += ny * overlap / 2;
    }

    checkProjectileCollisions() {
        const game = this.game;

        [...game.projectiles].forEach(projectile => {
            if (projectile.attached) return;

            for (let i = game.atoms.length - 1; i >= 0; i--) {
                const atom = game.atoms[i];

                const atomX = atom.x + atom.width / 2;
                const atomY = atom.y + atom.height / 2;

                const distance = this.getDistance(
                    projectile.x,
                    projectile.y,
                    atomX,
                    atomY
                );

                if (
                    distance <
                    projectile.radius + atom.width / 2
                ) {
                    game.projectileManager.attach(
                        projectile,
                        atom
                    );

                    game.atomManager.damageAtom(atom);

                    break;
                }
            }
        });
    }
}
