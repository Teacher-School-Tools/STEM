
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
        
        this.collectibles = [];

        this.createCollectibles(5)
        // Create collectible


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
        // Handle player movement
        this.player.handleInput(this.input);

        this.player.update(deltaTime, this.canvas);

        // Check for collectible collision
        this.collectibles.forEach(collectible => {

    if (Collision.check(this.player, collectible)) {

        this.scoreManager.add(50);

        // Move only the collected object
        collectible.x = Math.random() *
            (this.canvas.width - collectible.width);

        collectible.y = Math.random() *
            (this.canvas.height - collectible.height);

    }

});

    }

    moveCollectible() {

    this.collectibles.forEach(collectible => {

        collectible.x = Math.random() *
            (this.canvas.width - collectible.width);

        collectible.y = Math.random() *
            (this.canvas.height - collectible.height);

    });

}

    createCollectibles(number) {

    for (let i = 0; i < number; i++) {

        const collectible = new Entity(
            0, 0, 20, 20
        );

        collectible.color = "orange";

        this.collectibles.push(collectible);
        this.addEntity(collectible);

    }

    this.moveCollectible();

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

        this.moveCollectible();

        this.running = false;
        this.start();

    }

}
