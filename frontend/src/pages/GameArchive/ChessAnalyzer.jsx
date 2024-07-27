import React, { useState, useEffect, useRef } from "react";
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import '../../components/Chess/chess.css'
import socket from '../../socket.js';
import { useNavigate } from "react-router";
import { SERVER_URL } from '../../helper.js';
import ProgressBar from "../../components/assets/js/ProgressBar.jsx";
import CustomSquareRenderer from './CustomSquareRenderer.jsx';

import { SquareBackground_bos, DarkSquareBackground_ana, LightSquareBackground_ana, DarkSquareBackground_buzlu_deniz, LightSquareBackground_buzlu_deniz } from '../../components/Chess/CustomBoard.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRectangleXmark, faGear, faAngleLeft, faAngleRight, faMagnifyingGlass, faPlay, faPause, faTurnDown } from "@fortawesome/free-solid-svg-icons"
import { LeftMini } from "../../components/assets/js/icon.jsx";


const ChessAnalyzer = ({ pgn }) => {
    const navigate = useNavigate()
    const [game, setGame] = useState(new Chess());
    const [fen, setFen] = useState(game.fen());
    const [gameHistory, setGameHistory] = useState([]);
    const [history, setHistory] = useState([]);
    const [moveIndex, setMoveIndex] = useState(0);
    const [lastMove, setLastMove] = useState({ from: "", to: "" });
    const [game_over, setGame_over] = useState(false)
    const [playing, setPlaying] = useState(false); // To manage autoplay state
    const playIntervalRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [evaluations, setEvaluations] = useState([]);
    const [pgnIsThere, setPgnIsThere] = useState(false)
    const [pgnInput, setPgnInput] = useState('')

    const [pieceTheme, setPieceTheme] = useState('ana')
    const [darkSquareTheme, setDarkSquareTheme] = useState(DarkSquareBackground_ana)
    const [lightSquareTheme, setLightSquareTheme] = useState(LightSquareBackground_ana)
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [rightClickedSquares, setRightClickedSquares] = useState({});

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


    useEffect(() => {
        const initialGame = new Chess();
        setGame(initialGame);
        setFen(initialGame.fen());
        setHistory([]);
        setMoveIndex(0);
        setLastMove({ from: "", to: "" });

        if (pgn) {
            setPgnIsThere(true)
            initialGame.loadPgn(pgn);
            setGameHistory(initialGame.history({ verbose: true }));
            socket.emit("analysisGame", initialGame.history({ verbose: true }));
            setHistory(initialGame.history({ verbose: true }));
            setFen("start");
        } else {
            setPgnIsThere(false)
        }
    }, [pgn]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "ArrowLeft") {
                handlePrev();
            } else if (event.key === "ArrowRight") {
                handleNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [moveIndex, history]);

    useEffect(() => {
        socket.on('progressAnalysis', (progress) => {
            setProgress(yuvarla(progress));
        });

        socket.on('gameEvaluationResults', (evaluations) => {
            setEvaluations(evaluations);
        });

        return () => {
            socket.off('progressAnalysis');
            socket.off('gameEvaluationResults');
        };
    }, []);


    function yuvarla(sayi) {
        // Sayının küsuratını alın
        var kusurat = sayi - Math.floor(sayi);

        // Küsurat 0.5'ten büyükse yukarı, değilse aşağı yuvarlayın
        if (kusurat >= 0.5) {
            return Math.ceil(sayi);
        } else {
            return Math.floor(sayi);
        }
    }


    const navigateToMove = (index) => {
        const newGame = new Chess();
        let moveDetails = [];

        for (let i = 0; i <= index; i++) {
            const move = history[i];
            if (move) {
                newGame.move(move);
                moveDetails.push({
                    move: move.san,
                    from: move.from,
                    to: move.to,
                    piece: move.piece,
                });
            }
            else {
                console.log("hamle hatalı")
            }
        }

        setGame(newGame);
        setFen(newGame.fen());
        setMoveIndex(index);
        setLastMove({
            from: history[index]?.from || "",
            to: history[index]?.to || "",
        });
        sendFenToServer(newGame.fen());
    };


    const handlePrev = () => {
        if (moveIndex > 0) {
            navigateToMove(moveIndex - 1);
        } else {
            // Reset to the initial position if at the start of the game
            setGame(new Chess());
            setFen(new Chess().fen());
            setMoveIndex(0);
            setLastMove({ from: "", to: "" });
            sendFenToServer(new Chess().fen());
        }
    };

    const handleNext = () => {
        if (moveIndex < history.length - 1) {
            navigateToMove(moveIndex + 1);
        }
    };

    const sendFenToServer = (fen) => {
        socket.emit("evaluateFen", fen);
    };

    socket.on("evaluationResult", (evaluation) => {
        console.log("evaluation : ", evaluation);
    });

    const startPlaying = () => {
        if (playing) return;
        setPlaying(true);

        playIntervalRef.current = setInterval(() => {
            console.log(`Current Move Index: ${moveIndex}`);
            console.log(`History Length: ${history.length}`);

            if (moveIndex < history.length - 1) {
                console.log(moveIndex + 1)
                navigateToMove(moveIndex + 1);
            } else {
                stopPlaying();
            }
        }, 1000);
    };

    const stopPlaying = () => {
        if (playIntervalRef.current) {
            clearInterval(playIntervalRef.current);
            playIntervalRef.current = null;
        }
        setPlaying(false);
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

    const gotoAnalysis = () => {
        navigate("/analysis")
    }

    function onSquareClick() {
        setRightClickedSquares({});
    }

    function onSquareRightClick(square) {
        const colour = '#E47057';
        setRightClickedSquares({
            ...rightClickedSquares,
            [square]:
                rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour
                    ? undefined
                    : { backgroundColor: colour, opacity: 0.8 }
        });
    }

    const getAnalyze = () => {
        const initialGame = new Chess();
        setGame(initialGame);
        setFen(initialGame.fen());
        setHistory([]);
        setMoveIndex(0);
        setLastMove({ from: "", to: "" });

        if (pgnInput) {
            setPgnIsThere(true)
            initialGame.loadPgn(pgnInput);
            setGameHistory(initialGame.history({ verbose: true }));
            socket.emit("analysisGame", initialGame.history({ verbose: true }));
            setHistory(initialGame.history({ verbose: true }));
            setFen("start");
        } else {
            console.log("PGN Hatalı")
        }
    }

    return (
        <>
            <div className='play_sol_section'>
                <div id='play_sol_section_orta'>
                </div>
            </div>
            <div className="board-container-normal">
                <div className="board">
                    <Chessboard
                        position={fen}
                        customDarkSquareStyle={{ backgroundColor: customDarkSquareStyle() }}
                        customLightSquareStyle={{ backgroundColor: customLightSquareStyle() }}
                        customPieces={customPieces()}
                        customSquareRenderer={CustomSquareRenderer}
                        onSquareClick={onSquareClick}
                        onSquareRightClick={onSquareRightClick}
                        customSquareStyles={{
                            ...rightClickedSquares
                        }}
                        squareStyles={selectedSquare ? { [selectedSquare]: { backgroundColor: '#E47057' } } : {}}
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
                </div>

                <div className="board_setting_off">
                    <FontAwesomeIcon onClick={board_setting_on_btn} icon={faGear} />
                </div>

                {/* <div>
                <button onClick={handlePrev} disabled={moveIndex === 0}>
                    Previous
                </button>
                <button onClick={handleNext} disabled={moveIndex === history.length}>
                    Next
                </button>
            </div> */}
            </div>
            <div className='board-istatistik-area'>
                <div className="board-istatistik-area-top-analiz">
                    <div id='AnalysisLeftBtn' onClick={gotoAnalysis}>
                        <LeftMini color={"white"} strokeWidth={'70px'} />
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="analysisMagnifyGlass" />
                        <span className="span-24">Analysis</span>
                    </div>
                </div>

                <div className="analysisContainer">
                    {pgnIsThere ? (
                        <div className="evaluateContainer">
                            <div className="progressSpan">
                                <span>{progress}%</span>
                            </div>
                            <ProgressBar progress={progress} />
                        </div>
                    ) : (
                        <div className="evaluateContainerEnterPgn">
                            <textarea
                                className="analysisPgnInput"
                                placeholder="Enter PGN..."
                                onChange={(e) => setPgnInput(e.target.value)}
                                value={pgnInput}
                                required
                                rows="10"
                                cols="50"
                            />
                            <div className="analysisTurnDown" onClick={getAnalyze}>
                                <FontAwesomeIcon icon={faTurnDown} id="analysisTurnDownIcon" />
                            </div>
                        </div>
                    )}

                    <div className='moves-button-ara'></div>

                    <div className='moves-button-area'>
                        <button onClick={handlePrev} disabled={moveIndex === 0}>
                            <FontAwesomeIcon icon={faAngleLeft} />
                        </button>
                        <div className='movesButtons-ara'></div>

                        {playing ? (<>
                            <button onClick={stopPlaying} disabled={!playing}>
                                <FontAwesomeIcon icon={faPause} />
                            </button>
                        </>) : (<>
                            <button onClick={startPlaying} disabled={playing}>
                                <FontAwesomeIcon icon={faPlay} />
                            </button>
                        </>)}

                        <div className='movesButtons-ara'></div>

                        <button onClick={handleNext} disabled={moveIndex === history.length}>
                            <FontAwesomeIcon icon={faAngleRight} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChessAnalyzer;
