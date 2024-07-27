import axios from "axios";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router";
import '../UserHome/UserHome.css'
import '../UserHome/valo_btn.css'
import './Play.css'
import flag_turkey from '../../components/assets/img/flag/flag_turkey.png'
import flag_germany from '../../components/assets/img/flag/flag_germany.png'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons"

import socket from "../../socket";
import ChessBoardPlay from "../../components/Chess/ChessBoardPlay";
import jwtDecode from "jwt-decode";
import { SERVER_URL } from "../../helper";
import PubSub from 'pubsub-js';

const Play = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inMatch, setInMatch] = useState(false);
  const [jwtToken, setJwtToken] = useState('');

  // Örnek bir kullanıcı kimliği. Normalde bu, sunucudan alınan gerçek JWT olmalıdır.
  const [username, setUsername] = useState("")
  const [rakip_username, setRakip_username] = useState("")
  const [countryPath, setCountryPath] = useState()
  const [flag, setFlag] = useState()

  const { game_id_sayisi } = useParams();
  const game_id = game_id_sayisi - 1000000
  // console.log(game_id)
  const [boardOrientation, setBoardOrientation] = useState('white')

  const navigate = useNavigate()
  const userIdFromCookie = Cookies.get('me');
  const userCountryFromCookie = Cookies.get('Country');

  const [socket_idim, setSocket_idim] = useState("")
  const [gameData, setGameData] = useState()

  const [opponentInfo, setOpponentInfo] = useState({
    username: '',
    country: '',
    isPremiumUser: 0,
    normal_mod_puan: 0,
    uzun_mod_puan: 0,
    puzzle_puan: 0,
    toplam_mac_sayisi: 0,
    toplam_normal_mod_mac_sayisi: 0,
    toplam_uzun_mod_mac_sayisi: 0,
    toplam_bulmaca_sayisi: 0,
    win_normal_mod: 0,
    draw_normal_mod: 0,
    lose_normal_mod: 0,
    win_uzun_mod: 0,
    draw_uzun_mod: 0,
    lose_uzun_mod: 0,
    puzzle_elo: 0,
    friends: '',
    profile_durum: '',
    is_online: true,
    inMatch: true,
    notification: '',
    profileFotoUrl: null
  })

  const [MyInfo, setMyInfo] = useState({
    username: '',
    country: '',
    isPremiumUser: 0,
    normal_mod_puan: 0,
    uzun_mod_puan: 0,
    puzzle_puan: 0,
    toplam_mac_sayisi: 0,
    toplam_normal_mod_mac_sayisi: 0,
    toplam_uzun_mod_mac_sayisi: 0,
    toplam_bulmaca_sayisi: 0,
    win_normal_mod: 0,
    draw_normal_mod: 0,
    lose_normal_mod: 0,
    win_uzun_mod: 0,
    draw_uzun_mod: 0,
    lose_uzun_mod: 0,
    puzzle_elo: 0,
    friends: '',
    profile_durum: '',
    is_online: true,
    inMatch: true,
    notification: '',
    profileFotoUrl: null
  })

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
    socket.emit("game_bilgi_istek", game_id, username)

    setTimeout(() => {
      const veri = {
        username: username,
        socket_id: socket.id
      }
      socket.emit("logged_in", veri)
      setSocket_idim(socket.id)
      // socket.emit("game_bilgi_istek", game_id, username)
      // fetchGameStatistics()
      fetchInMatch()
    }, 1000);
    // fetchGameStatistics()
    fetchInMatch()

  }, [isLoggedIn, username])

  const fetchInMatch = async () => {
    try {
      const res = await axios.post(`${SERVER_URL}/inMatch`, veri)

      if (res.data.status === 'OK') {
        const inMatch = res.data.inMatch
        const room_id = res.data.game_id

        if (inMatch) {
          setInMatch(1)

          if (room_id === undefined) {
            navigate(`/home/${username}`)
          } else {
            navigate(`/game/live/${room_id}`)
          }
        } else {
          navigate(`/home/${username}`)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  socket.on("game_bilgi_cevap", (data) => {
    const activeGamesVeri = data.gameData.activeGamesVeri
    if (activeGamesVeri === undefined) {
      console.log("value boş")
      return;
    } else {
      const playerWhite = activeGamesVeri.playerWhite;
      const playerBlack = activeGamesVeri.playerBlack;
      const GameData = data.gameData
      if (playerWhite === username) {
        setBoardOrientation("white");
        setGameData(data.gameData)
        console.log(boardOrientation, data.gameData)

        const channel = `game_${game_id_sayisi}`; // Her oyun için benzersiz kanal
        PubSub.publish(channel, {
          GameData,
        });

      } else if (playerBlack === username) {
        setBoardOrientation("black");
        setGameData(data.gameData)
        console.log(boardOrientation, data.gameData)

        const channel = `game_${game_id_sayisi}`; // Her oyun için benzersiz kanal
        PubSub.publish(channel, {
          GameData,
        });

      } else {
        console.log("oriantation hatalı")
      }
    }
  });


  // setTimeout(() => {
  //   socket.emit("game_bilgi_istek", game_id, username)
  // }, 1000);

  const fetchGameStatistics = async () => {
    try {
      console.log(game_id)
      const res = await axios.post(`${SERVER_URL}/fetchGameStatistics`, { game_id })

      if (res.data.status === 'OK') {
        const beyazPlayer = res.data.beyazVeri[0]
        const siyahPlayer = res.data.siyahVeri[0]

        const beyazVeri = {
          username: beyazPlayer.username,
          country: beyazPlayer.country,
          isPremiumUser: beyazPlayer.isPremiumUser,
          normal_mod_puan: beyazPlayer.normal_mod_puan,
          uzun_mod_puan: beyazPlayer.uzun_mod_puan,
          puzzle_puan: beyazPlayer.puzzle_puan,
          toplam_mac_sayisi: beyazPlayer.toplam_mac_sayisi,
          toplam_normal_mod_mac_sayisi: beyazPlayer.toplam_normal_mod_mac_sayisi,
          toplam_uzun_mod_mac_sayisi: beyazPlayer.toplam_uzun_mod_mac_sayisi,
          toplam_bulmaca_sayisi: beyazPlayer.toplam_bulmaca_sayisi,
          win_normal_mod: beyazPlayer.win_normal_mod,
          draw_normal_mod: beyazPlayer.draw_normal_mod,
          lose_normal_mod: beyazPlayer.lose_normal_mod,
          win_uzun_mod: beyazPlayer.win_uzun_mod,
          draw_uzun_mod: beyazPlayer.draw_uzun_mod,
          lose_uzun_mod: beyazPlayer.lose_uzun_mod,
          puzzle_elo: beyazPlayer.puzzle_elo,
          friends: beyazPlayer.friends,
          profile_durum: beyazPlayer.profile_durum,
          is_online: beyazPlayer.is_online,
          inMatch: beyazPlayer.inMatch,
          notification: beyazPlayer.notification,
          profileFotoUrl: beyazPlayer.profileFotoUrl
        };

        const siyahVeri = {
          username: siyahPlayer.username,
          country: siyahPlayer.country,
          isPremiumUser: siyahPlayer.isPremiumUser,
          normal_mod_puan: siyahPlayer.normal_mod_puan,
          uzun_mod_puan: siyahPlayer.uzun_mod_puan,
          puzzle_puan: siyahPlayer.puzzle_puan,
          toplam_mac_sayisi: siyahPlayer.toplam_mac_sayisi,
          toplam_normal_mod_mac_sayisi: siyahPlayer.toplam_normal_mod_mac_sayisi,
          toplam_uzun_mod_mac_sayisi: siyahPlayer.toplam_uzun_mod_mac_sayisi,
          toplam_bulmaca_sayisi: siyahPlayer.toplam_bulmaca_sayisi,
          win_normal_mod: siyahPlayer.win_normal_mod,
          draw_normal_mod: siyahPlayer.draw_normal_mod,
          lose_normal_mod: siyahPlayer.lose_normal_mod,
          win_uzun_mod: siyahPlayer.win_uzun_mod,
          draw_uzun_mod: siyahPlayer.draw_uzun_mod,
          lose_uzun_mod: siyahPlayer.lose_uzun_mod,
          puzzle_elo: siyahPlayer.puzzle_elo,
          friends: siyahPlayer.friends,
          profile_durum: siyahPlayer.profile_durum,
          is_online: siyahPlayer.is_online,
          inMatch: siyahPlayer.inMatch,
          notification: siyahPlayer.notification,
          profileFotoUrl: siyahPlayer.profileFotoUrl
        };
        console.log(beyazVeri, siyahVeri)
      } else {
        console.log(res.data.status)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      {isLoggedIn ? (
        <div className='PlayContainer'>

          <ChessBoardPlay
            boardOrientation={boardOrientation}
          />
        </div>
      ) : (
        <div>
        </div>
      )}
    </>
  );
};

export default Play;