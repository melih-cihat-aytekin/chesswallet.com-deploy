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
import { faRectangleXmark, faGear, faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons"
import { SERVER_URL } from '../../helper.js';
import axios from "axios";
import { Howl } from 'howler';

import moveSelf_sounds from '../../components/assets/sounds/move-self.mp3'
import capture_sounds from '../../components/assets/sounds/capture.mp3'
import notification_sounds from '../../components/assets/sounds/notify.mp3'
import castle_sounds from '../../components/assets/sounds/castle.mp3'
import moveCheck_sounds from '../../components/assets/sounds/move-check.mp3'
import promote_sounds from '../../components/assets/sounds/promote.mp3'


function ChessBoardPlayComputer({ boardOrientation, username, rakip_username, room, inArchive, gameStart, depth }) {

    console.log(username, rakip_username, room, inArchive, gameStart, depth)
    const navigate = useNavigate()

    const [game, setGame] = useState(() => new Chess(), []);
    const [gameResultMsg, setGameResultMsg] = useState('');
    const { game_id_sayisi } = useParams();
    const game_id = game_id_sayisi - 1000000
    const [fen, setFen] = useState(game.fen());
    const [game_over, setGame_over] = useState(false)

    const [movesWhite, setMovesWhite] = useState([]);
    const [movesBlack, setMovesBlack] = useState([]);

    const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

    const [isWinner, setIsWinner] = useState(1);

    const [pieceTheme, setPieceTheme] = useState('ana')
    const [darkSquareTheme, setDarkSquareTheme] = useState(DarkSquareBackground_ana)
    const [lightSquareTheme, setLightSquareTheme] = useState(LightSquareBackground_ana)
    const [sound, setSound] = useState(null);


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


    const playSound = (moveType) => {
        const sound = new Howl({
            src: [moveType]
        });

        sound.play();
        setSound(sound);
    };

    // const stopSound = () => {
    //     if (sound) {
    //         sound.stop();
    //         setSound(null);
    //     }
    // };


    const makeAMove = useCallback(
        (move) => {
            try {
                const result = game.move(move);

                if (result === null) {
                    // Eğer hamle geçerli değilse, bir hata mesajı ayarla
                    console.error('Invalid move:', move);
                    // veya setGameResultMsg('Invalid move: ' + move);
                } else {
                    console.log(game.turn())
                    console.log("over, checkmate", game.isGameOver(), game.isCheckmate());
                    if (game.isGameOver()) { // check if move led to "game over"
                        if (game.isCheckmate()) { // if reason for game over is a checkmate
                            // Set message to checkmate. 
                            console.log(username, rakip_username)
                            if (game.turn() === 'w' && boardOrientation === 'white') {
                                const winner = 'black'
                                setGameResultMsg(
                                    `${winner} wins!`
                                );
                                console.log(`${winner} wins!`)
                                setGame_over(true)

                            } else {
                                const winner = 'white'
                                setGameResultMsg(
                                    `${winner} wins!`
                                );
                                console.log(`${winner} wins!`)
                                setGame_over(true)
                            }
                            // The winner is determined by checking for which side made the last move
                        } else if (game.isDraw()) { // if it is a draw
                            setGameResultMsg("Draw"); // set message to "Draw"
                            setGame_over(true)
                        } else {
                            setGameResultMsg("Game over");
                            setGame_over(true)
                        }
                    }

                    console.log(move)

                    if (result.captured) {
                        playSound(capture_sounds); // taş kırışma sesi
                    } else if (game.isCheck()) {
                        playSound(moveCheck_sounds); // Şah sesini çal
                    } else if (result.promotion) {
                        playSound(promote_sounds); // piyon terfi sesi
                    }
                    // else if (move.san.includes("0-0") === true) {
                    //     playSound(castle_sounds); // rok sesi
                    // }
                    else {
                        playSound(moveSelf_sounds); // yalın hamle sesi
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

    const makeComputerMove = useCallback(() => {
        if (boardOrientation === 'black' && game.turn() === 'w') {
            // Bilgisayarın hamlesini yapacak
            socket.emit("stockfish", {
                currentFEN: fen,
                depth,
            });
        } else if (boardOrientation === 'white' && game.turn() === 'b') {
            // Bilgisayarın hamlesini yapacak
            socket.emit("stockfish", {
                currentFEN: fen,
                depth,
            });
        }
    }, [fen, depth, game]);

    useEffect(() => {
        if (gameStart) {
            setTimeout(() => {
                makeComputerMove();
            }, 1000);
        }
    }, [gameStart, boardOrientation, makeComputerMove]);

    useEffect(() => {
        socket.on("stockfish_response", (move) => {
            if (game.turn() === "b") {
                setMovesWhite((prevMoves) => [...prevMoves, move]);
            } else {
                setMovesBlack((prevMoves) => [...prevMoves, move]);
            }
            // makeAMove(move);
            try {
                const result = game.move(move);

                if (result === null) {
                    // Eğer hamle geçerli değilse, bir hata mesajı ayarla
                    console.error('Invalid move:', move);
                    // veya setGameResultMsg('Invalid move: ' + move);
                } else {
                    console.log(game.turn())
                    console.log("over, checkmate", game.isGameOver(), game.isCheckmate());
                    if (game.isGameOver()) { // check if move led to "game over"
                        if (game.isCheckmate()) { // if reason for game over is a checkmate
                            // Set message to checkmate. 
                            console.log(username, rakip_username)
                            if (game.turn() === 'w' && boardOrientation === 'white') {
                                const winner = 'black'
                                setGameResultMsg(
                                    `${winner} wins!`
                                );
                                console.log(`${winner} wins!`)
                                setGame_over(true)

                            } else {
                                const winner = 'white'
                                setGameResultMsg(
                                    `${winner} wins!`
                                );
                                console.log(`${winner} wins!`)
                                setGame_over(true)
                            }
                            // The winner is determined by checking for which side made the last move
                        } else if (game.isDraw()) { // if it is a draw
                            setGameResultMsg("Draw"); // set message to "Draw"
                            setGame_over(true)
                        } else {
                            setGameResultMsg("Game over");
                            setGame_over(true)
                        }
                    }

                    console.log(move)

                    if (result.captured) {
                        playSound(capture_sounds); // taş kırışma sesi
                    } else if (game.isCheck()) {
                        playSound(moveCheck_sounds); // Şah sesini çal
                    } else if (result.promotion) {
                        playSound(promote_sounds); // piyon terfi sesi
                    } else if (move.includes("0-0") === true) {
                        playSound(castle_sounds); // rok sesi
                    } else {
                        playSound(moveSelf_sounds); // yalın hamle sesi
                    }
                    setFen(game.fen());
                }

                return result;
            } catch (e) {
                // console.error('An error occurred while making a move:', e);
                return null;
            }
        });

        return () => {
            socket.off("stockfish_response");
        };
    }, [game]);

    useEffect(() => {
        // game_over durumu değiştiğinde, "game_over" event'i emit et
        if (game_over) {
            console.log(movesBlack, movesWhite)
            socket.emit("game_overComputer", {
                room: game_id,
                movesBlack: movesBlack,
                movesWhite: movesWhite,
                result: gameResultMsg,
                computerForce: `Seviye ${depth}`
            });

            setTimeout(() => {
                navigate(`/game/archive/${game_id_sayisi}`)
            }, 5000)
        }
    }, [game_over]);

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

        if (!game.isGameOver()) {
            setTimeout(() => {
                makeComputerMove();
            }, 5000);
        }

        return true;
    }

    // İleri ve geri işlemlerine yönelik event işleyicileri
    const handleMoveForward = () => {
        game.move(movesWhite[currentMoveIndex]);
        game.move(movesBlack[currentMoveIndex]);
        let history = game.history()
        setFen(game.fen(history));
    };

    const handleMoveBackward = () => {
        game.undo();
        let history = game.history()
        setFen(game.fen(history));
    };


    const board_setting_on_btn = () => {
        if (game_over) {
            document.querySelector(".board_setting_on").style.display = 'none';
        } else {
            document.querySelector(".board_setting_on").style.display = 'flex';
        }
    }
    const board_setting_off_btn = () => {
        document.querySelector(".board_setting_on").style.display = 'none';
    }

    return (
        <div className='board-container-normal'>
            <div className='board'>

                <Chessboard
                    position={fen}
                    onPieceDrop={onDrop}
                    arePremovesAllowed={true}
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
                    <div id='game_result_title' className={`${isWinner ? 'game_result_title_winner' : 'game_result_title_loser'}`}>
                        <span className='font-weight-700'>{gameResultMsg}</span>
                    </div>
                    <div>

                    </div>
                    <div>

                    </div>
                    <div>

                    </div>
                </div>
            </div>
            <div className="board_setting_off">
                <FontAwesomeIcon onClick={board_setting_on_btn} icon={faGear} />
            </div>
            <div className='board-istatistik-area'>
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

                <div className='moves-button-ara'></div>

                <div className='moves-button-area'>
                    <button onClick={handleMoveBackward}>
                        <FontAwesomeIcon icon={faAngleLeft} />
                    </button>
                    <div className='movesButtons-ara'></div>

                    <button onClick={handleMoveForward}>
                        <FontAwesomeIcon icon={faAngleRight} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChessBoardPlayComputer;
