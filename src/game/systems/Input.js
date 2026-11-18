
export default class Input {

    constructor() {
        this.keys = {};

        window.addEventListener("keydown", (event) => {
            this.keys[event.key] = true;
        });

        window.addEventListener("keyup", (event) => {
            this.keys[event.key] = false;
        });
    }

    isDown(key) {
        return Boolean(this.keys[key]);
    }

    isMovingLeft() {
        return this.isDown("ArrowLeft") ||
               this.isDown("a");
    }

    isMovingRight() {
        return this.isDown("ArrowRight") ||
               this.isDown("d");
    }

    isMovingUp() {
        return this.isDown("ArrowUp") ||
               this.isDown("w");
    }

    isMovingDown() {
        return this.isDown("ArrowDown") ||
               this.isDown("s");
    }
}
