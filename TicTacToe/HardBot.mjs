import findBestMove from "./minmaxAI.mjs";

export default class HardBot {
    takeTurn(board, free) {
        return findBestMove(board);
    }
}