import Chance from "./Chance.mjs";
import findBestMove from "./minmaxAI.mjs";

export default class MediumBot {
    takeTurn(board, free) {
        if (Chance.chance(25))
            return Chance.pick(free);
        return findBestMove(board);
    }
}