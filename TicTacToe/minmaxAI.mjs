const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

export default function findBestMove(board) {
    board = structuredClone(board);
    let bestVal = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === undefined) {
            board[i] = true;
            let moveVal = minimax(board, 0, false);
            board[i] = undefined;

            if (moveVal > bestVal) {
                bestMove = i;
                bestVal = moveVal;
            }
        }
    }

    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    let score = evaluate(board);

    if (score === 10) return score - depth;
    if (score === -10) return score + depth;
    if (board.every(cell => cell !== undefined)) return 0;

    if (isMaximizing) {
        let best = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === undefined) {
                board[i] = true;
                best = Math.max(best, minimax(board, depth + 1, false));
                board[i] = undefined;
            }
        }
        return best;
    } else {
        let best = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === undefined) {
                board[i] = false;
                best = Math.min(best, minimax(board, depth + 1, true));
                board[i] = undefined;
            }
        }
        return best;
    }
}

function evaluate(board) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] === board[b] && board[b] === board[c]) {
            if (board[a] === true) return 10;
            if (board[a] === false) return -10;
        }
    }
    return 0;
}