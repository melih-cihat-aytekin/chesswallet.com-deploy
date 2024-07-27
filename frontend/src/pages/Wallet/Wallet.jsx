import axios from "axios";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { Howl } from 'howler';
import './Wallet.css'

import io from 'socket.io-client'

import { useNavigate } from "react-router";
import jwtDecode from "jwt-decode";

import diamond from '../../components/assets/img/diamond.png'
import user_home_default_profile_img from '../../components/assets/img/default_user.png'
import user_default_kare_img from '../../components/assets/img/user_profile_kare_img_melih_ytkn.jpeg'
import flag_turkey from '../../components/assets/img/flag/flag_turkey.png'
import flag_germany from '../../components/assets/img/flag/flag_germany.png'
import site_logo1 from '../../components/assets/img/site-logo.png'
import site_logo2 from '../../components/assets/img/site-logo2.png'
import site_logo3 from '../../components/assets/img/site-logo3.png'
import minik_logo from '../../components/assets/img/minik-logo.png'
import logout_img from '../../components/assets/img/logout.svg'
import notification_img from '../../components/assets/img/notification.png'

import { SERVER_URL } from "../../helper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRectangleXmark } from "@fortawesome/free-solid-svg-icons";
import CircularLoader from "../../components/assets/js/loader";
const socket = io.connect('http://localhost:5000')

const Wallet = () => {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [jwtToken, setJwtToken] = useState('');
    const [userData, setUserData] = useState();
    const [toggled, setToggled] = useState(false);
    const [arkaplanDurum, setArkaplanDurum] = useState("dark");
    const [socket_idim, setSocket_idim] = useState("")
    const [isPremiumUser, setIsPremiumUser] = useState(0)
    const [notifications, setNotifications] = useState([]);
    const [friends, setFriends] = useState([]);

    // Örnek bir kullanıcı kimliği. Normalde bu, sunucudan alınan gerçek JWT olmalıdır.
    const [username, setUsername] = useState("")
    const [countryPath, setCountryPath] = useState()
    const [flag, setFlag] = useState()
    const [wallet_point, setWallet_point] = useState();
    const [sistem, setSistem] = useState('')
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isDataArrived, setIsDataArrived] = useState(false);

    const navigate = useNavigate()

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
        if (flag === 'Turkey') {
            setCountryPath(flag_turkey)
        }
        if (flag === 'Germany') {
            setCountryPath(flag_germany)
        }
    }, [flag])

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

        const intervalId = setInterval(fetchStatistics, 2000);

        return () => clearInterval(intervalId);


    }, [isLoggedIn])

    const fetchStatistics = async () => {
        try {
            const res = await axios.post(`${SERVER_URL}/fetchStatistics`, veri)

            if (res.data.status === 'OK') {
                setFlag(res.data.country)
                setIsPremiumUser(res.data.isPremiumUser)
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
            }

            const wallet_res = await axios.post(`${SERVER_URL}/fetchWallet`, veri)
            if (res.data.status === 'OK') {
                setWallet_point(wallet_res.data.coins)
                console.log("Coinlere Ulaşıldı...")
                setIsDataArrived(true)
            }
        } catch (error) {
            console.log(error)
        }
    }


    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentDate(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const options = { weekday: 'long', month: 'numeric', day: 'numeric', year: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('tr-TR', options);

    // Biçimlendirilmiş tarihi parçala
    const parts = formattedDate.split('.');
    const day = parts[0];
    const month = parts[1];
    const yearAndDayName = parts[2];
    const yearAndDayNameParts = yearAndDayName.split(' ');
    const year = yearAndDayNameParts[0]
    const dayName = yearAndDayNameParts[1];

    useEffect(() => {

        socket.on("r_data", (data) => {
            if (data.country === 'Germany') {
                setFlag(flag_germany)
            }
            else if (data.country === 'Turkey') {
                setFlag(flag_turkey)
            }
        })
    }, [socket])

    function handleLogout() {
        // Çıkış yapıldığında çerezi temizleyin
        Cookies.remove('token');
        setJwtToken('');
        navigate("/login")
    }

    const DeleteFriendRequestButton = async (id) => {
        const DeleteFriendRequestVeri = {
            username: username,
            // addFriendRequestUsername: searchFriendNameSonucName,
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
    const openNotification = () => {
        document.querySelector("#user_home_notification_container").style.display = 'flex';
        document.querySelector("#wallet_notification_area").style.display = 'flex';
    }

    const closeNotificationPage = () => {
        document.querySelector("#user_home_notification_container").style.display = 'none';
        document.querySelector("#wallet_notification_area").style.display = 'none';
    }

    return (
        <div>
            {isLoggedIn ? (
                <>
                    {isDataArrived ? (
                        <div id="wallet_all_con">
                            <section id="wallet_sol_bar">
                                <div id="wallet_sol_bar_logo">
                                    <img src={minik_logo} alt="" />
                                </div>
                                <div id="wallet_sol_bar_logout">
                                    <img src={logout_img} alt="" onClick={handleLogout} />
                                </div>
                            </section>
                            <section id="wallet_ana_area">

                                <div id="wallet_ana_area_sol">

                                    <div id="wallet_ana_area_sol_title">
                                        <span className="span-27 font-weight-700">DASHBOARD</span>
                                        <span className="mrgn-l-20 span-24 font-weight-600">{dayName}</span>
                                        <span className="mrgn-l-10 span-24 font-weight-600">{day}</span>
                                        <span className="span-24 font-weight-600">.{month}</span>
                                        <span className="span-24 font-weight-600">.{year}</span>
                                    </div>
                                    <div id="wallet_ana_area_sol_wallet">
                                        <div>
                                            <span className="span-30 font-weight-500">Güncel Bakiye</span>
                                            <span className="span-36 font-weight-700">{wallet_point}</span>
                                        </div>
                                    </div>
                                    <div id="wallet_ana_area_sol_grafik">

                                    </div>
                                </div>

                                <div id="wallet_ana_area_sag">
                                    <div id="wallet_profile">
                                        <div id="wallet_profile_user">
                                            <img id="wallet_default_profile_img" src={user_home_default_profile_img} alt="" />
                                            <div>
                                                <img id="wallet_user_country_flag" src={countryPath} alt="" />
                                                <span className="span-24">{username}</span>
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
                                        <div id="wallet_sol_bar_ara"></div>
                                        <div id="wallet_notification">
                                            <div id="wallet_sol_bar_notification_bar_area">
                                                <img src={notification_img} alt="" onClick={openNotification} />
                                            </div>
                                        </div>
                                    </div>
                                    <div id="wallet_notification_container">

                                        <div id="wallet_notification_area">
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

                                            <div id="wallet_notification_close_btn">
                                                <FontAwesomeIcon onClick={closeNotificationPage} icon={faRectangleXmark} />
                                            </div>
                                        </div>
                                    </div>
                                    <div></div>
                                    <div></div>
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
    );
};

export default Wallet;
