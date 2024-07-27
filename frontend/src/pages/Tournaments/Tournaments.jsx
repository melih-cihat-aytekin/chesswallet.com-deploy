import axios from "axios";
import { useEffect, useRef, useState } from "react";
import Cookies from 'js-cookie';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router";
import '../UserHome/UserHome.css'
import '../UserHome/valo_btn.css'
import '../Play/Play.css'
import './Tournaments.css'
import flag_turkey from '../../components/assets/img/flag/flag_turkey.png'
import flag_germany from '../../components/assets/img/flag/flag_germany.png'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons"
import user_home_default_profile_img from '../../components/assets/img/default_user.png'

import { SquareBackground_bos, DarkSquareBackground_ana, LightSquareBackground_ana, DarkSquareBackground_buzlu_deniz, LightSquareBackground_buzlu_deniz } from '../../components/Chess/CustomBoard.js'
import socket from "../../socket.js";
import jwtDecode from 'jwt-decode';
import ChessboardGörsel from "../../components/Chess/ChessboardGörsel.jsx";
import { SERVER_URL } from "../../helper.js";
import tournament_start_sound from '../../components/assets/sounds/tournament_start_sound.mp3'
import { Howl } from 'howler';
import CircularLoader from "../../components/assets/js/loader.jsx";

const Tournaments = () => {
  const [msg, setMsg] = useState('')

  const { tournamentID } = useParams();
  const [pieceTheme, setPieceTheme] = useState('ana')
  const [darkSquareTheme, setDarkSquareTheme] = useState(DarkSquareBackground_ana)
  const [lightSquareTheme, setLightSquareTheme] = useState(LightSquareBackground_ana)
  const [oriantation, setOriantation] = useState('white')

  const navigate = useNavigate()
  const userIdFromCookie = Cookies.get('me');
  const userCountryFromCookie = Cookies.get('Country');
  const [tournamentData, setTournamentData] = useState()
  const [remainingTime, setRemainingTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [TournamentJoinPlayer, setTournamentJoinPlayer] = useState([]);
  const [isTournamentStarted, setIsTournamentStarted] = useState(false);
  const [TournamentFixture, setTournamentFixture] = useState([]);
  const [showTournamentStartedMessage, setShowTournamentStartedMessage] = useState(false);

  const [sound, setSound] = useState(null);

  const [userData, setUserData] = useState();
  const [isDataArrived, setIsDataArrived] = useState(false);

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

  const veri = {
    username: username
  }

  useEffect(() => {
    setToggled(true)
    fetchStatistics()

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
    setSearchFriendName('')
    if (flag === 'Turkey') {
      setCountryPath(flag_turkey)
      // document.querySelector("#popup_bildirim").style.display = "none";
    }
    if (flag === 'Germany') {
      setCountryPath(flag_germany)
    }
  }, [flag])

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
          const fotourl = `${res.data.profileFotoUrl.split('/')[1]}/${res.data.profileFotoUrl.split('/')[2]}`
          console.log("fotourl2 :", fotourl, res.data.profileFotoUrl)
          setProfileImagePath(fotourl)
          setProfileFotoUrl(fotourl)
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

  const playSound = (moveType) => {
    const sound = new Howl({
      src: [moveType]
    });

    sound.play();
    setSound(sound);
  };

  useEffect(() => {
    if (isTournamentStarted) {
      console.log('Fikstür Oluşturuldu:', TournamentFixture);
      socket.emit("play_tournament", (TournamentFixture))
    }
  }, [isTournamentStarted]);

  socket.on('receiveTournamentVeri', (data) => {
    if (data) {
      console.log(data)
      const kendiMacim = kendiMaciniBul(data.updatedData, username);

      if (kendiMacim) {
        console.log("Kendi maçınız:", kendiMacim);
        console.log("Maçınıza yönlendiriliyorsunuz...");
        setTimeout(() => {
          // navigate(`/game/live/${kendiMacim.game_id}`)
        }, 3000);
      } else {
        console.log("Kendi maçınız bulunamadı.");
      }
    } else {

      console.log(data.updatedData)
    }
    // navigate(`/game/live/${data.game_id}`)
  });

  // Turnuva fikstüründe kendi isminizi bulan ve maçı yazan fonksiyon
  function kendiMaciniBul(fikstur, oyuncuAdi) {
    for (const [game, data] of Object.entries(fikstur)) {
      if (data.oyuncu1.username === oyuncuAdi || data.oyuncu2.username === oyuncuAdi) {
        return data;
      }
    }
    return null; // Maç bulunamazsa null döner
  }



  useEffect(() => {
    const fetchAndCheckTournament = async () => {
      await fetchTournament();
      checkTournamentStatus();
    };

    const intervalId = setInterval(fetchAndCheckTournament, 1000);

    return () => clearInterval(intervalId);
  }, [isTournamentStarted, tournamentData?.tournamentDate, TournamentJoinPlayer]);

  const checkTournamentStatus = () => {
    // Sürenin bitip bitmediğini ve turnuvanın başlamış olup olmadığını kontrol et
    const currentTime = new Date().getTime();
    const tournamentStartTime = new Date(tournamentData?.tournamentDate || '').getTime();


    if (currentTime >= tournamentStartTime) {
      // Süre dolduysa fikstür oluştur
      const fixture = fiksturOlustur(TournamentJoinPlayer);

      // Turnuva başladı olarak işaretle
      setIsTournamentStarted(true);
      setShowTournamentStartedMessage(true);
      setTournamentFixture(fixture);
      // İsterseniz başka işlemler de ekleyebilirsiniz
    } else {
      setRemainingTime(calculateRemainingTimeBefore(tournamentData?.tournamentDate));
    }
  };

  useEffect(() => {
    if (remainingTime.days === 0 && remainingTime.hours === 0 && remainingTime.minutes === 0 && remainingTime.seconds === 5) {
      // Buraya 5 saniye kaldığında yapılmasını istediğiniz işlemi ekleyebilirsiniz
      console.log("Turnuvaya sadece 5 saniye kaldı!");
      // Örnek olarak bir uyarı gösterebiliriz
      setMsg("Turnuvaya sadece 5 saniye kaldı!");
      playSound(tournament_start_sound)
    }
    else {
      console.log("başlamadı")
    }
  }, [remainingTime]);


  const calculateRemainingTimeBefore = (tournamentDate) => {
    const targetDate = new Date(tournamentDate || '');
    const currentTime = new Date().getTime();
    const targetTime = targetDate.getTime();
    const timeDifference = targetTime - currentTime;

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const fetchTournament = async () => {
    try {
      const res = await axios.post(`${SERVER_URL}/fetchTournament`, { tournamentID });
      if (res.data.status === "OK") {
        setTournamentData(res.data.results);

        // Veritabanından gelen oyuncu bilgilerini bir diziye kaydet
        const playersJson = res.data.results.JoinPlayer || "[]"; // JoinPlayer boşsa boş dizi olarak kabul et
        const players = JSON.parse(playersJson);

        if (Array.isArray(players)) {
          const sortedPlayers = players.sort((a, b) => b.blitzPuan - a.blitzPuan);
          setTournamentJoinPlayer(sortedPlayers.map(player => ({ id: player.id, username: player.username, puan: player.blitzPuan })));

        } else {
          console.error('Players is not an array:', players);
        }

      }
    } catch (error) {
      console.error('Error fetching tournament:', error);
    }
  };

  const joinTournament = async () => {
    try {
      const res = await axios.post(`${SERVER_URL}/joinTournament`, { tournamentID, username });
      if (res.data.status === "OK") {
        document.querySelector("#tournaments_left_area_üst_info_area_leave_button_button").style.display = "flex";
        document.querySelector("#tournaments_left_area_üst_info_area_katil_button_button").style.display = "none";
        console.log(res.data.msg)
      }
    } catch (error) {
      console.error('Error fetching tournament:', error);
    }
  }

  const leaveTournament = async () => {
    try {
      const res = await axios.post(`${SERVER_URL}/leaveTournament`, { tournamentID, username });
      if (res.data.status === "OK") {
        document.querySelector("#tournaments_left_area_üst_info_area_katil_button_button").style.display = "flex";
        document.querySelector("#tournaments_left_area_üst_info_area_leave_button_button").style.display = "none";
        console.log(res.data.msg)

      }
    } catch (error) {
      console.error('Error fetching tournament:', error);
    }
  }

  function fiksturOlustur(oyuncular) {
    // Oyuncuları puanlarına göre sırala
    oyuncular.sort((a, b) => b.puan - a.puan);

    // Fikstürü oluştur
    const fikstur = [];
    const eşleşmişOyuncular = new Set();

    for (let i = 0; i < oyuncular.length - 1; i++) {
      if (!eşleşmişOyuncular.has(oyuncular[i].id)) {
        for (let j = i + 1; j < oyuncular.length; j++) {
          if (!eşleşmişOyuncular.has(oyuncular[j].id)) {
            const game = {};
            game[`game${fikstur.length + 1}`] = {
              "oyuncu1": oyuncular[i],
              "oyuncu2": oyuncular[j]
            };
            fikstur.push(game);
            eşleşmişOyuncular.add(oyuncular[i].id);
            eşleşmişOyuncular.add(oyuncular[j].id);
            break;
          }
        }
      }
    }

    // Fikstürü düzenle
    const yeniFikstur = {};
    let gameIndex = 1;

    fikstur.forEach(game => {
      const gameKey = Object.keys(game)[0];
      yeniFikstur[`game${gameIndex}`] = game[gameKey];
      gameIndex++;
    });

    return yeniFikstur;
  }


  const OpenSiralama = () => {
    document.querySelector("#tournaments_right_area_üst_sıralama").style.borderBottom = "4px solid #C1C1C0";
    document.querySelector("#tournaments_right_area_üst_oyunlar").style.borderBottom = "0px solid #C1C1C0";
    document.querySelector("#tournaments_right_area_alt_sıralama").style.display = "flex";
    document.querySelector("#tournaments_right_area_alt_oyunlar").style.display = "none";
  }

  const OpenOyunlar = () => {
    document.querySelector("#tournaments_right_area_üst_sıralama").style.borderBottom = "0px solid #C1C1C0";
    document.querySelector("#tournaments_right_area_üst_oyunlar").style.borderBottom = "4px solid #C1C1C0";
    document.querySelector("#tournaments_right_area_alt_sıralama").style.display = "none";
    document.querySelector("#tournaments_right_area_alt_oyunlar").style.display = "flex";
  }



  return (
    <>
      {isLoggedIn ? (
        <>
          {isDataArrived ? (
            <div id="tournaments_all_container">
              <section id="tournaments_left_area">
                <div id="tournaments_left_area_üst">
                  <div id="tournaments_left_area_üst_title_area">
                    <div id="tournaments_left_area_üst_title_area_title">
                      <span>{tournamentData?.tournamentName}</span>
                    </div>

                    <div>
                      {isTournamentStarted ? (
                        <div>
                          <span>Turnuva Başladı</span>
                        </div>
                      ) : (
                        <div id="tournaments_left_area_üst_title_area_sayac">
                          <span className="span-15">Başlamasına</span>
                          <div>
                            <span className='mrgn-t-10 display-flex flex-drc-row span-27'>
                              <span>{remainingTime?.hours}.{remainingTime?.minutes}.{remainingTime?.seconds}</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div id="tournaments_left_area_üst_info_area">
                    <div></div>
                    <div></div>
                    {(TournamentJoinPlayer.map(user => user.username).indexOf(username) !== -1) ? (
                      <div id="tournaments_left_area_üst_info_area_leave_button">
                        <button id="tournaments_left_area_üst_info_area_leave_button_button" onClick={leaveTournament} >Oyundan Ayrıl</button>
                      </div>
                    ) : (
                      <div id="tournaments_left_area_üst_info_area_katil_button">
                        <button id="tournaments_left_area_üst_info_area_katil_button_button" onClick={joinTournament}>KATIL</button>
                      </div>
                    )}

                  </div>
                </div>

                <div id="tournaments_left_area_alt">
                  alt
                </div>
              </section>

              <section id="tournaments_game_board_görsel">
                <ChessboardGörsel />
              </section>

              <section id="tournaments_right_area">
                <div id="tournaments_right_area_üst">
                  <div onClick={OpenSiralama} id="tournaments_right_area_üst_sıralama">Sıralama</div>
                  <div onClick={OpenOyunlar} id="tournaments_right_area_üst_oyunlar">Oyunlar</div>
                </div>

                <div id="tournaments_right_area_alt">
                  <div id="tournaments_right_area_alt_sıralama">
                    {TournamentJoinPlayer.length > 0 ? (
                      TournamentJoinPlayer
                        .slice() // Orijinal diziyi değiştirmemek için kopyasını oluştur
                        .sort((a, b) => b.puan - a.puan) // Puanlarına göre sırala
                        .map((player) => (
                          <div id="tournaments_right_area_alt_sıralama_list" key={player.id}>
                            <span>{player.username} - {player.puan}</span>
                          </div>
                        ))
                    ) : (
                      <div id="tournaments_right_area_alt_sıralama_list">
                        <p>No players joined yet.</p>
                      </div>
                    )}
                  </div>

                  <div id="tournaments_right_area_alt_oyunlar">
                    {/* <div id="tournaments_right_area_alt_oyunlar_list">
              oyunlar
            </div> */}
                    {showTournamentStartedMessage ? (
                      <div id="tournaments_right_area_alt_oyunlar_list">
                        <p>Turnuva başlamadı!</p>
                        {/* <span>1. Maç --- {TournamentFixture[0].oyuncu1?.username} -- {TournamentFixture[0]?.oyuncu2.username}</span>
                <span>2. Maç --- {TournamentFixture[1].oyuncu1?.username} -- {TournamentFixture[1]?.oyuncu2.username}</span> */}
                      </div>
                    ) : (
                      <div id="tournaments_right_area_alt_oyunlar_list">
                        <p>Turnuva başlamadı!</p>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          ) : (
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

export default Tournaments;