import React, { useEffect, useState } from 'react'
import axios from "axios";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router";
import './UserStatistic.css'
import '../../components/assets/css/auto.css'
import { useParams } from 'react-router'

import { SERVER_URL } from '../../helper.js';
import socket from "../../socket.js";
import jwtDecode from 'jwt-decode';
import CircularLoader from '../../components/assets/js/loader.jsx';
import { useSpring, animated } from '@react-spring/web';

import flag_germany from '../../components/assets/img/flag/flag_germany.png'
import flag_turkey from '../../components/assets/img/flag/flag_turkey.png'
import default_profile_img from '../../../images/default-profile-img.jpg'
import diamond from '../../components/assets/img/diamond.png'
import offline_img from '../../components/assets/img/signal-solid.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartPie, faChessBoard, faChessPawn, faEquals, faGlobe, faSignal, faSignOutAlt, faSquareMinus, faSquarePlus } from '@fortawesome/free-solid-svg-icons';
import blitz_img from '../../components/assets/img/blitz.png'
import rapid_img from '../../components/assets/img/rapid.png'
import puzzle_img from '../../components/assets/img/chess_puzzle.svg'
import archive_img from '../../components/assets/img/archive.svg'
import equals_img from '../../components/assets/img/equals-solid.png'
import { calculateStatsByType } from './CalculateGames.js';
import { calculateRankingAndPercentile } from '../Leaderboards/CalculateRanking.js';
import SimpleAreaChart from '../../components/assets/js/PlayerRatingsChartArea.jsx';



function UserStatistic() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isDataArrived, setIsDataArrived] = useState(false);
    const [jwtToken, setJwtToken] = useState('');
    const [socket_idim, setSocket_idim] = useState("")
    const [isPremiumUser, setIsPremiumUser] = useState(0)
    const [inMatch, setInMatch] = useState(false);

    const [username, setUsername] = useState("")
    const [countryPath, setCountryPath] = useState()
    const [flag, setFlag] = useState()
    const [profileFotoUrl, setProfileFotoUrl] = useState(null)
    const [ProfileImagePath, setProfileImagePath] = useState(null);
    const [regDate, setRegDate] = useState('');
    const [isOnline, setIsOnline] = useState(0);
    const [selectedDateType, setSelectedDateType] = useState('Month');
    const [selectedGameType, setSelectedGameType] = useState('Blitz');
    const [monthName, setMonthName] = useState('')
    const [yearName, setYearName] = useState()

    const [gamesArchiveData, setGamesArchiveData] = useState([]);

    const [gamesStats, setGamesStats] = useState({
        Year: {
            Blitz: { wins: 0, losses: 0, draws: 0, totalMatches: 0 },
            Rapid: { wins: 0, losses: 0, draws: 0, totalMatches: 0 },
        },
        Month: {
            Blitz: { wins: 0, losses: 0, draws: 0, totalMatches: 0 },
            Rapid: { wins: 0, losses: 0, draws: 0, totalMatches: 0 },
        },
        Ranking: {
            Blitz: { rank: 0, percentile: 0 },
            Rapid: { rank: 0, percentile: 0 }
        }
    });

    const [toggled, setToggled] = useState(false);
    const [arkaplanDurum, setArkaplanDurum] = useState("dark");

    const [blitz_elo, setBlitz_elo] = useState()
    const [rapid_elo, setRapid_elo] = useState()
    const [toplam_bulmaca, setToplam_bulmaca] = useState()
    const [puzzle_elo, setPuzzle_elo] = useState()

    const [logs, setLogs] = useState([]);

    const [chartOptions, setChartOptions] = useState({
        // Data: Data to be displayed in the chart
        data: [
            { month: 'Jan', avgTemp: 2.3, iceCreamSales: 162000 },
            { month: 'Mar', avgTemp: 6.3, iceCreamSales: 302000 },
            { month: 'May', avgTemp: 16.2, iceCreamSales: 800000 },
            { month: 'Jul', avgTemp: 22.8, iceCreamSales: 1254000 },
            { month: 'Sep', avgTemp: 14.5, iceCreamSales: 950000 },
            { month: 'Nov', avgTemp: 8.9, iceCreamSales: 200000 },
        ],
        // Series: Defines which chart type and data to use
        series: [{ type: 'bar', xKey: 'month', yKey: 'iceCreamSales' }],
    });

    // Animasyon ayarları
    const [animatedStats, setAnimatedStats] = useState({
        totalMatches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
    });

    const props = useSpring({
        totalMatches: gamesStats[selectedDateType][selectedGameType]?.totalMatches || 0,
        wins: gamesStats[selectedDateType][selectedGameType]?.wins || 0,
        draws: gamesStats[selectedDateType][selectedGameType]?.draws || 0,
        losses: gamesStats[selectedDateType][selectedGameType]?.losses || 0,

        from: animatedStats,
        onChange: (values) => setAnimatedStats(values),
        config: {
            mass: 0.2,          // Kütle, animasyonun hızını etkiler
            tension: 125,     // Gerilim, animasyonun geri dönme hızını etkiler
            friction: 70      // Sürtünme, animasyonun yavaşlama hızını etkiler
        }
    });

    useEffect(() => {
        const jwtToken = Cookies.get('token'); // Çerezi al

        if (jwtToken) {
            try {
                // JWT'yi çözümle
                const decodedToken = jwtDecode(jwtToken);

                setUsername(decodedToken.username)

                setIsLoggedIn(true)
                getMonthName()

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
        if (isLoggedIn) {
            setTimeout(() => {
                const veri = {
                    username: username,
                    socket_id: socket.id
                };
                socket.emit('logged_in', veri);
                setSocket_idim(socket.id);
                fetchInMatch();
            }, 500);

            const intervalId = setInterval(() => {
                fetchStatistics();
                fetchGameArchive();
                fetchLeaderboards();
            }, 5000);

            return () => clearInterval(intervalId);
        }
    }, [isLoggedIn, username])

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

    const getMonthName = () => {
        const date = new Date();
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const monthIndex = date.getMonth();
        const monthName = monthNames[monthIndex];
        const year = date.getFullYear();
        console.log(monthName, year)
        setMonthName(monthName)
        setYearName(year)
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
            console.log(isDataArrived, username, isLoggedIn, veri)
            const res = await axios.post(`${SERVER_URL}/fetchStatistics`, veri);
            
            setIsDataArrived(true)
            if (res.data.status === 'OK') {
                setBlitz_elo(res.data.blitz_elo);
                setRapid_elo(res.data.rapid_elo);
                setToplam_bulmaca(res.data.toplam_bulmaca);
                setPuzzle_elo(res.data.puzzle_elo);
                setIsPremiumUser(res.data.isPremiumUser);
                setRegDate(formatDate(res.data.regDate));
                setIsOnline(res.data.isOnline);

                if (res.data.profileFotoUrl === null) {
                    setProfileFotoUrl(default_profile_img);
                } else {
                    setProfileImagePath(res.data.profileFotoUrl);
                    setProfileFotoUrl(res.data.profileFotoUrl);
                }
                if (res.data.country === 'Turkey') {
                    setCountryPath(flag_turkey);
                }
                if (res.data.country === 'Germany') {
                    setCountryPath(flag_germany);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    const fetchLeaderboards = async () => {
        try {
            const res = await axios.post(`${SERVER_URL}/fetchLeaderboards`)

            if (res.data.status === "OK") {
                console.log("Liderlere Ulaşıldı...")

                // Alınan verileri puana göre sırala
                const blitzLeaderboardSorted = res.data.blitzLeaderboard.sort((a, b) => b.blitz_elo - a.blitz_elo);
                const rapidLeaderboardSorted = res.data.rapidLeaderboard.sort((a, b) => b.rapid_elo - a.rapid_elo);

                const blitzStats = calculateRankingAndPercentile(blitzLeaderboardSorted, username);
                const rapidStats = calculateRankingAndPercentile(rapidLeaderboardSorted, username);

                setGamesStats(prevStats => ({
                    ...prevStats,
                    Ranking: {
                        Blitz: { rank: blitzStats.rank, percentile: blitzStats.percentile },
                        Rapid: { rank: rapidStats.rank, percentile: rapidStats.percentile }
                    }
                }));
            } else {
                console.log(res.data)
            }

            const resLog = await axios.post(`${SERVER_URL}/playerRatingLog`, { username })
            if (resLog.data.status === "OK") {
                setLogs(resLog.data);
            } else {
                console.log(resLog.data)
            }


        } catch (error) {
            console.log(error)
        }
    }

    const exampleData = [
        { dateLog: '2024-01-01', blitzPuan: 1200, rapidPuan: 1300 },
        { dateLog: '2024-02-01', blitzPuan: 1250, rapidPuan: 1350 },
        { dateLog: '2024-03-01', blitzPuan: 1220, rapidPuan: 1400 },
        // Daha fazla veri
    ];

    const fetchGameArchive = async () => {
        try {
            const res = await axios.post(`${SERVER_URL}/fetchGameArchiveStatistics`, veri)
            // console.log(res)

            if (res.data.status === 'OK') {
                setGamesArchiveData(res.data)
                const yearStats = calculateStatsByType(res.data.yearGames, username)
                const monthStats = calculateStatsByType(res.data.monthGames, username)

                setGamesStats(prevStats => ({
                    ...prevStats, // Önceki tüm verileri koru
                    Year: yearStats,
                    Month: monthStats,
                }));
            }
        } catch (error) {
            console.log(error)
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    }

    const handleChangeDate = (event) => {
        setSelectedDateType(event.target.value);
    };

    const handleChangeGame = (event) => {
        setSelectedGameType(event.target.value);
    };

    return (
        <>
            {isLoggedIn ? (
                <>
                    {isDataArrived ? (
                        <div className='allContainerStatistics'>
                            <section className='StasTop'>
                                <div className='StasTopPlayer'>
                                    <div className='StasTopPlayerImg'>
                                        {ProfileImagePath === null ? (
                                            <>
                                                <img id='user_home_default_profile_img' src={default_profile_img} alt="" />
                                            </>) : (
                                            <>
                                                <img id='user_home_default_profile_img' src={`${SERVER_URL}/${ProfileImagePath}`} alt="" />
                                            </>)}
                                    </div>
                                    <div className='StasTopPlayerInfo'>
                                        <div className='StasTopPlayerInfoUsername'>
                                            <span>{username}</span>
                                            <img src={countryPath} alt="" className='StasTopPlayerInfoCountry' />
                                            {
                                                isPremiumUser ? (
                                                    <div id="PremiumUser_diamond_img">
                                                        <img src={diamond} alt="" />
                                                    </div>
                                                ) :
                                                    <div></div>
                                            }
                                        </div>
                                        <div className='StasTopPlayerInfoTools'>
                                            <div className='StasTopPlayerInfoToolsItem'>
                                                {isOnline ? (
                                                    <>
                                                        <FontAwesomeIcon icon={faSignal} size="lg" style={{ color: "#939291", }} />
                                                        <span className='span-15'>Online</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <img src={offline_img} alt="" />
                                                        <span className='span-15'>Offline</span>
                                                    </>
                                                )}
                                            </div>
                                            <div className='StasTopPlayerInfoToolsItem'>
                                                <FontAwesomeIcon icon={faChessPawn} size="lg" style={{ color: "#939291", }} />
                                                <span className='span-15'>{regDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='StasTopAra'></div>
                                <div className='StasTopReview'>
                                    <div className='StasTopReviewItem Blitz'>
                                        <img src={blitz_img} alt="" /><span>{blitz_elo}</span>
                                    </div>
                                    <div className='StasTopReviewItem Rapid'>
                                        <img src={rapid_img} alt="" /><span>{rapid_elo}</span>
                                    </div>
                                    <div className='StasTopReviewItem AllMacth'>
                                        <img src={puzzle_img} alt="" /><span>{puzzle_elo}</span>
                                    </div>
                                </div>
                            </section>

                            <section className='StasAlt'>
                                <div className='StasAltTop'>
                                    <div className='StasAltTopImg'>
                                        <img src={archive_img} alt="" />
                                    </div>
                                    <form id="StasAltTopDate">
                                        <div className={`StasAltTopDateSelect ${selectedDateType === 'Month' ? 'DateTypeSelected' : ''}`}>
                                            <label className="label_radioDate">
                                                <input
                                                    type="radio"
                                                    value="Month"
                                                    checked={selectedDateType === 'Month'}
                                                    onChange={handleChangeDate}
                                                />
                                                <div className="StasAltTopDateSelectItem">
                                                    <span>{monthName}</span>
                                                </div>
                                            </label>
                                        </div>
                                        <div className={`StasAltTopDateSelect ${selectedDateType === 'Year' ? 'DateTypeSelected' : ''}`}>
                                            <label className="label_radioDate">
                                                <input
                                                    type="radio"
                                                    value="Year"
                                                    checked={selectedDateType === 'Year'}
                                                    onChange={handleChangeDate}
                                                />
                                                <div className="StasAltTopDateSelectItem">
                                                    <span>{yearName}</span>
                                                </div>
                                            </label>
                                        </div>

                                    </form>
                                </div>

                                <div className='StasAltAlt'>
                                    <form id="StasAltAltGameType">
                                        <div className={`StasAltAltGameTypeSelect ${selectedGameType === 'Blitz' ? 'GameTypeSelected' : ''}`}>
                                            <label className="label_radioGame">
                                                <input
                                                    type="radio"
                                                    value="Blitz"
                                                    checked={selectedGameType === 'Blitz'}
                                                    onChange={handleChangeGame}
                                                />
                                                <div className="StasAltAltGameTypeSelectItem">
                                                    <img src={blitz_img} alt="" />
                                                </div>
                                            </label>
                                        </div>
                                        <div className={`StasAltAltGameTypeSelect ${selectedGameType === 'Rapid' ? 'GameTypeSelected' : ''}`}>
                                            <label className="label_radioGame">
                                                <input
                                                    type="radio"
                                                    value="Rapid"
                                                    checked={selectedGameType === 'Rapid'}
                                                    onChange={handleChangeGame}
                                                />
                                                <div className="StasAltAltGameTypeSelectItem">
                                                    <img src={rapid_img} alt="" />
                                                </div>
                                            </label>
                                        </div>

                                    </form>
                                    <div className='statisticsInfo'>
                                        {/* {selectedGameType === 'Blitz' & selectedDateType === 'Month' ? (
                                            <> */}
                                        <div className='statisticsInfoGamesContainer'>
                                            <div className="statisticsInfoGamesCon">
                                                <div className='statisticsInfoGames'>
                                                    <FontAwesomeIcon icon={faChessBoard} size="2xl" style={{ color: "#C3C2C1", }} />
                                                    <animated.span>{props.totalMatches.to(totalMatch => Math.round(totalMatch))}</animated.span>
                                                    {/* <span>{gamesStats[selectedDateType][selectedGameType].totalMatches} Games</span> */}
                                                </div>
                                                <div className='statisticsInfoAE'>
                                                    <div className='statisticsInfoGames'>
                                                        <FontAwesomeIcon icon={faSquarePlus} size="xl" style={{ color: "#7BAD46", }} />
                                                        {/* <span>{gamesStats[selectedDateType][selectedGameType].wins} Won</span> */}
                                                        <animated.span>{props.wins.to(wins => Math.round(wins))}</animated.span>
                                                    </div>
                                                    <div className='statisticsInfoGames'>
                                                        <img src={equals_img} alt="" />
                                                        <animated.span>{props.draws.to(draw => Math.round(draw))}</animated.span>
                                                        {/* <span>{gamesStats[selectedDateType][selectedGameType].draws} draw</span> */}
                                                    </div>
                                                    <div className='statisticsInfoGames'>
                                                        <FontAwesomeIcon icon={faSquareMinus} size="xl" style={{ color: "#FA412D", }} />
                                                        <animated.span>{props.losses.to(loss => Math.round(loss))}</animated.span>
                                                        {/* <span>{gamesStats[selectedDateType][selectedGameType].losses} Lost</span> */}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="statisticsInfoGamesCon">
                                                <div className='statisticsInfoGames'>
                                                    <FontAwesomeIcon icon={faGlobe} size="lg" style={{ color: "#C3C2C1", }} />
                                                    {/* <animated.span>{props.rank.to(rank => Math.round(rank))}</animated.span> */}
                                                    <span>{gamesStats.Ranking[selectedGameType]?.rank}</span>
                                                </div>
                                                <div className='statisticsInfoGames'>
                                                    <FontAwesomeIcon icon={faChartPie} size="lg" style={{ color: "#C3C2C1", }} />
                                                    {/* <animated.span>{props.percentile.to(percentile => Math.round(percentile))}</animated.span> */}
                                                    <span>{gamesStats.Ranking[selectedGameType]?.percentile}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className='statisticsInfoLineChart'>
                                            <SimpleAreaChart data={logs} gameTypeB={selectedGameType}/>
                                        </div>
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
                <div></div>
            )}
        </>
    )
}

export default UserStatistic