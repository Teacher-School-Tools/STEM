
export default class Score {

    constructor() {
        this.value = 0;
    }

    add(points) {
        this.value += points;
    }

    reset() {
        this.value = 0;
    }

    getValue() {
        return this.value;
    }
}
