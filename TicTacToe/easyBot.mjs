import Chance from "./Chance.mjs";

export default class EasyBot {
    takeTurn(board, free) {
        return Chance.pick(free);
    }
}