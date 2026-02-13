

export default class TicTacToeEngine {
    static checks = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    static WIN  = 1;
    static CATS = 0;
    static CONTINUE = -1;

    constructor() {
        this.newGame();
    }

    get free() {
        let result = [];
        for (let i = 0; i < this.board.length; ++i) {
            if (this.getCell(i) == undefined) result.push(i);
        }
        return result;
    }

    newGame() {
        this.turn = false;
        this.board = new Array(9).fill(undefined);
    }

    getCell(index) {
        return this.board[index];
    }

    checkWin() {
        let cats = new Set();

        for (const arr of TicTacToeEngine.checks) {
            let found = 0;
            
            for (const slot of arr) {
                const cell = this.getCell(slot);
                if ([true, false].indexOf(cell) != -1) cats.add(slot);
                if (cell == !this.turn) {
                    ++found;
                }
            }
            if (found == 3) return TicTacToeEngine.WIN;
        }

        return cats.size >= 9 ? TicTacToeEngine.CATS : TicTacToeEngine.CONTINUE; 
    }

    nextTurn() {
        this.turn = !this.turn;
    }

    place(slot) {
        this.board[slot] = this.turn;
    }

    takeTurn(slot) {
        if (this.board[slot] != undefined) {
            return false;
        }

        this.place(slot);
        this.nextTurn();
        return true;
    }
}