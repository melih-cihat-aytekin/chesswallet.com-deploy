import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from "react-router";
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import '../assets/css/public.css'
import './chess.css'
import socket from '../../socket.js';
import { useParams } from 'react-router-dom';

import { SquareBackground_bos, DarkSquareBackground_ana, LightSquareBackground_ana, DarkSquareBackground_buzlu_deniz, LightSquareBackground_buzlu_deniz } from './CustomBoard.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRectangleXmark, faGear, faAngleLeft, faAngleRight, faPlay } from "@fortawesome/free-solid-svg-icons"
import { SERVER_URL } from '../../helper.js';
import axios from "axios";


function ChessBoardPlayArchive({ boardOrientation, username, rakip_username, room, inArchive }) {

  console.log(username, rakip_username, room, inArchive)
  const navigate = useNavigate()

  const [game, setGame] = useState(() => new Chess(), []);
  const [gameResultMsg, setGameResultMsg] = useState('');
  const { game_id_sayisi } = useParams();
  const game_id = game_id_sayisi - 1000000
  const [fen, setFen] = useState(game.fen());
  const [game_over, setGame_over] = useState(false)

  const [movesWhite, setMovesWhite] = useState([]);
  const [movesBlack, setMovesBlack] = useState([]);
  const [combinedMoves, setCombinedMoves] = useState([]);

  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [currentFEN, setCurrentFEN] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");


  const [pieceTheme, setPieceTheme] = useState('ana')
  const [darkSquareTheme, setDarkSquareTheme] = useState(DarkSquareBackground_ana)
  const [lightSquareTheme, setLightSquareTheme] = useState(LightSquareBackground_ana)

  const [ArchiveWhiteMoves, setArchiveWhiteMoves] = useState([]);
  const [ArchiveBlackMoves, setArchiveBlackMoves] = useState([]);

  const [bestMove, setBestMove] = useState('')

  const [playing, setPlaying] = useState(false);

  const pieces = [
    "wP",
    "wN",
    "wB",
    "wR",
    "wQ",
    "wK",
    "bP",
    "bN",
    "bB",
    "bR",
    "bQ",
    "bK",
  ];
  const customPieces = () => {
    const returnPieces = {};
    pieces.map((p) => {
      returnPieces[p] = ({ squareWidth }) => (
        <div
          style={{
            width: squareWidth,
            height: squareWidth,
            backgroundImage: `url(${SERVER_URL}/piece/${pieceTheme}/${p}.png)`,
            backgroundSize: "100%",
          }}
        />
      );
      return null;
    });
    return returnPieces;
  };

  const customDarkSquareStyle = () => {
    return darkSquareTheme;
  }

  const customLightSquareStyle = () => {
    return lightSquareTheme;
  }

  const makeAMove = useCallback(
    (move) => {
      try {
        const result = game.move(move);

        if (result === null) {
          // Eğer hamle geçerli değilse, bir hata mesajı ayarla
          console.error('Invalid move:', move);
          // veya setGameResultMsg('Invalid move: ' + move);
        } else {
          console.log("over, checkmate", game.isGameOver(), game.isCheckmate());
          if (game.isGameOver()) { // check if move led to "game over"
            if (game.isCheckmate()) { // if reason for game over is a checkmate
              // Set message to checkmate. 
              setGameResultMsg(
                `Checkmate! ${game.turn() === "w" ? `${username}` : `${rakip_username}`} wins!`
              );
              setGame_over(true)
              // The winner is determined by checking for which side made the last move
            } else if (game.isDraw()) { // if it is a draw
              setGameResultMsg("Draw"); // set message to "Draw"
              setGame_over(true)
            } else {
              setGameResultMsg("Game over");
              setGame_over(true)
            }
          }
          setFen(game.fen());
        }

        return result;
      } catch (e) {
        console.error('An error occurred while making a move:', e);
        return null;
      }
    },
    [game]
  );

  const makeAMoveArchive = useCallback(
    (move) => {
      try {
        const result = game.move(move);

        if (result === null) {
          console.error('Invalid move:', move);
        } else {
          setFen(game.fen());
          setCurrentFEN(game.fen()); // currentFEN'i güncelle
        }

        return result;
      } catch (e) {
        console.error('An error occurred while making a move:', e);
        return null;
      }
    },
    [game]
  );

  useEffect(() => {
    if (inArchive) {
      fetchInArchive();
    }
  }, []);

  useEffect(() => {
    let stopFlag = false;

    const playMovesSequentially = async () => {
      const totalMoves = combinedMoves.length;

      for (let currentMove = currentMoveIndex; currentMove < totalMoves; currentMove++) {
        if (!playing || stopFlag) {
          break;
        }
        makeAMoveArchive(combinedMoves[currentMove]);
        setCurrentMoveIndex(currentMove + 1);
        
        // Hamleler arasında bekleme için 300 ms'lik bir gecikme ekleyin
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    };
    
    if (inArchive && playing) {
      playMovesSequentially();
    }
    
    return () => {
      // Durdur tuşuna basıldığında bu temizleme fonksiyonu çalışacak
      stopFlag = true;
    };
  }, [inArchive, playing, ArchiveWhiteMoves, ArchiveBlackMoves]);


  const playOrStopGame = () => {
    if (!playing) {
      // Oyun başladığında mevcut hamle indeksini başa al
    }
    setPlaying(!playing);
  };

  useEffect(() => {
    socket.emit("stockfish", currentFEN)
    socket.on("stockfish_response", (bestMove) => {
      setBestMove(bestMove)
    })
  }, [game.fen()])



  const fetchInArchive = async () => {
    const res = await axios.post(`${SERVER_URL}/archive_veri`, { room });

    if (res.data.status === 'OK') {
      console.log(res.data);
      let results = res.data.results;
      const whiteMoves = parseChessNotation(splitStringInHalf(results.white_moves))
      const blackMoves = parseChessNotation(splitStringInHalf(results.black_moves))

      combinatedMovesFunc(whiteMoves, blackMoves)
      // Satranç notasyonunu hamle dizisine çevir
      setArchiveWhiteMoves(parseChessNotation(splitStringInHalf(results.white_moves)));
      setArchiveBlackMoves(parseChessNotation(splitStringInHalf(results.black_moves)));
    }
  };

  const combinatedMovesFunc = (movesW, movesB) => {
    let tempCombinedMoves = [];
    for (let i = 0; i < Math.max(movesW.length, movesB.length); i++) {
      if (i < movesW.length) {
        tempCombinedMoves.push(movesW[i]);
      }
      if (i < movesB.length) {
        tempCombinedMoves.push(movesB[i]);
      }
    }

    setCombinedMoves(tempCombinedMoves);
  }

  const splitStringInHalf = (inputString) => {
    if (typeof inputString !== 'string') {
      console.error('Invalid input format. Expecting a string.');
      return '';
    }
    const stringLength = inputString.length;
    // Karakter sayısını ikiye bölen indeks
    const splitIndex = Math.floor(stringLength / 2);
    // İlk yarıyı al
    const firstHalf = inputString.slice(0, splitIndex);

    return firstHalf;
  };


  const parseChessNotation = notation => {
    const moves = notation.split(/\s+/).filter(move => move !== '');
    // console.log("moves : ", moves)
    return moves;
  };

  function onDrop(source, target) {
    if (game.turn() !== boardOrientation[0]) return false;

    const moveData = {
      from: source,
      to: target,
      color: game.turn(),
      promotion: "q",
    };

    const move = makeAMove(moveData);

    if (move === null) {
      console.error('Invalid move:', moveData);
      // veya setGameResultMsg('Invalid move: ' + moveData);
      return false;
    }

    if (game.turn() === "b") {
      setMovesWhite((prevMoves) => [...prevMoves, move.san]);
    } else {
      setMovesBlack((prevMoves) => [...prevMoves, move.san]);
    }

    // socket.emit("move", {
    //   move,
    //   room: game_id,
    //   username,
    // });

    return true;
  }


  // İleri ve geri işlemlerine yönelik event işleyicileri
  const handleMoveForward = () => {
    // Mevcut hamle indeksini kontrol et
    if (currentMoveIndex < combinedMoves.length) {
      makeAMoveArchive(combinedMoves[currentMoveIndex]);
      setCurrentMoveIndex(currentMoveIndex + 1); // Hamle indeksini güncelle
    }
  };

  const handleMoveBackward = () => {
    if (currentMoveIndex > 0) {
      // Mevcut hamle indeksi sıfır olana kadar hamleleri geri al
      setCurrentMoveIndex(currentMoveIndex - 1);
      game.undo(); // Son hamleyi geri al
      setFen(game.fen()); // Fen durumunu güncelle
    }
  };





  const board_setting_on_btn = () => {
    document.querySelector(".board_setting_on").style.display = 'flex';
  }
  const board_setting_off_btn = () => {
    document.querySelector(".board_setting_on").style.display = 'none';
  }

  return (
    <div className='board'>
      <div className='board-container-normal'>

        <Chessboard
          position={fen}
          onPieceDrop={onDrop}
          // arePremovesAllowed={true}
          customBoardStyle={{
            zIndex: "1",
            position: "relative",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          }}
          customDarkSquareStyle={{ backgroundColor: customDarkSquareStyle() }}
          customLightSquareStyle={{ backgroundColor: customLightSquareStyle() }}
          customPieces={customPieces()}
          boardOrientation={
            boardOrientation === "white" ? "white" : "black"
          }
        />
        <div className="board_setting_on">
          <div className='board_setting_on_close_btn_area'>
            <FontAwesomeIcon onClick={board_setting_off_btn} icon={faRectangleXmark} />
          </div>
          <div className='board_setting_on_area'>
            <div className="board-container-normal-btn">
              <button onClick={() => { setPieceTheme('ana') }}>Chess.com</button>
              <button onClick={() => { setPieceTheme('wikipedia') }}>Wikipedia</button>
            </div>
            <div className="board-container-normal-btn">
              <button onClick={() => { setDarkSquareTheme(SquareBackground_bos); setLightSquareTheme(SquareBackground_bos) }}>Empty</button>
              <button onClick={() => { setDarkSquareTheme(DarkSquareBackground_ana); setLightSquareTheme(LightSquareBackground_ana) }}>Chess.com</button>
              <button onClick={() => { setDarkSquareTheme(DarkSquareBackground_buzlu_deniz); setLightSquareTheme(LightSquareBackground_buzlu_deniz) }}>Buzlu Deniz</button>
            </div>
          </div>
        </div>
        <div className={`board-result ${game_over ? 'display-flex' : 'display-none'}`}>
          {gameResultMsg}
        </div>
      </div>
      <div className="board_setting_off">
        <FontAwesomeIcon onClick={board_setting_on_btn} icon={faGear} />
      </div>
      <div className='board-istatistik-area'>
        <div>
          {
            bestMove
          }
        </div>
        <div className='moves-container'>
          <div className='moves-white-area'>
            {movesWhite.map((move, index) => (
              <div className='moves-area' key={index}>
                {`${move}`}
              </div>
            ))
            }
          </div>

          <div className='moves-black-area'>
            {movesBlack.map((move, index) => (
              <div className='moves-area' key={index}>
                {`${move}`}
              </div>
            ))
            }
          </div>
        </div>
        <div className='moves-button-area'>
          <button onClick={handleMoveBackward}>
            <FontAwesomeIcon icon={faAngleLeft} />
          </button>
          <div className='moves-button-ara'></div>

          <button onClick={playOrStopGame}>
            <FontAwesomeIcon icon={faPlay} />
          </button>

          <div className='moves-button-ara'></div>

          <button onClick={handleMoveForward}>
            <FontAwesomeIcon icon={faAngleRight} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChessBoardPlayArchive;
