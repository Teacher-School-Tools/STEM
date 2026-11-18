import Score from "../core/Score";

export default class GameScoreManager {

    constructor(game) {
        this.game = game;
        this.score = new Score();
    }

    reset() {
        this.score.reset();
        this.score.add(5000 * this.game.atoms.length);
    }

    add(amount) {
        this.score.add(amount);
    }

    getValue() {
        return this.score.getValue();
    }

    update() {
        const game = this.game;

        const multiplier =
            1 + (game.getTemperatureFactor() + 0.3);

        this.score.add(Math.round(multiplier ** 2));
    }
}
