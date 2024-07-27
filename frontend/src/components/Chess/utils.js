const { Chess } = require('chess.js');

function getSideToPlayFromFen(fen) {
    const chess = new Chess(fen);
    return chess.turn();
}

function makeMove(fen, move) {
    const chess = new Chess(fen);
    const fullMove = chess.move(move);
    return fullMove ? { fullMove, fen: chess.fen() } : null;
}

function validateMove(fen, move, solution) {
    if (solution.length === 0) {
        return null;
    }

    const next = makeMove(fen, move);

    if (next && next.fullMove.san === solution[0]) {
        return {
            fen: next.fen,
            solution: solution.slice(1),
        };
    }

    return null;
}



module.exports = {
    getSideToPlayFromFen,
    makeMove,
    validateMove
};
