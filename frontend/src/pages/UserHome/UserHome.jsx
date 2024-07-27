import axios from "axios";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router";
import './UserHome.css'
import './valo_btn.css'
import jwtDecode from 'jwt-decode';
import PUBSUB from '../../pubsub.js';

import user_home_default_profile_img from '../../components/assets/img/default_user.png'
import user_home_default_profile_img2 from '../../../images/default_user.png'
import user_default_kare_img from '../../components/assets/img/user_profile_kare_img_melih_ytkn.jpeg'

import flag_turkey from '../../components/assets/img/flag/flag_turkey.png'
import flag_germany from '../../components/assets/img/flag/flag_germany.png'
import user_home_sosyal_arkadaslar from '../../components/assets/img/arkadaslar.png'
import user_home_sosyal_arkadas_ekle from '../../components/assets/img/arkadas_ekle.png'
import user_home_chess_puzzle from '../../components/assets/img/chess_puzzle.svg'
import user_home_computer_img from '../../components/assets/img/computer.svg'
import user_home_istatistik_tv from '../../components/assets/img/statistics_tv.svg'
import ranking_img from '../../components/assets/img/ranking2.png'
import analysis_img from '../../components/assets/img/analysis.png'
import blitz_img from '../../components/assets/img/blitz.png'
import rapid_img from '../../components/assets/img/rapid.png'
import notification_img from '../../components/assets/img/notification.png'
import logout_img from '../../components/assets/img/logout.svg'
import setting_img from '../../components/assets/img/setting.svg'
import person_img from '../../components/assets/img/person.svg'
import person_add_img from '../../components/assets/img/person_add.svg'
import diamond from '../../components/assets/img/diamond.png'
import search_user_img from '../../components/assets/img/search.svg'
import navbar_search_left_arrow from '../../components/assets/img/navbar_search_left_arrow.svg'
import archive_img from '../../components/assets/img/archive.svg'
import equals_img from '../../components/assets/img/equals.svg'
import arti_img from '../../components/assets/img/arti_kare.png'
import eksi_img from '../../components/assets/img/eksi_kare.png'

import socket from "../../socket.js";
import Play from "../Play/Play.jsx";
import ChessBoard from "../../components/Chess/ChessBoardPlay.jsx";
import ChessBoardMiniPuzzle from "../../components/Chess/ChessBoardMiniPuzzle.jsx";
import { Across_img, Correct_img, LeftMini, Toggle, Find_lamb, Expand_less, Expand_more, Chess_Board, World } from '../../components/assets/js/icon.jsx';
import { SERVER_URL } from "../../helper.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChessBoard, faCirclePlus, faRectangleXmark } from "@fortawesome/free-solid-svg-icons";
import Notification from "../../components/assets/js/notification.jsx";
import CircularLoader from "../../components/assets/js/loader.jsx";

const UserHome = () => {

  const [userData, setUserData] = useState();
  const [isDataArrived, setIsDataArrived] = useState(false);
  const [PubSubMessage, setPubSubMessage] = useState("");
  const [selectedGameType, setSelectedGameType] = useState('');

  const [popup_bildirim, setPopup_bildirim] = useState([]);

  const [searchFriendName, setSearchFriendName] = useState('')
  const [searchFriendNameSonucName, setSearchFriendNameSonucName] = useState('')
  const [searchFriendNameSonucCountry, setSearchFriendNameSonucCountry] = useState('')
  const [searchFriendNameSonucCountryPath, setSearchFriendNameSonucCountryPath] = useState('')
  const [searchFriendNameSonucDurum, setSearchFriendNameSonucDurum] = useState('')
  const [searchFriendNameSonucIsOnline, setSearchFriendNameSonucIsOnline] = useState('')

  const [selectFriendProfile, setSelectFriendProfile] = useState({})

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [inMatch, setInMatch] = useState(false);
  const [jwtToken, setJwtToken] = useState('');
  const [toggled, setToggled] = useState(false);
  const [arkaplanDurum, setArkaplanDurum] = useState("dark");

  // Örnek bir kullanıcı kimliği. Normalde bu, sunucudan alınan gerçek JWT olmalıdır.
  const [username, setUsername] = useState("")
  const [profileFotoUrl, setProfileFotoUrl] = useState(null)
  const [countryPath, setCountryPath] = useState()
  const [flag, setFlag] = useState()
  const [wallet_point, setWallet_point] = useState();
  const [oynaMsg, setOynaMsg] = useState('')
  const [sonuc, setSonuc] = useState('')
  const [sistem, setSistem] = useState('')
  const [mac_bulundu, setMac_bulundu] = useState(false)
  const [ProfileImagePath, setProfileImagePath] = useState(null);

  const [puzzleMiniFen, setPuzzleMiniFen] = useState('')
  const [puzzleMiniRating, setPuzzleMiniRating] = useState()
  const [puzzleMiniID, setPuzzleMiniID] = useState('')
  const [puzzleElo, setPuzzleElo] = useState()
  const [blitzPuan, setBlitzPuan] = useState()
  const [rapidPuan, setRapidPuan] = useState()

  const cookies = document.cookie;
  const cookieArray = cookies.split('; ')
  const [notifications, setNotifications] = useState([]);
  const [friends, setFriends] = useState([]);
  const [socket_idim, setSocket_idim] = useState("")
  const [isPremiumUser, setIsPremiumUser] = useState(0)
  const [SelectedArchiveGameType, setSelectedArchiveGameType] = useState('');
  const [SelectedArchiveDate, setSelectedArchiveDate] = useState('');
  const [gamesArchiveData, setGamesArchiveData] = useState([]);
  const [tournamentsData, setTournamentsData] = useState([]);


  useEffect(() => {
    const tokenParams = new URLSearchParams(window.location.search).get('token');
    console.log(tokenParams)
    if (tokenParams) {
      const decoded = jwtDecode(tokenParams);
      Cookies.set('token', tokenParams, { expires: 7 });
      navigate(`/home/${decoded.username}`)
      setUserData(decoded)
      setUsername(decoded.username)
      console.log(1)
    } else {
      const jwtToken = Cookies.get('token'); // Çerezi al

      if (jwtToken) {
        try {
          // JWT'yi çözümle
          const decodedToken = jwtDecode(jwtToken);

          setUserData(decodedToken);
          setUsername(decodedToken.username)

          setIsLoggedIn(true)
          console.log("isloggedin")

        } catch (error) {
          console.log('JWT Çözümleme Hatası:', error);
        }
      } else {
        navigate("/login")
      }
    }
  }, []);

  const veri = {
    username: username
  }

  useEffect(() => {
    setSearchFriendName('')
    if (flag === 'Turkey') {
      setCountryPath(flag_turkey)
      // document.querySelector("#popup_bildirim").style.display = "none";
    }
    if (flag === 'Germany') {
      setCountryPath(flag_germany)
    }
  }, [flag])

  function handleLogout() {
    // Çıkış yapıldığında çerezi temizleyin
    Cookies.remove('token');
    setJwtToken('');
    navigate("/login")
  }

  const navigate = useNavigate()

  useEffect(() => {
    setToggled(true)
    fetchStatistics()
    fetchGameArchive()
    fetchTournaments()

    setTimeout(() => {
      const veri = {
        username: username,
        socket_id: socket.id
      }
      socket.emit("logged_in", veri)
      setSocket_idim(socket.id)
      fetchInMatch()
    }, 500);

    setInterval(() => {
      fetchStatistics()
      fetchGameArchive()
      fetchTournaments()
    }, 5000);


  }, [isLoggedIn])

  useEffect(() => {
    const token = PUBSUB.subscribe('MY_TOPIC', (msg, data) => {
      setPubSubMessage(data);
    });
  }, []);

  const handleClick = () => {
    PUBSUB.publish('MY_TOPIC', 'Merhaba, Subscriber!');
  };

  useEffect(() => {
    fetchInMatch()
  }, [isLoggedIn])

  const fetchInMatch = async () => {
    try {
      const res = await axios.post(`${SERVER_URL}/inMatch`, veri)

      if (res.data.status === 'OK') {

        console.log(res.data.response)

        const inMatch = res.data.inMatch
        const game_id = res.data.game_id

        if (inMatch) {
          setInMatch(1)

          console.log(game_id)

          if (game_id === undefined) {
            navigate(`/home/${username}`)
          } else {
            // navigate(`/game/live/${game_id}`)
          }
        } else {
          navigate(`/home/${username}`)
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchData = async () => {

    // axios.post(`${SERVER_URL}/fetchStatistics`, veri).then(async (res) => {
    //   const puzzle_elo = (res.data.puzzle_elo)

    const response = await axios.get('https://chess-puzzles.p.rapidapi.com/', {
      params: {
        themes: '["middlegame","advantage"]',
        rating: 1200,
        themesType: 'ALL',
        playerMoves: '3',
        count: '1'
      },
      headers: {
        'X-RapidAPI-Key': '40748959ecmshee5ae90f1d9ae8fp1679adjsnc33551cb8f94',
        'X-RapidAPI-Host': 'chess-puzzles.p.rapidapi.com'
      }
    });


    setPuzzleMiniFen(response.data.puzzles[0].fen)
    setPuzzleMiniRating(response.data.puzzles[0].rating)
    setPuzzleMiniID(response.data.puzzles[0].puzzleid)
    // })
  };

  useEffect(() => {
    // fetchData();
  }, [isLoggedIn])



  const logState = () => {
    if (toggled) {
      document.querySelector("#user_home_orta_alt_üst_bulmaca_container").style.backgroundColor = "#272522";
      document.querySelector("#user_home_orta_alt_üst_bulmaca_container_üst_sag_üst span").style.color = "white";
      document.querySelector("#user_home_orta_alt_üst_bulmaca_container_üst_sag_alt span").style.color = "white";

      document.querySelector("#user_home_orta_alt_üst_play_pc_container").style.backgroundColor = "#272522";
      document.querySelector("#user_home_orta_alt_üst_play_pc_container_üst_sag_üst span").style.color = "white";
      document.querySelector("#user_home_orta_alt_üst_play_pc_container_üst_sag_alt span").style.color = "white";

      document.querySelector("#user_home_orta_alt_üst_statistic_container").style.backgroundColor = "#272522";
      document.querySelector("#user_home_orta_alt_üst_statistic_container_üst span").style.color = "white";
      document.querySelector("#user_home_orta_alt_üst_statistic_container_alt_normal_mod_area_üst span").style.color = "white";
      document.querySelector("#user_home_orta_alt_üst_statistic_container_alt_uzun_mod_area_üst span").style.color = "white";
      document.querySelector(".user_statistic_blitz_elo span").style.color = "white";
      document.querySelector(".user_statistic_rapid_elo span").style.color = "white";
      document.querySelector("#blitz_up_down").style.color = "white";
      document.querySelector("#rapid_up_down").style.color = "white";

      setArkaplanDurum("dark")
      setToggled(false)
    } else {
      document.querySelector("#user_home_orta_alt_üst_bulmaca_container").style.backgroundColor = "white";
      document.querySelector("#user_home_orta_alt_üst_bulmaca_container_üst_sag_üst span").style.color = "black";
      document.querySelector("#user_home_orta_alt_üst_bulmaca_container_üst_sag_alt span").style.color = "black";

      document.querySelector("#user_home_orta_alt_üst_play_pc_container").style.backgroundColor = "white";
      document.querySelector("#user_home_orta_alt_üst_play_pc_container_üst_sag_üst span").style.color = "black";
      document.querySelector("#user_home_orta_alt_üst_play_pc_container_üst_sag_alt span").style.color = "black";

      document.querySelector("#user_home_orta_alt_üst_statistic_container").style.backgroundColor = "white";
      document.querySelector("#user_home_orta_alt_üst_statistic_container_üst span").style.color = "black";
      document.querySelector("#user_home_orta_alt_üst_statistic_container_alt_normal_mod_area_üst span").style.color = "black";
      document.querySelector("#user_home_orta_alt_üst_statistic_container_alt_uzun_mod_area_üst span").style.color = "black";
      document.querySelector(".user_statistic_blitz_elo span").style.color = "black";
      document.querySelector(".user_statistic_rapid_elo span").style.color = "black";
      document.querySelector("#blitz_up_down").style.color = "black";
      document.querySelector("#rapid_up_down").style.color = "black";

      setArkaplanDurum("bright")
      setToggled(true)
    }
  };

  const addNotification = (message, type) => {
    document.querySelector("#popup_bildirim").style.display = 'flex';
    const newNotification = { message, type };
    setPopup_bildirim([...notifications, newNotification]);
    setTimeout(() => {
    }, 3000);
  };

  const fetchStatistics = async () => {
    try {
      const res = await axios.post(`${SERVER_URL}/fetchStatistics`, veri)

      if (res.data.status === 'OK') {
        console.log(res.data)

        setBlitzPuan(res.data.blitz_elo)
        setRapidPuan(res.data.rapid_elo)
        setFlag(res.data.country)
        setPuzzleElo(res.data.puzzle_elo)
        setIsPremiumUser(res.data.isPremiumUser)


        if (res.data.profileFotoUrl === null) {
          setProfileFotoUrl(user_home_default_profile_img)
          console.log("fotourl1 :", res.data.profileFotoUrl)
        } else {
          setProfileImagePath(res.data.profileFotoUrl)
          setProfileFotoUrl(res.data.profileFotoUrl)
        }

        const notificationString = res.data.notification

        if (notificationString) {
          const parsedArray = JSON.parse(notificationString);
          setNotifications(parsedArray)
        }

        const friendsString = res.data.friends

        if (friendsString) {
          const parsedArray = JSON.parse(friendsString);
          setFriends(parsedArray)
        }
        const wallet_res = await axios.post(`${SERVER_URL}/fetchWallet`, veri)
        if (res.data.status === 'OK') {
          setWallet_point(wallet_res.data.coins)
        }
        setIsDataArrived(true)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchGameArchive = async () => {
    try {
      const res = await axios.post(`${SERVER_URL}/fetchGameArchive`, veri)
      // console.log(res)

      if (res.data.status === 'OK') {
        setGamesArchiveData(res.data.games)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchTournaments = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/fetchTournaments`)

      if (res.data.status === 'OK') {
        setTournamentsData(res.data.tournaments.filter(turnuva => new Date(turnuva.tournamentDate) > new Date()).sort((a, b) => new Date(a.tournamentDate) - new Date(b.tournamentDate)))
        // console.log(res.data.tournaments.filter(turnuva => new Date(turnuva.tournamentDate) > new Date()).sort((a, b) => new Date(a.tournamentDate) - new Date(b.tournamentDate)))
      }
    } catch (error) {
      console.log(error)
    }
  }

  const formatTournamentDate = (dateString) => {
    const originalDate = new Date(dateString);


    // Tarih bölümünü al
    const day = originalDate.getUTCDate();
    const month = originalDate.getUTCMonth() + 1; // Aylar 0'dan başlar, bu yüzden 1 eklemeliyiz
    const year = originalDate.getUTCFullYear();

    const formattedDate = `${day < 10 ? '0' : ''}${day}/${month < 10 ? '0' : ''}${month}/${year}`;

    return `${formattedDate}`;
  };

  const formatTournamentTime = (timeString) => {
    const originalDate = new Date(timeString);

    // Saat bölümünü al
    const hours = originalDate.getUTCHours();
    const minutes = originalDate.getUTCMinutes();

    const formattedTime = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;

    return `${formattedTime}`;
  };

  const onChangeSearchFriend = async (e) => {
    try {
      setSearchFriendName(e.target.value)
      if (searchFriendName.length > 3) {
        document.querySelector("#navbar_person_search_img").style.display = 'flex';
        document.querySelector("#navbar_person_left_arrow_img").style.display = 'none';
      }
      if (searchFriendName.length < 4) {
        document.querySelector("#navbar_person_search_img").style.display = 'none';
        document.querySelector("#navbar_person_left_arrow_img").style.display = 'flex';
        document.querySelector("#user_home_sag_bar_acik_sosyal_arkadas_ekle_sonuc_area").style.display = 'none';
      }
    } catch (error) {
      console.log(error)
    }
  }

  const addFriendRequestButton = async () => {
    const addFriendRequestVeri = {
      username: username,
      addFriendRequestUsername: searchFriendNameSonucName,
      date: new Date()
    }
    try {
      const response = await axios.post(`${SERVER_URL}/addFriendRequest`, addFriendRequestVeri)
      if (response.data.status === 'OK') {
        console.log(response.data.msg)
        addNotification(`${response.data.msg}`, 'success')
        const jsonString = response.data.notification

        if (jsonString) {
          const parsedArray = JSON.parse(jsonString);
          setNotifications(parsedArray)
        }
      }
      if (response.data.status === 'Error') {
        addNotification(`${response.data.msg}`, 'error')
      }

    } catch (error) {
      console.log(error)
    }
  }

  const friendsMeydanOkumaBtn = async () => {
    addNotification("Meydan Okuma Gönderildi", "success")
    const friendsMeydanOkumaVeri = {
      username: username,
      socket_idim: socket_idim,
      friendsUsername: selectFriendProfile.username,
      date: new Date()
    }
    try {
      const response = await axios.post(`${SERVER_URL}/friendsMeydanOkuma`, friendsMeydanOkumaVeri)
      if (response.data.status === 'OK') {
        console.log(response.data.msg)
      }
      if (response.data.status === 'Error') {
        addNotification(`${response.data.msg}`, 'error')
      }

    } catch (error) {
      console.log(error)
    }
  }


  const DeleteFriendRequestButton = async (id) => {
    const DeleteFriendRequestVeri = {
      username: username,
      addFriendRequestUsername: searchFriendNameSonucName,
      id: id
    }
    try {
      const response = await axios.post(`${SERVER_URL}/deleteFriendRequest`, DeleteFriendRequestVeri)
      if (response.data.status === 'OK') {
        const jsonString = response.data.notification

        if (jsonString) {
          const parsedArray = JSON.parse(jsonString);
          setNotifications(parsedArray)
        }
      } else {
        console.log(response.data)
      }

    } catch (error) {
      console.log(error)
    }
  }

  const acceptFriendRequest = async (id, friendUsername) => {
    console.log(id, friendUsername)
    const acceptFriendRequestVeri = {
      username: username,
      acceptFriendUsername: friendUsername,
      id: id
    }
    try {
      const response = await axios.post(`${SERVER_URL}/acceptFriendRequest`, acceptFriendRequestVeri)
      if (response.data.status === 'OK') {
        setNotifications()  // buraya bak
      } else {
        console.log(response.data)
      }

    } catch (error) {
      console.log(error)
    }
  }


  const fetchSearchFriend = async () => {
    console.log("first")

    axios.post(`${SERVER_URL}/searchFriends`, {
      username: username,
      searchFriendName: searchFriendName,
    }).then((response) => {
      if (response.data.status === 'OK') {
        console.log(response.data)
        document.querySelector("#user_home_sag_bar_acik_sosyal_arkadas_ekle_sonuc_area").style.display = 'flex';
        setSearchFriendNameSonucName(response.data.username)
        setSearchFriendNameSonucDurum(response.data.profileDurum)


        if (response.data.isOnline === 1) {
          setSearchFriendNameSonucIsOnline("Şimdi Çevrimiçi")
        }
        else if (response.data.isOnline === 0) {
          setSearchFriendNameSonucIsOnline("Çevrimdışı")
        }

        if (response.data.country === 'Turkey') {
          setSearchFriendNameSonucCountryPath(flag_turkey)
          setSearchFriendNameSonucCountry('Turkey')
        }
        else if (response.data.country === 'Germany') {
          setSearchFriendNameSonucCountryPath(flag_germany)
          setSearchFriendNameSonucCountry('Germany')
        }
        else {
          null
        }
      }
      if (response.data.status === 'FALSE') {
        document.querySelector("#user_home_sag_bar_acik_sosyal_arkadas_ekle_sonuc_area").style.display = 'flex';
        setSearchFriendNameSonucName(response.data.msg)
        setSearchFriendNameSonucCountryPath()
        setSearchFriendNameSonucCountry('')
      }
    })

  }

  const closeNotificationPage = () => {
    document.querySelector("#user_home_notification_container").style.display = 'none';
    document.querySelector("#user_home_notification_area").style.display = 'none';
  }

  const friendsAreaOpen = async (friendsUsername) => {
    axios.get(`http://localhost:5000/api/deneme`, { friendsUsername }).then((req, res) => {
      console.log(res)
    })
    console.log(friendsUsername)
    try {
      const response = await axios.get(`http://localhost:5000/api/deneme`, { friendsUsername })
      console.log(response.data)
      if (response.data.status === 'OK') {
        console.log(response.data)
        setSelectFriendProfile(
          {
            username: friendsUsername,
            country: response.data.country,
            countryPath: selectFriendProfile.country === 'Turkey' ? flag_turkey : flag_germany,
            blitz_elo: response.data.blitz_elo,
            rapid_elo: response.data.rapid_elo,
            profileDurum: response.data.profileDurum,
            isOnline: response.data.isOnline,
            friends: response.data.friends,
          }
        )
      }

      setInterval(async () => {
        const response = axios.get(`http://localhost:5000/api/deneme`, { friendsUsername })
        if (response.data.status === 'OK') {
          console.log(response.data)
          setSelectFriendProfile(
            {
              username: friendsUsername,
              country: response.data.country,
              countryPath: selectFriendProfile.country === 'Turkey' ? flag_turkey : flag_germany,
              blitz_elo: response.data.blitz_elo,
              rapid_elo: response.data.rapid_elo,
              profileDurum: response.data.profileDurum,
              isOnline: response.data.isOnline,
              friends: response.data.friends,
            }
          )
        }
      }, 2000);
      document.querySelector("#user_home_friend_open_container").style.display = 'flex';
      document.querySelector("#user_home_friend_open_area").style.display = 'flex';
    } catch (error) {
      console.log("error : ", error)
    }
  }

  const openSearchUserPage = () => {
    console.log("aç")
    document.querySelector("#user_home_search_friend_open_area").style.display = 'flex';
    document.querySelector("#user_home_search_friend_open_container").style.display = 'flex';
  }

  const closeSearchUserPage = () => {
    console.log("kapat")
    document.querySelector("#user_home_search_friend_open_area").style.display = 'none';
    document.querySelector("#user_home_search_friend_open_container").style.display = 'none';
    document.querySelector("#user_home_game_type_select_container").style.display = "none";
    setSearchFriendNameSonucName('')
    setSearchFriendName('')
    setSearchFriendNameSonucDurum('')
    setSearchFriendNameSonucCountry('')
    setSearchFriendNameSonucCountryPath()
    setSearchFriendNameSonucIsOnline('')
  }

  const closeFriendUserPage = () => {
    console.log("kapat")
    document.querySelector("#user_home_friend_open_area").style.display = 'none';
  }

  const openNotification = () => {
    document.querySelector("#user_home_notification_container").style.display = 'flex';
    document.querySelector("#user_home_notification_area").style.display = 'flex';
  }


  const user_home_sag_bar_acik_hover = () => {
    // console.log("acik")
    document.querySelector("#user_home_sag_bar_kapali").style.display = 'none';
    document.querySelector("#user_home_sag_bar_acik").style.display = "flex";
  }

  const user_home_sag_bar_kapali_hover = () => {
    // console.log("kapali")
    document.querySelector("#user_home_sag_bar_acik").style.display = "none";
    document.querySelector("#user_home_sag_bar_kapali").style.display = "flex";
  }


  const user_home_sag_bar_acik_araclar_profil = (e) => {
    navigate(`/${username}/profile`)
  }
  const user_home_sag_bar_acik_araclar_ayarlar = (e) => {
    navigate(`/${username}/settings`)
  }
  const user_home_sag_bar_acik_araclar_cüzdan = (e) => {
    navigate(`/${username}/wallet`)
  }

  const play_game_data = {
    username: username,
    gameType: selectedGameType,
    match_request: true
  }


  const oyna_btn = () => {
    document.querySelector("#user_home_game_type_select_container").style.display = "flex";
    document.querySelector("#user_home_game_type_select_open_area").style.display = "flex";
  }

  const playMatch = () => {
    document.querySelector("#user_home_game_type_select_container").style.display = "flex";
    document.querySelector("#user_home_game_type_select_open_area").style.display = "flex";
    document.querySelector(".gameSelectLoading").style.display = 'flex';
    document.querySelector(".gameSelectButton").style.display = 'none'
    socket.emit("play_match", (play_game_data))
    addNotification("Maç Aranıyor...", 'beklemede')
  }


  socket.on('gameStart', (data) => {
    navigate(`/game/live/${data.game_id}`)
  });

  socket.on("logged_in_cevap", (data) => {
    // console.log(data)
  })

  socket.on("meydan_okuma", (data) => {
    if (data) {
      console.log(data)
      addNotification(`Maç İsteği ==> ${data.username}`)
    }
  })

  const solving_puzzles = () => {

    const puzzle_veri = {
      puzzle_id: puzzleMiniID,
      puzzleFEN: puzzleMiniFen,
      puzzleRating: puzzleMiniRating,
      username: username
    }

    navigate(`/puzzles/${puzzleMiniID}`)
    socket.emit("puzzle_bilgi_send", puzzle_veri)
  }

  const play_computer = () => {

    const play_computer_veri = {
      puzzle_id: puzzleMiniID,
      puzzleFEN: puzzleMiniFen,
      puzzleRating: puzzleMiniRating,
      username: username
    }

    navigate(`/play/computer`)
    // socket.emit("puzzle_bilgi_send", play_computer_veri)
  }

  const user_home_friend_open_area_üst_request_game_add_game_hover_on = () => {
    document.querySelector("#user_home_friend_open_area_üst_request_game_add_game").style.border = "1px solid beige";
  }

  const user_home_friend_open_area_üst_request_game_add_game_hover_off = () => {
    document.querySelector("#user_home_friend_open_area_üst_request_game_add_game").style.border = "none";
  }

  const containerHoverOnPuzzle = () => {
    if (arkaplanDurum === "dark") {
      document.querySelector("#user_home_orta_alt_üst_bulmaca_container").style.backgroundColor = "#1e1c19";
    }
    if (arkaplanDurum === "bright") {
      document.querySelector("#user_home_orta_alt_üst_bulmaca_container").style.backgroundColor = "#c2c2c2";
    }
  }

  const containerHoverOffPuzzle = () => {
    if (arkaplanDurum === "bright") {
      document.querySelector("#user_home_orta_alt_üst_bulmaca_container").style.backgroundColor = "white";
    }
    if (arkaplanDurum === "dark") {
      document.querySelector("#user_home_orta_alt_üst_bulmaca_container").style.backgroundColor = "#272522";
    }
  }

  const containerHoverOnPlayPc = () => {
    if (arkaplanDurum === "dark") {
      document.querySelector("#user_home_orta_alt_üst_play_pc_container").style.backgroundColor = "#1e1c19";
    }
    if (arkaplanDurum === "bright") {
      document.querySelector("#user_home_orta_alt_üst_play_pc_container").style.backgroundColor = "#c2c2c2";
    }
  }

  const containerHoverOffPlayPc = () => {
    if (arkaplanDurum === "bright") {
      document.querySelector("#user_home_orta_alt_üst_play_pc_container").style.backgroundColor = "white";
    }
    if (arkaplanDurum === "dark") {
      document.querySelector("#user_home_orta_alt_üst_play_pc_container").style.backgroundColor = "#272522";
    }
  }

  const containerHoverOnStatistic = () => {
    if (arkaplanDurum === "dark") {
      document.querySelector("#user_home_orta_alt_üst_statistic_container").style.backgroundColor = "#1e1c19";
    }
    if (arkaplanDurum === "bright") {
      document.querySelector("#user_home_orta_alt_üst_statistic_container").style.backgroundColor = "#c2c2c2";
    }
  }

  const containerHoverOffStatistic = () => {
    if (arkaplanDurum === "bright") {
      document.querySelector("#user_home_orta_alt_üst_statistic_container").style.backgroundColor = "white";
    }
    if (arkaplanDurum === "dark") {
      document.querySelector("#user_home_orta_alt_üst_statistic_container").style.backgroundColor = "#272522";
    }
  }

  const navigate_statistic = () => {
    navigate(`/statistic/${username}`)
  }

  const getPremium = () => {
    navigate('/premium')
  }

  const handleGameTypeSelect = (event) => {
    setSelectedArchiveGameType(event.target.value);
  }

  const handleArchiveDateSelect = (event) => {
    setSelectedArchiveDate(event.target.value);
  }

  const handleChange = (event) => {
    setSelectedGameType(event.target.value);
    console.log(event.target.value)
  };

  return (
    <>
      {isLoggedIn ? (
        <>
          {isDataArrived ? (
            <div id="user-home-section">
              <section id="user_home_sol_bar">
                <div id="user_home_sol_bar_notification_bar_area">
                  <img src={notification_img} alt="" onClick={openNotification} />
                </div>

                <div id="user_home_sol_bar_ranking_bar_area">
                  <img src={ranking_img} alt="" onClick={() => navigate("/leaderboard")} />
                </div>

                <div id="user_home_sol_bar_analysis_bar_area">
                  <img src={analysis_img} alt="" onClick={() => navigate("/analysis")} />
                </div>

                <div id="user_home_sol_bar_ara"></div>

                <div id="user_home_sol_bar_premium">
                  <img src={diamond} alt="" onClick={getPremium} />
                </div>

                <div id="user_home_sol_bar_setting_bar">
                  <img src={setting_img} alt="" />
                </div>

                <div id="user_home_sol_bar_toggle_switch">
                  <Toggle
                    label=""
                    toggled={toggled}
                    onClick={logState}
                  />
                </div>

              </section>

              <section id="user_home_orta">

                <section id="user_home_orta_top_ana">
                  <div id="user_home_orta_top_btn_ana">
                    <button onClick={oyna_btn} className="btn btn--light ">
                      <span className="btn__inner">
                        <span className="btn__slide"></span>
                        <span className="btn__content">OYNA</span>
                      </span>
                    </button>
                  </div>
                </section>

                <section id="user_home_orta_alt" className="user_home_orta_alt">

                  <div id="user_home_search_friend_open_container">
                    <div id="user_home_search_friend_open_area">
                      <div id="user_home_search_friend_open_area_üst">
                        <div id="user_home_search_friend_open_area_üst_sol">
                          <img id="user_home_search_friend_open_area_üst_profile_img" src={user_default_kare_img} alt="" />
                        </div>
                        <div id="user_home_search_friend_open_area_üst_sag">
                          <div id="user_home_search_friend_open_area_üst_sag_name_area">
                            <span className="span-30">{searchFriendNameSonucName}</span>
                            <img id="user_home_search_friend_open_area_flag" src={searchFriendNameSonucCountryPath} alt="" />
                          </div>
                          <div>
                            <span className="span-18">{searchFriendNameSonucDurum}</span>
                          </div>
                          <div>
                            <span className="span-18">{searchFriendNameSonucIsOnline}</span>
                          </div>
                        </div>

                        <div id="user_home_search_friend_open_area_üst_close">
                          <div id='user_home_search_friend_open_area_üst_close_btn'>
                            <FontAwesomeIcon onClick={closeSearchUserPage} icon={faRectangleXmark} />
                          </div>

                          <div id="user_home_search_friend_open_area_üst_close_ara"></div>

                          <div id="user_home_search_friend_open_area_üst_close_add_friend_btn">
                            <button onClick={addFriendRequestButton}>
                              <div id="user_home_search_friend_open_area_üst_close_add_friend_btn_span">
                                <span>Add</span><br />
                                <span>Friend</span>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="user_home_friend_open_container">
                    <div id="user_home_friend_open_area">
                      <div id="user_home_friend_open_area_üst">
                        <div id="user_home_friend_open_area_üst_sol">
                          <img id="user_home_friend_open_area_üst_profile_img" src={user_default_kare_img} alt="" />
                        </div>
                        <div id="user_home_friend_open_area_üst_sag">
                          <div id="user_home_friend_open_area_üst_sag_üst">
                            <div id="user_home_friend_open_area_üst_sag_name_area">
                              <span className="span-30">{selectFriendProfile.username}</span>
                              <img id="user_home_friend_open_area_flag" src={selectFriendProfile.countryPath} alt="" />
                            </div>
                            <div id="user_home_friend_open_area_üst_sag_durum">
                              <span className="span-18">{selectFriendProfile.profileDurum}</span>
                            </div>
                          </div>

                          <div id="user_home_friend_open_area_üst_sag_alt">
                            <div id="user_home_friend_open_area_üst_sag_alt_isOnline">
                              {selectFriendProfile.isOnline ? (
                                <span className="span-18">Çevrimiçi</span>
                              ) : (
                                <span className="span-18">Çevrimdışı</span>
                              )}
                            </div>

                            <div id="user_home_friend_open_area_üst_sag_alt_friendMatchStatistic">
                              <span className="color-green">5</span>
                              <span className="">/</span>
                              <span className="color-grey">7</span>
                              <span className="">/</span>
                              <span className="color-red">8</span>
                            </div>

                          </div>
                        </div>

                        <div id="user_home_friend_open_area_üst_close">
                          <div id='user_home_friend_open_area_üst_close_btn'>
                            <FontAwesomeIcon onClick={closeFriendUserPage} icon={faRectangleXmark} />
                          </div>

                          <div id="user_home_friend_open_area_üst_close_ara"></div>

                          <div id='user_home_friend_open_area_üst_request_game'>
                            <div id="user_home_friend_open_area_üst_request_game_add_game" onClick={friendsMeydanOkumaBtn} onMouseOver={user_home_friend_open_area_üst_request_game_add_game_hover_on} onMouseOut={user_home_friend_open_area_üst_request_game_add_game_hover_off}>
                              <FontAwesomeIcon id="faChessBoard" icon={faChessBoard} style={{ color: "#ffffff", }} />
                              <span className="mrgn-l-10 span-18 mrgn-r-10">Meydan Oku</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="user_home_notification_container">
                    <div id="user_home_notification_area">
                      {
                        notifications ? notifications.map((notification, index) => {
                          return (
                            <div key={index} id="notification_user_request">

                              <div id="notification_user_request_profil">
                                <img src={user_default_kare_img} alt={notification.username} />
                              </div>

                              <div id="notification_user_request_name">
                                <span className="span-18">{notification.username}</span>
                              </div>

                              <div id="notification_user_request_ara"></div>

                              <div id="notification_user_request_addFriendBtn">
                                <button onClick={() => acceptFriendRequest(notification.id, notification.username)}>
                                  <span>Ekle</span>
                                </button>
                              </div>

                              <div id="notification_user_request_RemoveMsg">
                                <button onClick={() => DeleteFriendRequestButton(notification.id)}>
                                  <span>Sil</span>
                                </button>
                              </div>
                            </div>
                          )
                        }) : <></>
                      }

                      <div id="user_home_notification_close_btn">
                        <FontAwesomeIcon onClick={closeNotificationPage} icon={faRectangleXmark} />
                      </div>
                    </div>
                  </div>

                  <div id="user_home_game_type_select_container">
                    <div id="user_home_game_type_select_open_area">

                      <form id="user_home_game_type_select_open_area_select_area">
                        <div className={`user_home_game_type_select_open_area_select ${selectedGameType === 'Blitz' ? 'GameTypeSelected' : ''}`}>
                          <label className="label_radio">
                            <input
                              type="radio"
                              value="Blitz"
                              checked={selectedGameType === 'Blitz'}
                              onChange={handleChange}
                            />
                            <div className="user_home_game_type_select_open_area_select_item">
                              <img src={blitz_img} alt="Blitz" />
                              <span>Blitz</span>
                            </div>
                          </label>
                        </div>
                        <div className={`user_home_game_type_select_open_area_select ${selectedGameType === 'Rapid' ? 'GameTypeSelected' : ''}`}>
                          <label className="label_radio">
                            <input
                              type="radio"
                              value="Rapid"
                              checked={selectedGameType === 'Rapid'}
                              onChange={handleChange}
                            />
                            <div className="user_home_game_type_select_open_area_select_item">
                              <img src={rapid_img} alt="" />
                              <span>Rapid</span>
                            </div>
                          </label>
                        </div>

                      </form>

                      <div id="user_home_orta_top_btn_ana">
                        <button onClick={playMatch} className="btn btn--light gameSelectButton">
                          <span className="btn__inner">
                            <span className="btn__slide_selectGameType"></span>
                            <span className="btn__content">OYNA</span>
                          </span>
                        </button>
                        <div className="gameSelectLoading chessLoadingContainerGameSelect">
                            <div className="chessLoadingContainer_chess_icon"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="user_home_orta_alt_üst">

                    <div id="user_home_orta_alt_üst_bulmaca_container" onMouseOver={containerHoverOnPuzzle} onMouseOut={containerHoverOffPuzzle} onClick={solving_puzzles}>
                      <div id="user_home_orta_alt_üst_bulmaca_container_üst">
                        <div id="user_home_orta_alt_üst_bulmaca_container_üst_sol">
                          <img src={user_home_chess_puzzle} alt="" />
                        </div>
                        <div id="user_home_orta_alt_üst_bulmaca_container_üst_sag">
                          <div id="user_home_orta_alt_üst_bulmaca_container_üst_sag_üst">
                            <span className="span-27">{puzzleMiniRating}</span>
                          </div>
                          <div id="user_home_orta_alt_üst_bulmaca_container_üst_sag_alt">
                            <span className="span-18">BULMACALAR</span>
                          </div>
                        </div>
                      </div>

                      <div id="user_home_orta_alt_üst_bulmaca_container_alt">
                        <div id="user_home_orta_alt_üst_bulmaca_container_alt_board_con">
                          <ChessBoardMiniPuzzle
                            puzzlePosition={puzzleMiniFen}
                            board_width={200}
                          />
                        </div>
                      </div>
                    </div>

                    <div id="user_home_orta_alt_üst_play_pc_container" onMouseOver={containerHoverOnPlayPc} onMouseOut={containerHoverOffPlayPc} onClick={play_computer}>
                      <div id="user_home_orta_alt_üst_play_pc_container_üst">
                        <div id="user_home_orta_alt_üst_play_pc_container_üst_sol">
                          <img src={user_home_computer_img} alt="" />
                        </div>
                        <div id="user_home_orta_alt_üst_play_pc_container_üst_sag">
                          <div id="user_home_orta_alt_üst_play_pc_container_üst_sag_üst">
                            <span className="span-18">BİLGİSAYAR</span><br />
                          </div>
                          <div id="user_home_orta_alt_üst_play_pc_container_üst_sag_alt">
                            <span className="span-18">İLE OYNA</span>
                          </div>
                        </div>
                      </div>

                      <div id="user_home_orta_alt_üst_play_pc_container_alt">
                        <div id="user_home_orta_alt_üst_play_pc_container_alt_board_con">
                          <ChessBoardMiniPuzzle
                            position="start"
                            board_width={200}
                          />
                        </div>
                      </div>
                    </div>

                    <div id="user_home_orta_alt_üst_statistic_container" onClick={navigate_statistic} onMouseOver={containerHoverOnStatistic} onMouseOut={containerHoverOffStatistic}>
                      <div id="user_home_orta_alt_üst_statistic_container_üst">
                        {/* <img src={user_home_istatistik_tv} alt="" /> */}
                        <span className="span-21">ISTATISTIK</span>
                      </div>

                      <div id="user_home_orta_alt_üst_statistic_container_alt">

                        <div id="user_home_orta_alt_üst_statistic_container_alt_normal_mod_area">
                          <div id="user_home_orta_alt_üst_statistic_container_alt_normal_mod_area_üst">
                            <img src={blitz_img} alt="" /><span className="span-15 mrgn-l-10">Blitz</span>
                          </div>

                          <div id="user_home_orta_alt_üst_statistic_container_alt_normal_mod_area_alt">
                            <div id="user_home_orta_alt_üst_statistic_bilgi_area" className="user_statistic_blitz_elo">
                              <span className="span-27">{blitzPuan}</span>
                              <div className="istatistik_up_down_area" id="blitz_up_down">

                                <img id="statistic_rising_img" src="https://cdn-icons-png.flaticon.com/512/4721/4721635.png" alt="" />
                                <span className="span-12 mrgn-l-5">10</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div id="user_home_orta_alt_üst_statistic_container_alt_uzun_mod_area">
                          <div id="user_home_orta_alt_üst_statistic_container_alt_uzun_mod_area_üst">
                            <img src={rapid_img} alt="" /><span className="span-15 mrgn-l-10">Rapid</span>
                          </div>

                          <div id="user_home_orta_alt_üst_statistic_container_alt_uzun_mod_area_alt">
                            <div id="user_home_orta_alt_üst_statistic_bilgi_area" className="user_statistic_rapid_elo">
                              <span className="span-27">{rapidPuan}</span>
                              <div className="istatistik_up_down_area" id="rapid_up_down">
                                <img id="statistic_rising_img" src="https://cdn-icons-png.flaticon.com/512/4721/4721643.png" alt="" />
                                <span className="span-12 mrgn-l-5">45</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>


                  <div id="user_home_orta_alt_alt">
                    <div id="user_home_orta_alt_alt_games_archive_container">
                      <div id="user_home_orta_alt_alt_games_archive_container_üst">
                        <div id="user_home_orta_alt_alt_games_archive_container_üst_img">
                          <img src={archive_img} alt="" />
                        </div>
                        <div id="user_home_orta_alt_alt_games_archive_container_GameTypeSelect">
                          <select name="country" id="country" onChange={handleGameTypeSelect}>
                            <option value="Select">Blitz</option>
                            <option value="Rapid">Rapid</option>
                            <option value="Classic">Classic</option>
                          </select>
                        </div>
                        <div id="user_home_orta_alt_alt_games_archive_container_DateSelect">
                          <select name="country" id="country" onChange={handleArchiveDateSelect}>
                            <option value="7 Gün">7 Gün</option>
                            <option value="14 Gün">14 Gün</option>
                            <option value="Select">1 Ay</option>
                            <option value="2 Ay">2 Ay</option>
                            <option value="Tüm Zamanlar">Tüm Zamanlar</option>
                          </select>
                        </div>

                        <div id="user_home_sol_bar_ara"></div>

                        <div id="user_home_orta_alt_alt_games_archive_container_MatchStatistic">
                          <span className="color-green">5</span>
                          <span className="">/</span>
                          <span className="color-grey">7</span>
                          <span className="">/</span>
                          <span className="color-red">8</span>
                        </div>
                      </div>

                      <div id="user_home_orta_alt_alt_games_archive_container_alt">
                        {gamesArchiveData.map((game, index) => (
                          <div id="user_home_orta_alt_alt_games_archive_container_alt_games" key={index}>
                            <div id="user_home_orta_alt_alt_games_archive_container_alt_game_type">

                            </div>
                            <div id="user_home_orta_alt_alt_games_archive_container_alt_playersName">
                              <span>{game.white_player_name} </span>
                              <span>{game.black_player_name} </span>
                            </div>
                            <div id="user_home_orta_alt_alt_games_archive_container_alt_gamesResults">
                              <div id="user_home_orta_alt_alt_games_archive_container_alt_gamesResults_point">
                                <span>1</span>
                                <span>0</span>
                              </div>
                              <div id="user_home_orta_alt_alt_games_archive_container_alt_gamesResults_img">
                                {game.results === 1 ? (
                                  <img src={arti_img} alt="" />
                                ) : (game.results === 0 ? (
                                  <>
                                    <img src={eksi_img} alt="" />
                                  </>
                                ) : (
                                  <>
                                    <img src={equals_img} alt="" />
                                  </>
                                ))}
                              </div>
                            </div>
                            <div id='user_home_orta_alt_alt_alt_tournament_list_vievBtn'>
                              <button onClick={() => navigate(`/game/archive/${game.game_id}`)}>
                                <span className='span-21'>İncele</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div id="user_home_orta_alt_alt_ara"></div>

                    <div id="user_home_orta_alt_alt_news_container">
                      <div id="user_home_orta_alt_alt_news_container_title">
                        <h1>News</h1>
                      </div>
                      <div>
                        {PubSubMessage}
                      </div>
                    </div>

                  </div>

                  <div id="user_home_orta_alt_alt_alt">
                    <div id="user_home_orta_alt_alt_alt_tournament_container">
                      <div id="user_home_orta_alt_alt_alt_tournament_container_title">
                        <h1>Tournaments</h1>
                      </div>
                      <div id='user_home_orta_alt_alt_alt_tournament_list'>
                        {
                          tournamentsData.map((tournament, index) => (
                            <div key={index} id='adminpagedown_area_tournaments_list_container'>
                              <div id='user_home_orta_alt_alt_alt_tournament_list_Name'>
                                <span className='span-21'>{tournament.tournamentName}</span>
                              </div>

                              <div id='user_home_orta_alt_alt_alt_tournament_list_Tarih'>
                                <span className='span-21'>{formatTournamentDate(tournament.tournamentDate)}</span>
                              </div>

                              <div id='user_home_orta_alt_alt_alt_tournament_list_Saat'>
                                <span className='span-21'>{formatTournamentTime(tournament.tournamentDate)}</span>
                              </div>

                              <div id='user_home_orta_alt_alt_alt_tournament_list_Duration'>
                                <span className='span-21'>{tournament.tournamentDuration}</span>
                              </div>

                              <div id='user_home_orta_alt_alt_alt_tournament_list_JoinPlayer'>
                                <span className='span-21'>{tournament.JoinPlayerCount}</span>
                              </div>

                              <div id='user_home_orta_alt_alt_alt_tournament_list_vievBtn'>
                                <button onClick={() => navigate(`/tournaments/${tournament.tournamentID}`)}>
                                  <span className='span-21'>İncele</span>
                                </button>
                              </div>
                            </div>
                          ))
                        }

                      </div>
                    </div>
                  </div>
                </section>
              </section>

              <section onMouseOver={user_home_sag_bar_acik_hover} onMouseOut={user_home_sag_bar_kapali_hover} id="user_home_sag_bar">
                <div id="user_home_sag_bar_kapali">
                  <div id="user_home_sag_bar_kapali_profil">
                    {ProfileImagePath === null ? (
                      <>
                        <img id='user_home_default_profile_img' src={user_home_default_profile_img} alt="" />
                      </>) : (
                      <>
                        <img id='user_home_default_profile_img' src={`${SERVER_URL}/${ProfileImagePath}`} alt="" />
                      </>)}
                  </div>
                  <div id="user_home_sag_bar_kapali_ara"></div>
                </div>

                <div id="user_home_sag_bar_acik">
                  <div id="user_home_sag_bar_acik_profil">
                    {ProfileImagePath === null ? (
                      <>
                        <img id='user_home_default_profile_img' src={user_home_default_profile_img} alt="" />
                      </>) : (
                      <>
                        <img id='user_home_default_profile_img' src={`${SERVER_URL}/${ProfileImagePath}`} alt="" />
                      </>)}
                    <div id="user_home_profile_user">
                      <img id="user_home_profile_user_country_flag" src={countryPath} alt="" />
                      <span>{username}</span>
                      {
                        isPremiumUser ? (
                          <div id="PremiumUser_diamond_img">
                            <img src={diamond} alt="" />
                          </div>
                        ) :
                          <div></div>
                      }
                    </div>
                  </div>

                  <div id="user_home_sag_bar_acik_wallet">
                    <div id="user_home_sag_bar_acik_wallet_üst">WALLET</div>
                    <hr />
                    <div id="user_home_sag_bar_acik_wallet_alt">
                      <span id="user_home_sag_bar_acik_wallet_alt_span1">{wallet_point}</span>
                      <span>CP</span>
                    </div>
                  </div>

                  <div id="user_home_sag_bar_acik_araclar">
                    <div id="user_home_sag_bar_acik_araclar_profil">
                      <button onClick={user_home_sag_bar_acik_araclar_profil}><strong>PROFIL</strong></button>
                    </div>

                    <div id="user_home_sag_bar_acik_araclar_ayarlar">
                      <button onClick={user_home_sag_bar_acik_araclar_ayarlar}><strong>AYARLAR</strong></button>
                    </div>

                    <div id="user_home_sag_bar_acik_araclar_wallet">
                      <button onClick={user_home_sag_bar_acik_araclar_cüzdan}><strong>CÜZDAN</strong></button>
                    </div>
                  </div>

                  <div id="user_home_sag_bar_acik_sosyal">
                    <div id="user_home_sag_bar_acik_sosyal_title"><span><strong>SOSYAL</strong></span></div>

                    <div id="user_home_sag_bar_acik_sosyal_arkadas_ekle_area">
                      <img id="navbar_person_add_img" src={person_add_img} alt="" />
                      <input
                        id="user_home_sag_bar_acik_sosyal_arkadas_ekle_input"
                        type="text"
                        autoComplete="on"
                        onChange={(e) => {
                          onChangeSearchFriend(e)
                        }}
                        value={searchFriendName}
                      />
                      <img onClick={fetchSearchFriend} id="navbar_person_search_img" src={search_user_img} alt="" />
                      <img id="navbar_person_left_arrow_img" src={navbar_search_left_arrow} alt="" />
                    </div>
                    <div id="user_home_sag_bar_acik_sosyal_arkadas_ekle_sonuc_area" onClick={openSearchUserPage}>
                      <img id="user_home_profile_user_country_flag" src={searchFriendNameSonucCountryPath} alt="" />
                      <span className="span-21">{searchFriendNameSonucName}</span>
                    </div>

                    <div id="user_home_sag_bar_acik_sosyal_ara"></div>

                    <div id="user_home_sag_bar_acik_sosyal_arkadaslar_area">

                      {
                        friends ? friends.map((friend, index) => {
                          return (
                            <div key={index} id="user_home_sag_bar_acik_sosyal_arkadaslar_list" onClick={() => friendsAreaOpen(friend.friendsUsername)}>

                              <div id="user_home_sag_bar_acik_sosyal_arkadaslar_list_friend_profil">
                                <img src={user_default_kare_img} alt={friend.friendsUsername} />
                              </div>

                              <div id="user_home_sag_bar_acik_sosyal_arkadaslar_list_friend_name">
                                <span className="mrgn-l-10 span-18">{friend.friendsUsername}</span>
                              </div>
                            </div>
                          )
                        }) : <></>
                      }
                    </div>

                  </div>

                  <div id="user_home_sag_bar_acik_logout">
                    <img src={logout_img} alt="" onClick={handleLogout} />
                  </div>
                </div>
              </section>
              <div id="popup_bildirim">
                {popup_bildirim.map((notification, index) => (
                  <Notification key={index} message={notification.message} type={notification.type} />
                ))}
              </div>
            </div >
          ) : (
            // <>hey</>
            <div className='w-center h-center flex_drc_column'>
              <CircularLoader />
              <span className='mrgn-t-20'>Veriler yükleniyor...</span>
            </div>
          )}
        </>
      ) : (
        <div>

        </div>
      )}
    </>
  );
};

export default UserHome;
