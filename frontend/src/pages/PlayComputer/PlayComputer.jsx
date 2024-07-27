import axios from "axios";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router";
import '../UserHome/UserHome.css'
import '../UserHome/valo_btn.css'
import '../Play/Play.css'
import './PlayComputer.css'
import flag_turkey from '../../components/assets/img/flag/flag_turkey.png'
import flag_germany from '../../components/assets/img/flag/flag_germany.png'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons"

import socket from "../../socket";
import jwtDecode from "jwt-decode";
import { SERVER_URL } from "../../helper";
import ChessBoardPlayComputer from "../../components/Chess/ChessBoardPlayComputer";

const PlayComputer = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inMatch, setInMatch] = useState(false);
  const [jwtToken, setJwtToken] = useState('');

  // Örnek bir kullanıcı kimliği. Normalde bu, sunucudan alınan gerçek JWT olmalıdır.
  const [username, setUsername] = useState("")
  const [rakip_username, setRakip_username] = useState("")
  const [ComputerForce, setComputerForce] = useState()
  const [countryPath, setCountryPath] = useState()
  const [flag, setFlag] = useState()

  const { game_id_sayisi } = useParams();
  const game_id = game_id_sayisi - 1000000
  // console.log(game_id)
  const [oriantation, setOriantation] = useState('white')

  const navigate = useNavigate()
  const userIdFromCookie = Cookies.get('me');
  const userCountryFromCookie = Cookies.get('Country');

  const [socket_idim, setSocket_idim] = useState("")
  const [gameStart, setGameStart] = useState(false)



  const veri = {
    username: username
  }

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

    setTimeout(() => {
      const veri = {
        username: username,
        socket_id: socket.id
      }
      socket.emit("logged_in", veri)
      setSocket_idim(socket.id)
    }, 500);

  }, [isLoggedIn, username])

  useEffect(() => {
  }, [isLoggedIn])

  setTimeout(() => {
    socket.emit("computer_game_bilgi_istek", game_id, username)
  }, 200);

  socket.on("computer_game_bilgi_cevap", (data) => {
    const value = data.value
    if (value === undefined) {
      return;
    } else {
      if (data.oyun === 'Oyun Veri Tabanında Ekli') {
        // console.log("Ekli")
        navigate(`/game/archive/${game_id + 1000000}`)
      }
      if (data.oyun === "Oyun Hazır") {
        if (value.game_id === 1000000 + game_id) {
          if (value.playerWhite === username) {
            setRakip_username(value.playerBlack)
            const force = value.playerBlack.split(' ');
            setComputerForce(force[1])
            setOriantation("white")
          }
          if (value.playerBlack === username) {
            setRakip_username(value.playerWhite)
            const force = value.playerWhite.split(' ');
            setComputerForce(force[1])
            setOriantation("black")
          }
          setGameStart(true)
          return;
        }
      }
    }
  })

  return (
    <div>
      {isLoggedIn ? (
        <div id="PlayComputerBoardContainer">
          <div className='board-left-area'>
            
          </div>

          <ChessBoardPlayComputer
            username={username}
            rakip_username={rakip_username}
            boardOrientation={oriantation}
            room={game_id_sayisi}
            gameStart={gameStart}
            depth={ComputerForce}
          />
        </div>
      ) : (
        <div>
        </div>
      )}
    </div>
  );
};

export default PlayComputer;