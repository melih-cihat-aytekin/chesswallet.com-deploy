import React, { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

function ChessBoardMiniPuzzle({puzzlePosition, board_width}) {
    const [position, setPosition] = useState(puzzlePosition); // Başlangıç pozisyonu
    const chess = new Chess(); // Satranç oyunu motoru

    return (
        <div>
            <Chessboard 
                position={puzzlePosition}
                boardWidth={board_width}
                arePiecesDraggable={false}
            />
        </div>
    );
}

export default ChessBoardMiniPuzzle;
