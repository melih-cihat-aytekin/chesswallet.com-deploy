import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router";
import '../UserHome/UserHome.css'
import '../UserHome/valo_btn.css'
import '../Play/Play.css'
import './Computer.css'
import '../../components/assets/css/loadingChess.css'
import whiteKing from '../../components/assets/piece/k_w.png'
import blackKing from '../../components/assets/piece/k_b.png'
import flag_turkey from '../../components/assets/img/flag/flag_turkey.png'
import flag_germany from '../../components/assets/img/flag/flag_germany.png'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons"

import { SquareBackground_bos, DarkSquareBackground_ana, LightSquareBackground_ana, DarkSquareBackground_buzlu_deniz, LightSquareBackground_buzlu_deniz } from '../../components/Chess/CustomBoard.js'
import socket from "../../socket.js";
import jwtDecode from 'jwt-decode';
import ChessboardGörsel from "../../components/Chess/ChessboardGörsel.jsx";
import { SERVER_URL } from "../../helper.js";
import { Chessboard } from "react-chessboard";


const Computer = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [jwtToken, setJwtToken] = useState('');

    // Örnek bir kullanıcı kimliği. Normalde bu, sunucudan alınan gerçek JWT olmalıdır.
    const [username, setUsername] = useState("")
    const [countryPath, setCountryPath] = useState()
    const [flag, setFlag] = useState()
    const [msg, setMsg] = useState('')

    const [pieceTheme, setPieceTheme] = useState('ana')
    const [darkSquareTheme, setDarkSquareTheme] = useState(DarkSquareBackground_ana)
    const [lightSquareTheme, setLightSquareTheme] = useState(LightSquareBackground_ana)
    const [oriantation, setOriantation] = useState('white')

    const navigate = useNavigate()
    const userIdFromCookie = Cookies.get('me');
    const userCountryFromCookie = Cookies.get('Country');
    const [userData, setUserData] = useState();

    const [selectedForce, setSelectedForce] = useState('Seviye 1');
    const [selectedSide, setSelectedSide] = useState(null);
    const randomSideImg = 'http://localhost:5000/piece/ana/bwK.png'


    useEffect(() => {
        const jwtToken = Cookies.get('token');

        if (jwtToken) {
            try {
                const decodedToken = jwtDecode(jwtToken);
                setUsername(decodedToken.username);
                setUserData(decodedToken);
                document.querySelector(".chessLoadingContainer").style.display = 'none';
                setIsLoggedIn(true);
            } catch (error) {
                console.log('JWT Çözümleme Hatası:', error);
            }
        }
    }, []);

    const handleForceChange = (event) => {
        setSelectedForce(event.target.value);
    };



    const handleSideChange = (event) => {
        const play_game_data = {
            username: username,
            computerForce: selectedForce,
            side: event.target.value
        }
        setSelectedSide(event.target.value);
        document.querySelector("#computer_right_area_alt_side_area_1").style.display = 'none';
        document.querySelector(".chessLoadingContainer").style.display = 'flex';
        socket.emit("play_match_computer", (play_game_data))
    };

    socket.on('gameStartComputer', (data) => {
        setTimeout(() => {
            navigate(`/play/computer/${data.game_id}`)
        }, 3000);
    });

    const customDarkSquareStyle = () => {
        console.log(darkSquareTheme)
        return darkSquareTheme;
    }

    const customLightSquareStyle = () => {
        return lightSquareTheme;
    }

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

    return (
        <div id="computer_all_container">
            <section id="computer_left_area">
                <div id="computer_left_area_üst">
                    <div id="computer_left_area_üst_title_area">
                        <div id="computer_left_area_üst_title_area_title">
                            <span>Stockfish 1</span>
                        </div>
                    </div>
                </div>

                <div id="computer_left_area_alt">
                    alt
                </div>
            </section>

            <section id="computer_game_board_görsel">
                <ChessboardGörsel />
            </section>

            <section id="computer_right_area">
                <div id="computer_right_area_üst">
                    <span>Seviye Seçin</span>
                </div>

                <div id="computer_right_area_alt">
                    <div id="computer_right_area_alt_force_area">
                        <div id="computer_right_area_alt_force_info_area">
                            {selectedForce === null ? (<></>) : (
                                <span>Stockfish {selectedForce}</span>
                            )}
                        </div>

                        <div id="computer_right_area_alt_force_area_1">
                            <div className="computer_right_area_alt_force_area_radio">
                                <input
                                    type="radio"
                                    value="Seviye 1"
                                    checked={selectedForce === "Seviye 1"}
                                    onChange={handleForceChange}
                                />
                                <span>1</span>
                            </div>
                            <div className="computer_right_area_alt_force_area_radio">
                                <input
                                    type="radio"
                                    value="Seviye 2"
                                    checked={selectedForce === "Seviye 2"}
                                    onChange={handleForceChange}
                                />
                                <span>2</span>
                            </div>
                            <div className="computer_right_area_alt_force_area_radio">
                                <input
                                    type="radio"
                                    value="Seviye 3"
                                    checked={selectedForce === "Seviye 3"}
                                    onChange={handleForceChange}
                                />
                                <span>3</span>
                            </div>
                        </div>

                        <div id="computer_right_area_alt_force_area_2">
                            <div className="computer_right_area_alt_force_area_radio">
                                <input
                                    type="radio"
                                    value="Seviye 4"
                                    checked={selectedForce === "Seviye 4"}
                                    onChange={handleForceChange}
                                />
                                <span>4</span>
                            </div>
                            <div className="computer_right_area_alt_force_area_radio">
                                <input
                                    type="radio"
                                    value="Seviye 5"
                                    checked={selectedForce === "Seviye 5"}
                                    onChange={handleForceChange}
                                />
                                <span>5</span>
                            </div>
                            <div className="computer_right_area_alt_force_area_radio">
                                <input
                                    type="radio"
                                    value="Seviye 6"
                                    checked={selectedForce === "Seviye 6"}
                                    onChange={handleForceChange}
                                />
                                <span>6</span>
                            </div>
                        </div>

                        <div id="computer_right_area_alt_force_area_3">
                            <div className="computer_right_area_alt_force_area_radio">
                                <input
                                    type="radio"
                                    value="Seviye 7"
                                    checked={selectedForce === "Seviye 7"}
                                    onChange={handleForceChange}
                                />
                                <span>7</span>
                            </div>
                            <div className="computer_right_area_alt_force_area_radio">
                                <input
                                    type="radio"
                                    value="Seviye 8"
                                    checked={selectedForce === "Seviye 8"}
                                    onChange={handleForceChange}
                                />
                                <span>8</span>
                            </div>
                            <div className="computer_right_area_alt_force_area_radio">
                                <input
                                    type="radio"
                                    value="Seviye 9"
                                    checked={selectedForce === "Seviye 9"}
                                    onChange={handleForceChange}
                                />
                                <span>9</span>
                            </div>
                        </div>
                    </div>

                    <div id="computer_right_area_alt_side_area">
                        <div id="computer_right_area_alt_side_area_1">

                            <div className="computer_right_area_alt_force_area_radio">
                                <input
                                    type="radio"
                                    value="Siyah"
                                    checked={selectedSide === "Siyah"}
                                    onChange={handleSideChange}
                                />
                                <span>
                                    <img id="computer_right_area_alt_side_area_radio_img_random" src={blackKing} alt="" />
                                </span>
                            </div>

                            <div className="computer_right_area_alt_force_area_radio">
                                <input
                                    type="radio"
                                    value="Rastgele"
                                    checked={selectedSide === "Rastgele"}
                                    onChange={handleSideChange}
                                />
                                <span>
                                    <img id="computer_right_area_alt_side_area_radio_img_random" src={randomSideImg} alt="" />
                                </span>
                            </div>

                            <div className="computer_right_area_alt_force_area_radio">
                                <input
                                    type="radio"
                                    value="Beyaz"
                                    checked={selectedSide === "Beyaz"}
                                    onChange={handleSideChange}
                                />
                                <span>
                                    <img id="computer_right_area_alt_side_area_radio_img_random" src={whiteKing} alt="" />
                                </span>
                            </div>
                        </div>

                        <div className="chessLoadingContainer">
                            <div className="chessLoadingContainer_chess_icon"></div>
                        </div>
                    </div>

                </div>
            </section>
        </div >
    );
};

export default Computer;