import axios from "axios";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router";
import '../UserHome/UserHome.css'
import '../UserHome/valo_btn.css'
import './GameArchive.css'
import flag_turkey from '../../components/assets/img/flag/flag_turkey.png'
import flag_germany from '../../components/assets/img/flag/flag_germany.png'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons"

import { SquareBackground_bos, DarkSquareBackground_ana, LightSquareBackground_ana, DarkSquareBackground_buzlu_deniz, LightSquareBackground_buzlu_deniz } from '../../components/Chess/CustomBoard.js'
import socket from "../../socket";
import jwtDecode from 'jwt-decode';
import { setDefaultLocale } from "react-datepicker";
import ChessBoardPlayArchive from "../../components/Chess/ChessBoardPlayArchive.jsx";
import ChessAnalyzer from "./ChessAnalyzer.jsx";
import { generatePGN } from "../../components/Chess/chessPGN";


const GameArchive = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [jwtToken, setJwtToken] = useState('');

    // Örnek bir kullanıcı kimliği. Normalde bu, sunucudan alınan gerçek JWT olmalıdır.
    const [username, setUsername] = useState("")
    const [rakip_username, setRakip_username] = useState("")
    const [countryPath, setCountryPath] = useState()
    const [flag, setFlag] = useState()
    const [msg, setMsg] = useState('')
    const [socket_idim, setSocket_idim] = useState("")

    const { game_id_sayisi } = useParams();
    const [pieceTheme, setPieceTheme] = useState('ana')
    const [darkSquareTheme, setDarkSquareTheme] = useState(DarkSquareBackground_ana)
    const [lightSquareTheme, setLightSquareTheme] = useState(LightSquareBackground_ana)
    const [oyunEkli, setOyunEkli] = useState(false)

    const game_id = game_id_sayisi - 1000000
    // console.log(game_id)
    const [oriantation, setOriantation] = useState('white')

    const navigate = useNavigate()
    const userIdFromCookie = Cookies.get('me');
    const userCountryFromCookie = Cookies.get('Country');
    const [userData, setUserData] = useState();
    const [gameData, setGameData] = useState();
    const [pgn, setPgn] = useState();

    useEffect(() => {
        const jwtToken = Cookies.get('token'); // Çerezi al

        if (jwtToken) {
            try {
                // JWT'yi çözümle
                const decodedToken = jwtDecode(jwtToken);

                setUserData(decodedToken);
                setUsername(decodedToken.username)
                setIsLoggedIn(true)

            } catch (error) {
                console.log('JWT Çözümleme Hatası:', error);
            }
        }
    }, []);

    useEffect(() => {

        setTimeout(() => {
            const veri = {
                username: username,
                socket_id: socket.id
            }
            socket.emit("logged_in", veri)
            setSocket_idim(socket.id)
        }, 500);

    }, [isLoggedIn])


    useEffect(() => {
        socket.emit("game_bilgi_istek", game_id)
    }, [])

    socket.on("game_bilgi_cevap", (data) => {
        if (!(data.msg === '')) {
            setMsg(data.msg)
            setOyunEkli(true)
            setGameData(data.value)
            setPgn(generatePGN(data.value))
            // setPgn(`
            //     [Event "Live Chess"]
            //     [Site "Chess.com"]
            //     [Date "2024.04.13"]
            //     [Round "?"]
            //     [White "TournerDans"]
            //     [Black "melih_ytkn"]
            //     [Result "0-1"]
            //     [ECO "B10"]
            //     [WhiteElo "1122"]
            //     [BlackElo "1114"]
            //     [TimeControl "180"]
            //     [EndTime "12:02:45 PDT"]
            //     [Termination "melih_ytkn won by checkmate"]

            //     1. e4 c6 2. Nf3 d5 3. exd5 cxd5 4. Nc3 Nc6 5. d4 Bf5 6. Bb5 e6 7. Ne5 Qc7 8. Bf4
            //     Bd6 9. Qh5 g6 10. Qg5 f6 11. Qh4 fxe5 12. dxe5 Be7 13. Qg3 O-O-O 14. O-O-O d4
            //     15. Na4 Nb4 16. c3 Nxa2+ 17. Kd2 dxc3+ 18. Ke1 Rxd1+ 19. Kxd1 c2+ 20. Ke2 c1=Q
            //     21. Bxc1 Nxc1+ 22. Kf3 Nd3 23. Bxd3 Bxd3 24. Qf4 Qc6+ 25. Kg4 h5+ 26. Kg3 Nf6
            //     27. Rc1 Ne4+ 28. Kh3 Ng5+ 29. Qxg5 Bxg5 30. Rxc6+ bxc6 31. f4 Bxf4 32. Nc3 Bf5+
            //     33. Kh4 g5# 0-1`)
        }
    }, [])




    return (
        <div id="ArchiveContainer">
            {oyunEkli ? (
                <>
                    <ChessAnalyzer pgn={pgn} />

                </>
            ) : (
                <div className="herseyi-ortala">

                </div>
            )}
        </div>
    );
};

export default GameArchive;