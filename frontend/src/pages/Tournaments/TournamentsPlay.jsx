import axios from "axios";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router";
import '../UserHome/UserHome.css'
import '../UserHome/valo_btn.css'
import '../Play/Play.css'
import flag_turkey from '../../components/assets/img/flag/flag_turkey.png'
import flag_germany from '../../components/assets/img/flag/flag_germany.png'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons"

import { SquareBackground_bos, DarkSquareBackground_ana, LightSquareBackground_ana, DarkSquareBackground_buzlu_deniz, LightSquareBackground_buzlu_deniz } from '../../components/Chess/CustomBoard.js'
import socket from "../../socket.js";
import jwtDecode from 'jwt-decode';
import { setDefaultLocale } from "react-datepicker";
import ChessBoardPlayArchive from "../../components/Chess/ChessBoardPlayArchive.jsx";
import ChessBoardPlayTournaments from "../../components/Chess/ChessBoardPlayTournaments.jsx";


const TournamentsPlay = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [jwtToken, setJwtToken] = useState('');

    // Örnek bir kullanıcı kimliği. Normalde bu, sunucudan alınan gerçek JWT olmalıdır.
    const [username, setUsername] = useState("")
    const [countryPath, setCountryPath] = useState()
    const [flag, setFlag] = useState()
    const [msg, setMsg] = useState('')

    const { tournamentsID } = useParams();
    const { gameID } = useParams();
    const [pieceTheme, setPieceTheme] = useState('ana')
    const [darkSquareTheme, setDarkSquareTheme] = useState(DarkSquareBackground_ana)
    const [lightSquareTheme, setLightSquareTheme] = useState(LightSquareBackground_ana)
    const [oriantation, setOriantation] = useState('white')

    const navigate = useNavigate()
    const userIdFromCookie = Cookies.get('me');
    const userCountryFromCookie = Cookies.get('Country');
    const [userData, setUserData] = useState();

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



    return (
        <div>
            <h1>{username} - - {tournamentsID} - - {gameID}</h1>
            <ChessBoardPlayTournaments 
                boardOrientation = {"white"}
                startGame= {false}
                tournamentID={tournamentsID}
                gameID={gameID}
            />
        </div>
    );
};

export default TournamentsPlay;