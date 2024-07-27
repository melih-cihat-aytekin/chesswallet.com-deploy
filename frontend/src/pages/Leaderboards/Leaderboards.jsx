import React, { useEffect, useState } from 'react'
import axios from "axios";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router";
import '../../components/assets/css/auto.css'
import './Leaderboards.css'
import { useParams } from 'react-router'
import { Across_img, Correct_img, LeftMini, Toggle, Find_lamb, Expand_less, Expand_more, Chess_Board, World } from '../../components/assets/js/icon.jsx';
import { flag_turkey, flag_germany } from '../../components/assets/js/auto_import_flag.js'
import user_home_default_profile_img from '../../components/assets/img/default_user.png'
import blitz_img from '../../components/assets/img/blitz.png'
import rapid_img from '../../components/assets/img/rapid.png'
import ranking_img from '../../components/assets/img/ranking2.png'
import { SERVER_URL } from '../../helper.js';
import socket from "../../socket.js";
import jwtDecode from 'jwt-decode';
import CircularLoader from '../../components/assets/js/loader.jsx';
import { calculateRankingAndPercentile } from './CalculateRanking.js';

function Leaderboards() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [jwtToken, setJwtToken] = useState('');
    const [socket_idim, setSocket_idim] = useState("")
    const [isPremiumUser, setIsPremiumUser] = useState(0)
    const [inMatch, setInMatch] = useState(false);
    const [isDataArrived, setIsDataArrived] = useState(false);
    const [leaderboards, setLeaderboards] = useState({
        blitzLeaderboard: [],
        rapidLeaderboard: [],
    });

    const [toggled, setToggled] = useState(false);
    const [arkaplanDurum, setArkaplanDurum] = useState("dark");

    const [username, setUsername] = useState("")
    const [countryPath, setCountryPath] = useState()
    const [flag, setFlag] = useState()

    const [blitz_elo, setBlitz_elo] = useState()
    const [rapid_elo, setRapid_elo] = useState()

    const [blitz_win, setBlitz_win] = useState()
    const [blitz_lose, setBlitz_lose] = useState()
    const [blitz_draw, setBlitz_draw] = useState()

    const [rapid_win, setRapid_win] = useState()
    const [rapid_lose, setRapid_lose] = useState()
    const [rapid_draw, setRapid_draw] = useState()

    const [toplam_win, setToplam_win] = useState()
    const [toplam_lose, setToplam_lose] = useState()
    const [toplam_draw, setToplam_draw] = useState()

    const [toplam_oyun, setToplam_oyun] = useState()
    const [toplam_bulmaca, setToplam_bulmaca] = useState()
    const [puzzle_elo, setPuzzle_elo] = useState()


    useEffect(() => {
        setIsDataArrived(false)
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
        }
    }, []);

    useEffect(() => {
        if (flag === 'Turkey') {
            setCountryPath(flag_turkey)
            document.querySelector("#popup_bildirim").style.display = 'none';
        }
        if (flag === 'Germany') {
            setCountryPath(flag_germany)
        }
    }, [flag])

    useEffect(() => {
        setToggled(true)
        fetchLeaderboards()
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

    const interval = setInterval(() => {
        fetchStatistics();
        fetchLeaderboards();
    }, 5000);

    useEffect(() => {
        return () => clearInterval(interval);
    }, []);

    function handleLogout() {
        // Çıkış yapıldığında çerezi temizleyin
        Cookies.remove('token');
        setJwtToken('');
        navigate("/login")
    }

    const navigate = useNavigate()

    const veri = {
        username: username
    }

    const fetchInMatch = async () => {
        try {
            const res = await axios.post(`${SERVER_URL}/inMatch`, veri)

            if (res.data.status === 'OK') {

                console.log(res.data.response)

                const inMatch = res.data.inMatch
                const room_id = res.data.room_id
            }
        } catch (error) {
            console.log(error)
        }
    }


    const fetchStatistics = async () => {
        try {
            const res = await axios.post(`${SERVER_URL}/fetchStatistics`, veri)
            console.log(res)

            if (res.data.status === "OK") {
                setBlitz_elo(res.data.blitz_elo)
                setRapid_elo(res.data.rapid_elo)
                setBlitz_win(res.data.blitz_win)
                setBlitz_lose(res.data.blitz_lose)
                setBlitz_draw(res.data.blitz_draw)
                setRapid_win(res.data.rapid_win)
                setRapid_lose(res.data.rapid_lose)
                setRapid_draw(res.data.rapid_draw)
                setToplam_oyun(res.data.toplam_game)
                setToplam_bulmaca(res.data.toplam_bulmaca)
                setPuzzle_elo(res.data.puzzle_elo)
            }


        } catch (error) {
            console.log(error)
        }
    }

    const fetchLeaderboards = async () => {
        try {
            const res = await axios.post(`${SERVER_URL}/fetchLeaderboards`)

            if (res.data.status === "OK") {
                console.log("Liderlere Ulaşıldı...")
                setIsDataArrived(true)
                console.log(res.data)

                // Alınan verileri puana göre sırala
                const blitzLeaderboardSorted = res.data.blitzLeaderboard.sort((a, b) => b.blitz_elo - a.blitz_elo);
                const rapidLeaderboardSorted = res.data.rapidLeaderboard.sort((a, b) => b.rapid_elo - a.rapid_elo);

                // Sıralanmış verileri duruma göre ayarla
                setLeaderboards({
                    blitzLeaderboard: blitzLeaderboardSorted,
                    rapidLeaderboard: rapidLeaderboardSorted
                });

                const playerName = "MagnusGM"; // Oyuncu ismini buraya yazın
                const blitzStats = calculateRankingAndPercentile(blitzLeaderboardSorted, playerName);
                const rapidStats = calculateRankingAndPercentile(rapidLeaderboardSorted, playerName);

                console.log(`Blitz: Sıralama ${blitzStats.rank}, Yüzdelik Dilim ${blitzStats.percentile}%`);
                console.log(`Rapid: Sıralama ${rapidStats.rank}, Yüzdelik Dilim ${rapidStats.percentile}%`);
            } else {
                console.log(res.data)
            }


        } catch (error) {
            console.log(error)
        }
    }



    return (
        <div>
            {isLoggedIn ? (
                <>
                    {isDataArrived ? (
                        <div id='leaderboard-all-con'>
                            <section id='leaderboard-all-con-left'>
                                <div id='leaderboard-left-button' onClick={() => navigate(`/home/${username}`)}>
                                    <LeftMini color={"white"} strokeWidth={'80px'} />
                                </div>
                            </section>

                            <section id='leaderboard-all-con-middle'>
                                <div id='leaderboard-all-con-middle-top'>
                                    <img id='leaderboard-img' src={ranking_img} alt="" />
                                    <span className='span-27 font-weight-700 mrgn-l-10'>Leaderboards</span>
                                </div>

                                <div id='leaderboard-all-con-middle-bottom'>
                                    <section id='leaderboard-all-con-middle-bottom-left'>
                                        <div id='leaderboard-all-con-middle-bottom-left-top'>
                                            <div id='leaderboard-all-con-middle-bottom-left-top-TypeGame'>
                                                <Chess_Board />
                                                <span className='mrgn-l-10'>Tümü</span>
                                                <div id='leaderboard-all-con-middle-bottom-left-top-dropdown-ara'></div>
                                                <Expand_more />
                                            </div>
                                            <div id='leaderboard-all-con-middle-bottom-left-top-ara'></div>
                                            <div id='leaderboard-all-con-middle-bottom-left-top-TypeCountry'>
                                                <World />
                                                <span className='mrgn-l-10'>Global</span>
                                                <div id='leaderboard-all-con-middle-bottom-left-top-dropdown-ara'></div>
                                                <Expand_more />
                                            </div>
                                        </div>


                                        <div id='leaderboard-all-con-middle-bottom-left-bottom'>
                                            <div id='leaderboard-all-con-middle-bottom-left-bottom-blitz'>
                                                <div className='LeaderboardList'>
                                                    <div className='LeaderboardListImg'>
                                                        <img src={blitz_img} alt="" />
                                                        <span>Blitz</span>
                                                    </div>
                                                    <div className='LeaderboardListList'>
                                                        {leaderboards.blitzLeaderboard.slice(0, 5).map((player, index) => (
                                                            <div key={index} className={`leaderboard-item`}>
                                                                <div className={`rank ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''}`}><span>#{index + 1}</span></div>
                                                                <div className={`profilePhoto`}><img src={`${player.profileFotoUrl === null ? user_home_default_profile_img : `${SERVER_URL}/users/${player.username}.png`}`} alt={player.username}></img></div>
                                                                <div className={`name`}><span>{player.username}: {player.blitz_elo}</span></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className='LeaderboardViewAll'>
                                                    <span className='span-18 font-weight-300'>Tamamını Görüntüle</span>
                                                </div>
                                            </div>

                                            <div id='leaderboard-all-con-middle-bottom-left-top-ara'></div>

                                            <div id='leaderboard-all-con-middle-bottom-left-bottom-rapid'>
                                                <div className='LeaderboardList'>
                                                    <div className='LeaderboardListImg'>
                                                        <img src={rapid_img} alt="" />
                                                        <span>Rapid</span>
                                                    </div>
                                                    <div className='LeaderboardListList'>
                                                        {leaderboards.rapidLeaderboard.slice(0, 5).map((player, index) => (
                                                            <div key={index} className={`leaderboard-item`}>
                                                                <div className={`rank ${index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : ''}`}><span>#{index + 1}</span></div>
                                                                <div className={`profilePhoto`}><img src={`${player.profileFotoUrl === null ? user_home_default_profile_img : `${SERVER_URL}/users/${player.username}.png`}`} alt={player.username}></img></div>
                                                                <div className={`name`}><span>{player.username}: {player.rapid_elo}</span></div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className='LeaderboardViewAll'>
                                                    <span className='span-18 font-weight-300'>Tamamını Görüntüle</span>
                                                </div>
                                            </div>
                                        </div>

                                    </section>

                                    <div id='leaderboard-all-con-middle-bottom-ara'></div>

                                    <section id='leaderboard-all-con-middle-bottom-right'>
                                    </section>
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
                <div></div>
            )}
        </div>
    )
}

export default Leaderboards