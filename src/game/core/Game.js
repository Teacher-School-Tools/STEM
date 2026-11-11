
export default class Game {

    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.running = false;
        this.lastTime = 0;

        this.entities = [];

        this.score = 0;
        this.state = "menu";
    }

    start() {
        this.state = "playing";
        this.running = true;

        this.lastTime = performance.now();

        requestAnimationFrame(
            (time) => this.loop(time)
        );
    }

    loop(time) {

        if (!this.running) return;

        // Calculate elapsed time
        const deltaTime = Math.min(
            (time - this.lastTime) / 1000,
            0.05
        );

        this.lastTime = time;

        if (this.state === "playing") {
            this.update(deltaTime);
        }

        this.draw();

        requestAnimationFrame(
            (time) => this.loop(time)
        );
    }

    update(deltaTime) {
        this.entities.forEach(entity => {
            entity.update(deltaTime);
        });
    }

    draw() {
        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        this.entities.forEach(entity => {
            entity.draw(this.ctx);
        });
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    removeEntity(entity) {
        this.entities = this.entities.filter(
            item => item !== entity
        );
    }

    pause() {
        this.state = "paused";
    }

    resume() {
        if (this.state === "paused") {
            this.state = "playing";
        }
    }

    stop() {
        this.running = false;
        this.state = "gameover";
    }
}
