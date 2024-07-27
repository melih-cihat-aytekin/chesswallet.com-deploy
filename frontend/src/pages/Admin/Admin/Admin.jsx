import React, { useEffect, useState } from 'react'
import './admin_nav&top.css'
import './admin_page_area.css'
import { useNavigate } from 'react-router'
import { useParams } from 'react-router'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { ADMIN_URL, ADMIN_SERVER_URL } from '../../../helper'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRectangleXmark, faGear, faAngleLeft, faAngleRight, faBell, faCircleHalfStroke, faHouse, faUser } from "@fortawesome/free-solid-svg-icons"
import axios from 'axios';
import admin_tournaments_img from '../../../components/assets/img/admin_img/admin_tournaments_img.svg'
import Notification from '../../../components/assets/js/notification.jsx'

const admin_img = 'https://img.freepik.com/free-icon/settings_318-891486.jpg?t=st=1691678970~exp=1691679570~hmac=aa8e1c3425391645861de1891b45764bf155f04a7c33462af1ff988a30371a72'
const admin_notification_img = 'https://cdn-icons-png.flaticon.com/512/1827/1827347.png'

function Admin() {

    const navigate = useNavigate()
    let { profil } = useParams();

    const [adminname, setAdminname] = useState('')
    const [msg, setMsg] = useState('')

    const [toplam_user, setToplam_user] = useState()

    const [tournaments, setTournaments] = useState([])

    const [tournamentName, setTournamentName] = useState('')
    const [tournamentDate, setTournamentDate] = useState('')
    const [tournamentTime, setTournamentTime] = useState('')
    const [tournamentDuration, setTournamentDuration] = useState()
    const [tournamentPlayer, setTournamentPlayer] = useState()
    const [tournamentViewUrl, setTournamentViewUrl] = useState('')

    const [etkinlikSayisi, setEtkinlikSayisi] = useState()
    const [etkinlik, setEtkinlik] = useState('')

    const [currentTime, setCurrentTime] = useState(new Date());

    const [tournamentData, setTournamentData] = useState({
        tournamentName: '',
        selectedDate: null,
        selectedTime: '',
        tournamentDuration: '30'
    });

    const [notifications, setNotifications] = useState([]);

    const [remainingTime, setRemainingTime] = useState(calculateRemainingTime());

    function sayac() {
        setTimeout(() => {
            const intervalId = setInterval(() => {
                setRemainingTime(calculateRemainingTime());
            }, 1000);

            return () => clearInterval(intervalId);
        }, 500);
    }

    function calculateRemainingTime() {
        const targetDate = new Date(etkinlik.tournamentDate || '')
        const currentTime = new Date().getTime();
        const targetTime = targetDate.getTime();
        const timeDifference = targetTime - currentTime;

        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds };
    }

    const addNotification = (message, type) => {
        const newNotification = { message, type };
        setNotifications([...notifications, newNotification]);
    };

    const handleTournamentNameChange = (event) => {
        setTournamentData({
            ...tournamentData,
            tournamentName: event.target.value
        });
    };

    const handleDateChange = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const formattedDate = `${year}/${month}/${day}`;

        setTournamentData({
            ...tournamentData,
            selectedDate: date,
            formattedSelectedDate: formattedDate
        });
    };

    const handleTimeChange = (event) => {
        setTournamentData({
            ...tournamentData,
            selectedTime: event.target.value
        });
    };

    const handleDurationChange = (event) => {
        setTournamentData({
            ...tournamentData,
            tournamentDuration: event.target.value
        });
    };

    const generateTimeOptions = () => {
        const options = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const formattedHour = hour.toString().padStart(2, '0');
                const formattedMinute = minute.toString().padStart(2, '0');
                options.push(`${formattedHour}:${formattedMinute}`);
            }
        }
        return options;
    };

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

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        if (!(profil === '')) {
            console.log(profil)
        }
        if (profil === 'tournaments') {
            document.getElementById('adminpagedown_area_tournaments').style.display = 'flex';
            document.getElementById('adminpagedown_area_top').style.display = 'none';
        }

        else if (profil === 'top') {
            document.getElementById('adminpagedown_area_top').style.display = 'flex';
            document.getElementById('adminpagedown_area_tournaments').style.display = 'none';
        }
        else {
            document.getElementById('adminpagedown_area_tournaments').style.display = 'none'
            document.getElementById('adminpagedown_area_top').style.display = 'none';
        }

    }, [profil])

    setTimeout(() => {
        fetchInfo()
        fetchTournamentsInfo()
        fetchInfoTop();
    }, 500);

    const fetchInfo = async () => {
        try {
            const res = await axios.get(`${ADMIN_SERVER_URL}/admin_fetch_info`)

            if (res.data.admin_user_isLogged === true) {
                setAdminname(res.data.adminname)
            }


        } catch (error) {
            console.log(error)
        }
    }

    const fetchInfoTop = async () => {
        try {
            const res = await axios.get(`${ADMIN_SERVER_URL}/admin_fetch_top_info`)

            if (res.data.admin_user_isLogged === true) {
                console.log(res.data.result)
                setToplam_user(res.data.result.online_user)
            }


        } catch (error) {
            console.log(error)
        }
    }

    const fetchTournamentsInfo = async () => {
        try {
            const res = await axios.get(`${ADMIN_SERVER_URL}/admin_fetch_tournaments_info`)

            if (res.data.admin_user_isLogged === true) {
                console.log(res.data);

                let dizi = res.data.result;

                // Verileri tarih ve saatine göre sıralama
                dizi.sort((a, b) => new Date(a.tournamentDate) - new Date(b.tournamentDate));

                const currentDate = new Date();
                const currentHour = currentDate.getHours();
                const currentMinute = currentDate.getMinutes();

                // Güncel saat ve tarihten sonraki turnuvaları filtrele
                const upcomingTournaments = dizi.filter(tournament => {
                    const tournamentDate = new Date(tournament.tournamentDate); // "tournamentDate" alanına uygun isim
                    const tournamentHour = tournamentDate.getHours();
                    const tournamentMinute = tournamentDate.getMinutes();

                    if (tournamentDate > currentDate) {
                        return true;
                    } else if (tournamentDate.getDate() === currentDate.getDate() &&
                        tournamentHour > currentHour) {
                        return true;
                    } else if (tournamentDate.getDate() === currentDate.getDate() &&
                        tournamentHour === currentHour && tournamentMinute > currentMinute) {
                        return true;
                    }

                    return false;
                });

                // State güncellemeleri
                setTournaments(upcomingTournaments);
                if (upcomingTournaments.length > 0) {
                    setEtkinlik(upcomingTournaments[0]);
                    console.log(etkinlik)
                    setEtkinlikSayisi(upcomingTournaments.length);
                    sayac();
                }

                document.getElementById('adminpagedown_area_tournaments_list').style.display = 'flex';
                document.getElementById('adminpagedown_area_tournaments_liste_bos').style.display = 'none';
            }

            if (res.data.message === 'Turnuva Yok') {
                document.getElementById('adminpagedown_area_tournaments_list').style.display = 'none';
                document.getElementById('adminpagedown_area_tournaments_liste_bos').style.display = 'flex';
            }

        } catch (error) {
            console.log(error);
        }
    }


    const createTournaments = async () => {
        console.log(tournamentData)
        try {
            const res = await axios.post(`${ADMIN_SERVER_URL}/createTournaments`, tournamentData)

            if (res.data.isCreate === true) {
                console.log(res.data)
                addNotification(res.data.message, 'success')
            }


        } catch (error) {
            console.log(error)
        }
    }

    const goto_admin_home = () => {
        navigate(`/${ADMIN_URL}`)
    }

    const admin_create_tournaments = () => {
        document.getElementById('admin_create_tournaments_area').style.display = 'flex'
        document.getElementById('admin_create_tournaments_container').style.zIndex = '2'
    }

    // const offAdminCreateTournaments = () => {
    //     document.getElementById('admin_create_tournaments_area').style.display = 'none'
    //     document.getElementById('admin_create_tournaments_container').style.zIndex = '-1'
    // }

    const admin_top_left_logo_on = () => {
        document.getElementById('admin_logo').style.width = '41.125px'
        document.getElementById('admin_logo').style.height = '41.125px'
        document.querySelector('#adminpagetop_left_logo span').style.fontSize = '18.75px'
    }

    const admin_top_left_logo_off = () => {
        document.getElementById('admin_logo').style.width = '40px'
        document.getElementById('admin_logo').style.height = '40px'
        document.querySelector('#adminpagetop_left_logo span').style.fontSize = '18px'
    }

    return (
        <div id='adminpage'>
            <section id='admin_create_tournaments_container'>
                <div id='admin_create_tournaments_area' onClick={admin_create_tournaments}>
                    <span className='w-center mrgn-t-10'><h1>Turnuva Oluştur</h1></span>
                    <div id='admin_create_tournaments_area_name'>
                        <label htmlFor="tournament_name">Turnuva Adı : </label>
                        <input
                            type="text"
                            id="tournament_name"
                            name=""
                            value={tournamentData.tournamentName}
                            onChange={handleTournamentNameChange}
                        />
                    </div>
                    <div id='admin_create_tournaments_area_date'>
                        <label htmlFor="tournament_date">Turnuva Tarihi : </label>
                        <div id='admin_create_tournaments_area_calender'>
                            <DatePicker
                                selected={tournamentData.selectedDate}
                                onChange={handleDateChange}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Tarih seçin"
                            />
                        </div>
                        <div id='admin_create_tournaments_area_time'>
                            <select
                                value={tournamentData.selectedTime}
                                onChange={handleTimeChange}
                            >
                                <option value="">Zaman seçin</option>
                                {generateTimeOptions().map((timeOption, index) => (
                                    <option key={index} value={timeOption}>
                                        {timeOption}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div id='admin_create_tournaments_area_uzunluk'>
                        <label htmlFor="tournament_name">Turnuva Süresi : </label>
                        <select
                            name="tournamentDuration"
                            value={tournamentData.tournamentDuration}
                            onChange={handleDurationChange}
                        >
                            <option value="30">30</option>
                            <option value="60">60</option>
                            <option value="90">90</option>
                            <option value="120">120</option>
                            <option value="150">150</option>
                            <option value="180">180</option>
                        </select>
                        <span className='mrgn-l-10'>Dakika</span>
                    </div>
                    <div id='admin_create_tournaments_area_create'>
                        <button onClick={createTournaments}>
                            <span>Oluştur</span>
                        </button>
                    </div>
                </div>
            </section>

            <section id='adminpagetop'>
                <div id='adminpagetop_left_logo' onClick={goto_admin_home} onMouseOver={admin_top_left_logo_on} onMouseOut={admin_top_left_logo_off}>
                    <img id='admin_logo' src={admin_img} alt="" />
                    <span className='mrgn-l-10 span-18'>chessadmin</span>
                </div>

                <div id='adminpagetop_ara'>
                    <div className="clock">
                        {/* <span className='span-27'>{currentTime.toLocaleTimeString()}</span> */}
                    </div>
                    <div id='adminpagetop_ara_aktif_etkinlik'>
                        {
                            etkinlikSayisi === 0 ? (
                                <span className='mrgn-l-10 span-27'>Aktif Etkinlik Yok</span>
                            ) : (
                                <div>
                                    <span className='mrgn-t-10 display-flex flex-drc-row mrgn-l-10 span-27'>
                                        <div id='geri_sayim'>
                                            <span className=''>D</span>
                                            <hr />
                                            <span>{remainingTime.days}</span>
                                        </div>
                                        <div id='geri_sayim'>
                                            <span className=''>H</span>
                                            <hr />
                                            <span>{remainingTime.hours} </span>
                                        </div>
                                        <div id='geri_sayim'>
                                            <span className=''>M</span>
                                            <hr />
                                            <span>{remainingTime.minutes}</span>
                                        </div>
                                        <div id='geri_sayim'>
                                            <span className=''>S</span>
                                            <hr />
                                            <span>{remainingTime.seconds}</span>
                                        </div>

                                        {/* {etkinlik.tournamentName} */}
                                    </span>
                                </div>
                            )
                        }
                    </div>
                </div>

                <div id='adminpagetop_right'>
                    <span className='adminpagetop_right_icon' id='adminpagetop_right_dark'><FontAwesomeIcon icon={faCircleHalfStroke} rotation={180} /></span>
                    <span className='adminpagetop_right_icon' id='adminpagetop_right_bright'><FontAwesomeIcon icon={faCircleHalfStroke} rotation={0} /></span>
                    <span className='adminpagetop_right_icon mrgn-l-10 span-24' id='adminname'>{adminname}</span>
                    <span className='adminpagetop_right_icon' id='adminpagetop_right_notification'><FontAwesomeIcon icon={faBell} /></span>
                    <span className='adminpagetop_right_icon' id='adminpagetop_right_setting'><FontAwesomeIcon icon={faGear} /></span>
                </div>
            </section>

            <section id='adminpagedown'>
                <div id='adminpagedown_navbar'>

                    <div id='adminpagedown_navbar_main'>
                        <div id='adminpagedown_navbar_title'>
                            <span id='adminpagedown_navbar_title_main' className='span-15'>MAIN</span>
                        </div>
                        <div id='adminpagedown_navbar_main_links'>

                            <div id='adminpagedown_navbar_main_links_homepage'>
                                <span className='adminpagedown_navbar_icon'><FontAwesomeIcon icon={faHouse} /></span>
                                <span><a href={`/${ADMIN_URL}`}>Homepage</a></span>
                            </div>

                            <div id='adminpagedown_navbar_main_links_profil'>
                                <span className='adminpagedown_navbar_icon'><FontAwesomeIcon icon={faUser} /></span>
                                <span><a href={`/${ADMIN_URL}/profil`}>Profil</a></span>
                            </div>
                        </div>
                    </div>

                    <div id='adminpagedown_navbar_lists'>
                        <div id='adminpagedown_navbar_title'>
                            <span id='adminpagedown_navbar_title_main' className='span-15'>LISTS</span>
                        </div>
                        <div id='adminpagedown_navbar_lists_text'>
                            <div >
                                <span className='adminpagedown_navbar_links_texts'><a href={`/${ADMIN_URL}/top`}>Top</a></span>
                            </div>
                            <div>
                                <span className='adminpagedown_navbar_links_texts'><a href={`/${ADMIN_URL}/games`}>Games</a></span>
                            </div>
                            <div>
                                <span className='adminpagedown_navbar_links_texts'><a href={`/${ADMIN_URL}/puzzles`}>Puzzles</a></span>
                            </div>
                            <div>
                                {/* <span className='adminpagedown_navbar_icon'><img src={admin_tournaments_img} alt="" /></span> */}
                                <span className='adminpagedown_navbar_links_texts'><a href={`/${ADMIN_URL}/tournaments`}>Tournaments</a></span>
                            </div>
                            <div>
                                <span className='adminpagedown_navbar_links_texts'><a href={`/${ADMIN_URL}/users`}>Users</a></span>
                            </div>
                            <div>
                                <span className='adminpagedown_navbar_links_texts'><a href={`/${ADMIN_URL}/posts`}>Posts</a></span>
                            </div>
                        </div>
                    </div>
                </div>

                <div id='adminpagedown_area'>
                    <section id='adminpagedown_area_top'>
                        <div className='mrgn-t-10'>
                            <span className='mrgn-l-10'>Aktif Kullanıcı : {toplam_user}</span>
                        </div>
                    </section>
                    <section id='adminpagedown_area_tournaments'>
                        <div id='adminpagedown_area_tournaments_top'>
                            <div>
                                <span className='mrgn-l-10 span-27'>Turnuvalar</span>
                            </div>
                            <div id='adminpagedown_area_tournaments_top_ara'></div>
                            <div id='adminpagedown_area_tournaments_top_create_btn'>
                                <button onClick={admin_create_tournaments}>
                                    <span className='span-18'>Turnuva Oluştur</span>
                                </button>
                            </div>
                        </div>

                        <div id='adminpagedown_area_tournaments_list'>

                            {
                                tournaments.map((tournament, index) => (
                                    <div key={index} id='adminpagedown_area_tournaments_list_container'>
                                        <div id='adminpagedown_area_tournaments_list_Name'>
                                            <span className='span-21'>{tournament.tournamentName}</span>
                                        </div>

                                        <div id='adminpagedown_area_tournaments_list_Tarih'>
                                            <span className='span-21'>{formatTournamentDate(tournament.tournamentDate)}</span>
                                        </div>

                                        <div id='adminpagedown_area_tournaments_list_Saat'>
                                            <span className='span-21'>{formatTournamentTime(tournament.tournamentDate)}</span>
                                        </div>

                                        <div id='adminpagedown_area_tournaments_list_Duration'>
                                            <span className='span-21'>{tournament.tournamentDuration}</span>
                                        </div>

                                        <div id='adminpagedown_area_tournaments_list_joinPLayer'>
                                            <span className='span-21'>{tournament.JoinPlayerCount}</span>
                                        </div>

                                        <div id='adminpagedown_area_tournaments_list_view_btn'>
                                            <button onClick={() => navigate(`/tournaments/${tournament.tournamentID}`)}>
                                                <span className='span-21'>İncele</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>

                        <div id='adminpagedown_area_tournaments_liste_bos'>
                            <span className='span-21'>Henüz Planlanmış Turnuva Yok</span>
                        </div>

                    </section>
                    {notifications.map((notification, index) => (
                        <Notification key={index} message={notification.message} type={notification.type} />
                    ))}
                </div>

            </section>

        </div>
    )
}

export default Admin