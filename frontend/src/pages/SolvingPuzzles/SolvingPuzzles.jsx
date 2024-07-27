import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chessboard } from 'react-chessboard';
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import flag_turkey from '../../components/assets/img/flag/flag_turkey.png';
import flag_germany from '../../components/assets/img/flag/flag_germany.png';
import socket from '../../socket.js';
import { useNavigate } from 'react-router';
import { Chess } from 'chess.js';
import PuzzleInfo from './PuzzleInfo.jsx';
import './SolvingPuzzles.css';
import { SERVER_URL } from '../../helper.js';
import jwtDecode from 'jwt-decode';

function SolvingPuzzles() {
    const { puzzleid } = useParams();
    const navigate = useNavigate();
    const userIdFromCookie = Cookies.get('me');
    const userCountryFromCookie = Cookies.get('Country');

    const [puzzleRating, setPuzzleRating] = useState();
    const [puzzleElo, setPuzzleElo] = useState();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [countryPath, setCountryPath] = useState();

    const [isPuzzleTrue, setIsPuzzleTrue] = useState(0);
    const [isHamleYanlis, setIsHamleYanlis] = useState(0);

    const [ratingDeviation, setRatingDeviation] = useState(0)

    const [fen, setFen] = useState("")


    const [side, setSide] = useState('');

    const [cevap, setCevap] = useState([]);
    const [moves, setMoves] = useState([]);
    // const [chess, setChess] = useState(() => new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"), []);
    const [chess, setChess] = useState(() => new Chess("3rqrk1/bbp2ppn/p6p/1pn1N3/4P3/2P3BP/PPBNQPP1/R3R1K1 w - - 3 19"), []);

    const [puzzleHamleCountHamle, setPuzzleHamleCountHamle] = useState(0);

    useEffect(() => {
        const jwtToken = Cookies.get('token'); // Çerezi al

        if (jwtToken) {
            try {
                // JWT'yi çözümle
                const decodedToken = jwtDecode(jwtToken);
                setUsername(decodedToken.username)
                setIsLoggedIn(true)
            } catch (error) {
                console.log('JWT Çözümleme Hatası:', error);
            }
        } else {
            navigate(`/login`)
        }
    }, [])

    useEffect(() => {
        if (userIdFromCookie) {
            setUsername(userIdFromCookie);
            if (userCountryFromCookie === 'Turkey') {
                setCountryPath(flag_turkey);
            } else if (userCountryFromCookie === 'Germany') {
                setCountryPath(flag_germany);
            }
            setIsLoggedIn(true);
        }

        const veri = {
            username: username
        };

        fetchStatistics();
        setTimeout(() => {
            fetchDataById();
        }, 500);
    }, [isLoggedIn, username]);

    const fetchStatistics = async () => {
        try {
            const res = await axios.post(`${SERVER_URL}/fetchStatistics`, veri);
            console.log("ist : ", res);

            if (res.data.status === "OK") {
                setPuzzleElo(res.data.puzzle_elo);
                console.log(res.data.puzzle_elo);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchDataById = async () => {
        const getPuzzleByID = {
            method: 'GET',
            url: 'https://chess-puzzles.p.rapidapi.com/',
            params: { id: puzzleid },
            headers: {
                'X-RapidAPI-Key': '40748959ecmshee5ae90f1d9ae8fp1679adjsnc33551cb8f94',
                'X-RapidAPI-Host': 'chess-puzzles.p.rapidapi.com'
            }
        };

        try {
            const response = await axios.request(getPuzzleByID);


            console.log(puzzleid)

            // console.log(response.data.puzzles[0].ratingdeviation)

            const sayi = response.data.puzzles[0].ratingdeviation;
            const sonuc = Math.round(sayi / 10);
            setRatingDeviation(sonuc)


            const fen = response.data.puzzles[0].fen;
            setFen(fen)

            const moves = response.data.puzzles[0].moves;
            setMoves(moves);
            setCevap([
                moves[0],
                moves[2],
                moves[4],
            ]);

            var fenParts = fen.split(" ");
            var sideToMove = fenParts[1];

            if (sideToMove === "w") {
                setSide("b");
            } else if (sideToMove === "b") {
                setSide("w");
            } else {
                console.log("Sıra bilgisi geçersizdir veya tanımlanmamıştır.");
            }
            setPuzzleRating(response.data.puzzles[0].rating);

            setChess(new Chess(fen));
            const newChess = new Chess(chess.fen());
            setChess(newChess);

            console.log("fen", fen)

            startGame(moves);
        } catch (error) {
            console.error('API isteği sırasında bir hata oluştu:', error);
        }
    };

    const fetchDataGame = async () => {

        const response = await axios.get('https://chess-puzzles.p.rapidapi.com/', {
            params: {
                themes: '["middlegame","advantage"]',
                rating: 1200,
                themesType: 'ALL',
                playerMoves: '3',
                count: '1',
                count_cevap: '5',
            },
            headers: {
                'X-RapidAPI-Key': '40748959ecmshee5ae90f1d9ae8fp1679adjsnc33551cb8f94',
                'X-RapidAPI-Host': 'chess-puzzles.p.rapidapi.com'
            }
        });

        try {
            console.log("get_game  :", response)
            console.log("sıradaki oyunun feni : ", response.data.puzzles[0].fen)

            setChess(response.data.puzzles[0].fen)

            navigate(`/puzzles/${response.data.puzzles[0].puzzleid}`)

            const sayi = response.data.puzzles[0].ratingdeviation;
            const sonuc = Math.round(sayi / 10);
            setRatingDeviation(sonuc)


            const fen = response.data.puzzles[0].fen;
            setFen(fen)

            const moves = response.data.puzzles[0].moves;
            setMoves(moves);
            setCevap([
                moves[0],
                moves[2],
                moves[4],
            ]);

            var fenParts = fen.split(" ");
            var sideToMove = fenParts[1];

            if (sideToMove === "w") {
                setSide("b");
            } else if (sideToMove === "b") {
                setSide("w");
            } else {
                console.log("Sıra bilgisi geçersizdir veya tanımlanmamıştır.");
            }
            setPuzzleRating(response.data.puzzles[0].rating);

            setChess(new Chess(fen));

            console.log("fen", fen)

            startGame(moves);


        } catch (error) {
            console.error('API isteği sırasında bir hata oluştu:', error);
        }
    };

    const startGame = (moves) => {
        if (moves.length > 0) {
            const nextMove = moves[0];

            // Kaynak ve hedef kareleri ayrıştır
            const sourceSquare = nextMove.substring(0, 2);
            const targetSquare = nextMove.substring(2, 4);

            // Tahtada hamleyi oyna
            chess.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: "q"
            });

            // Tahtayı güncelle
            setChess(new Chess(chess.fen()));

            // Hamle sayısını artır
            setPuzzleHamleCountHamle((puzzleHamleCountHamle) => puzzleHamleCountHamle + 1);
        } else {
            console.log("Hamle yok.");
        }
    }


    const applyNextMove = () => {
        if (cevap.length === 0) {
            return false;
        }

        if (puzzleHamleCountHamle === 1) {
            console.log("count", puzzleHamleCountHamle);
            console.log(cevap);
            const nextMove = cevap[1];

            console.log("cevap : ", nextMove)

            const sourceSquare = nextMove.substring(0, 2);
            const targetSquare = nextMove.substring(2, 4);

            chess.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: "q"
            });

            setChess(new Chess(chess.fen()));
            setPuzzleHamleCountHamle((puzzleHamleCountHamle) => puzzleHamleCountHamle + 2); // Her hamle 2 birim artırılıyor
        }

        if (puzzleHamleCountHamle === 3) {
            console.log("count", puzzleHamleCountHamle);
            console.log(cevap);
            const nextMove = cevap[2];

            console.log("cevap : ", nextMove)

            const sourceSquare = nextMove.substring(0, 2);
            const targetSquare = nextMove.substring(2, 4);

            chess.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: "q"
            });

            setChess(new Chess(chess.fen()));
            setPuzzleHamleCountHamle((puzzleHamleCountHamle) => puzzleHamleCountHamle + 2); // Her hamle 2 birim artırılıyor
        }
    };

    function makeAMove(move) {
        console.log("dsadad", moves[puzzleHamleCountHamle]);
        console.log(`${move.from}${move.to}`);

        if (`${move.from}${move.to}` === moves[puzzleHamleCountHamle]) {
            console.log("hamle doğru");
            console.log(puzzleHamleCountHamle)
            chess.move(move);
            if (puzzleHamleCountHamle === 5) {
                setIsPuzzleTrue(1)
            }

            return true;
        } else {
            console.log("hamle yanlış");
            setIsHamleYanlis(1)
            return false;
        }
    }


    function onDrop(source, target) {
        // console.log(chess.turn(), (side === "w" ? "b" : "w"))
        // if (chess.turn() !== (side === "w" ? "b" : "w")) return false;
        if (chess.turn() !== side) return false;

        const moveData = {
            from: source,
            to: target,
            color: chess.turn(),
            promotion: "q",
        };

        console.log(moveData);

        const move = makeAMove(moveData);

        if (move) {
            setChess(new Chess(chess.fen()));
            applyNextMove();
        }
    }

    const handleHintClick = () => {
        console.log("ipucu")
        changeSquareColor("a1", "red")
    };

    const changeSquareColor = (squareId, color) => {
        console.log(squareId, color)

        // const square = chess.getSquare(squareId);
        // square.style.backgroundColor = color;
    };

    const handleNextPuzzleClick = () => {
        console.log("Next")
        setIsPuzzleTrue(0)
        setIsHamleYanlis(0)
        fetchDataGame()
    };

    const handleReturnClick = () => {
        console.log("Return")
        navigate(`/puzzles/${puzzleid}`)
    };

    return (
        <div className='flex_drc_row w-center h-center solving_puzzle_page'>
            <div className='flex_drc_row'>
                <div>
                    <div>
                        <Chessboard
                            position={chess.fen()}
                            boardOrientation={side === "w" ? "white" : "black"}
                            boardWidth={600}
                            customBoardStyle={{
                                zIndex: '1',
                                position: 'relative',
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                            }}
                            onPieceDrop={onDrop}
                            transitionDuration={500}
                        />
                    </div>
                </div>
            </div>
            <div className='puzzle_info_container'>
                <PuzzleInfo
                    handleHintClick={handleHintClick}
                    handleNextPuzzleClick={handleNextPuzzleClick}
                    handleReturnClick={handleReturnClick}
                    isPuzzleTrue={isPuzzleTrue}
                    isHamleYanlis={isHamleYanlis}
                    side={side}
                    puzzleRating={puzzleRating}
                    moves={[moves]}
                    ratingDeviation={ratingDeviation}
                />
            </div>
        </div>
    );
}

export default SolvingPuzzles;
