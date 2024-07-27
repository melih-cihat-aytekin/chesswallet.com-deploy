// chessPGN.js

// Oyun verilerini PGN formatında oluşturan modül
const generatePGN = (gameData) => {
    let pgn = '';

    // Event
    pgn += `[Event "Live Chess"]\n`;

    // Site
    pgn += `[Site "Chess.com"]\n`;

    // Tarih
    const currentDate = new Date().toISOString().slice(0, 10);
    pgn += `[Date "${currentDate}"]\n`;

    // Round
    pgn += `[Round "?"]\n`;

    // White oyuncu adı
    pgn += `[White "${gameData.white_player_name}"]\n`;

    // Black oyuncu adı
    pgn += `[Black "${gameData.black_player_name}"]\n`;

    // Sonuç
    pgn += `[Result "${gameData.game_result}"]\n\n`;

    // Hamleleri birleştir
    const whiteMoves = gameData.white_moves.split(' ');
    const blackMoves = gameData.black_moves.split(' ');

    let moveNumber = 1;
    for (let i = 0; i < whiteMoves.length; i++) {
        if (i > 0 && i % 2 === 0) {
            pgn += `${moveNumber}. `;
            moveNumber++;
        }
        pgn += `${whiteMoves[i]} `;
        if (i < blackMoves.length) {
            pgn += `${blackMoves[i]} `;
        }
    }

    // Sonuç ekle
    if (gameData.results === 1) {
        pgn += `${gameData.results}-0`;
    } else if (gameData.results === 0) {
        pgn += `${gameData.results}-1`;
    }
    return pgn.trim();
}

// Modül olarak dışa aktar
export {
    generatePGN,
};