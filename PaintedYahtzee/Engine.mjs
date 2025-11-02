


export default class Engine {
    constructor() {
        this.scores = document.querySelectorAll(`[name="score"]`);
        this.rolls  = 0;
        this.selected = undefined;
        this.dice     = [];
        this.running  = false;
        for (const score of this.scores) {
            score.onclick = e => {
                if (this.rolls < 1) return;
                if (this.selected) {
                    this.selected.style.border = "";
                }
                if (this.selected == score) 
                {
                    this.selected = undefined;
                    return;
                }
                this.selected = score;
                score.style.border = `4px solid lime`;
            }
        }
    }

    get cantRoll() {
        return this.rolls >= 3 || this.running == false;
    }

    checkDice() {
        if (this.gameEnd() & this.running == true) {
            alert(`Your score: ${this.gtotal}`);
            this.running = false;
            parent.giveCoin(Math.trunc(this.gtotal / 30)||1);
            return true;
        }
        if (this.selected && this.rolls >= 1 && !this.selected.hasAttribute("data-value")) {
            const dice  = document.querySelectorAll('.die');
            for (const die of dice) {
                die.classList.remove("selected");
            }
            this.showAble(this.selected);
            this.selected.style.border = "";
            this.selected = undefined;
            this.rolls = 0;
            return true;
        }

        return false;
    }

    putDice(dice) {
        if (this.checkDice()) {
            return true;
        }
        if (this.rolls >= 3) return;
        this.dice = dice;
        ++this.rolls;
        this.showAble();
    }

    scoreSingle(value) {
        return this.dice.filter(x => value == x.value).length * value;
    }

    scoreColor(value) {
        return this.dice.filter(x => value == x.color).reduce((partialSum, a) => partialSum + a.value, 0);
    }

    gameEnd() {
        return Object.values(this.scores).filter(x => !x.hasAttribute("data-value")).length == 0;
    }

    kind(key, amt=4) {
        const countMap = {};
        let found      = false;
        let total      = 0;

        for (let die of this.dice) {
            const num = die[key];
            countMap[num] = (countMap[num] || 0) + 1;
            total += die.value;
            if (countMap[num] === amt) found = true;
        }

        if (amt == 4)
            return found ? total : 0; // No element appears four times
        else if (amt == 5)
            return found ? key == "color" ? 45 : 50 : 0;
    }

    isFullHouse(key) {
        const counts = {};

        // Count occurrences of each number
        for (let die of this.dice) {
            const num = die[key];
            counts[num] = (counts[num] || 0) + 1;
        }

        // Extract values from the frequency map
        const values = Object.values(counts);

        // A Full House must contain exactly one "3" and one "2"
        return values.includes(3) && values.includes(2) ? 25 : 0;
    }

    fiveDiff(key) {
        const counts = {};

        // Count occurrences of each number
        for (let die of this.dice) {
            const num = die[key];
            counts[num] = (counts[num] || 0) + 1;
        }

        // Extract values from the frequency map
        const values = Object.values(counts);

        // A Full House must contain exactly one "3" and one "2"
        return Object.keys(counts).length == 5 ? key == "color" ? 35 : 50 : 0;
    }

    straight() {
        const dice = structuredClone(this.dice);
        // Sort the dice values
        dice.sort((a, b) => a.value - b.value);

        // Check if numbers are consecutive
        for (let i = 1; i < dice.length; i++) {
            if (dice[i].value !== dice[i - 1].value + 1) {
                return 0; // Not a straight
            }
        }
        return 40; // It's a straight!
    }

    chance() {
        return this.dice.reduce((partialSum, a) => partialSum + a.value, 0);
    }

    showAble(selected) {
        let gtotal = 0, score = 0, bonus= 0;
        for (let i = 0; i < 6; ++i) {
            const scores = this.scores[i];
            if (scores.dataset?.value == undefined) {
                scores.value = this.scoreSingle(i+1);
                scores.style.color = "red";
                if (selected == this.scores[i]) {
                    scores.setAttribute("data-value", scores.value);
                    scores.dataset.value = scores.value;
                    scores.style.color = "lime";
                    score += parseInt(scores.value);
                }
            }
            else {
                scores.value = scores.dataset.value;
                scores.style.color = "lime";
                score += parseInt(scores.dataset.value);
            }
        }
        // upper
        if (score >= 63) bonus = 35;
        document.querySelector("#upper-bonus").textContent = `Bonus (63): ${bonus}`;
        document.querySelector("#upper-total").textContent = `Total: ${bonus + score}`;
        gtotal += score + bonus;

        score = 0, bonus = 0;

        const colors = ["blue", "green", "red","yellow","purple"]
        let base = 6;
        for (let i = 0; i < colors.length; ++i) {
            const scores = this.scores[i+base];
            if (scores.dataset?.value == undefined) {
                scores.value = this.scoreColor(colors[i]);
                scores.style.color = "red";
                if (selected == scores) {
                    scores.setAttribute("data-value", scores.value);
                    scores.dataset.value = scores.value;
                    scores.style.color = "lime";
                    score += parseInt(scores.value);
                }
            }
            else {
                scores.value = scores.dataset.value;
                scores.style.color = "lime";
                score += parseInt(scores.dataset.value);
            }
        }
        // middle
        if (score >= 75) bonus = 25;
        document.querySelector("#middle-bonus").textContent = `Bonus (75): ${bonus}`;
        document.querySelector("#middle-total").textContent = `Total: ${bonus + score}`;
        gtotal += score + bonus;

        score = 0, bonus = 0;

        base = 11;
        const funcs = [
            this.kind.bind(this, "value"),
            this.kind.bind(this, "color"),
            this.isFullHouse.bind(this, "value"),
            this.isFullHouse.bind(this, "color"),
            this.fiveDiff.bind(this, "color"),
            this.straight.bind(this),
            this.kind.bind(this, "color", 5),
            this.kind.bind(this, "value", 5),
            this.chance.bind(this)
        ]
        for (let i = 0; i < funcs.length; ++i) {
            const scores = this.scores[i+base];
            if (scores.dataset?.value == undefined) {
                scores.value = funcs[i]();
                scores.style.color = "red";
                if (selected == scores) {
                    scores.setAttribute("data-value", scores.value);
                    scores.dataset.value = scores.value;
                    scores.style.color = "lime";
                    score += parseInt(scores.value);
                }
            }
            else {
                scores.value = scores.dataset.value;
                scores.style.color = "lime";
                score += parseInt(scores.dataset.value);
            }
        }
        
        document.querySelector("#lower-bonus").textContent = `Bonus: ${bonus}`;
        document.querySelector("#lower-total").textContent = `Total: ${bonus + score}`;
        gtotal += score + bonus;
        document.querySelector("#grand-total").textContent = `Grand Total ${gtotal||0}`;
        this.gtotal = gtotal;
    }
}