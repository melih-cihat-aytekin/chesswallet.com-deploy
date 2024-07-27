import React, { useEffect, useState } from 'react'
import axios from "axios";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router";
import '../UserProfile/UserProfile.css'
import '../../components/assets/css/auto.css'
import { useParams } from 'react-router'

import user_home_default_profile_img from '../../components/assets/img/default_user.png'
import user_default_kare_img from '../../components/assets/img/user_profile_kare_img_melih_ytkn.jpeg'
import diamond from '../../components/assets/img/diamond.png'

import flag_turkey from '../../components/assets/img/flag/flag_turkey.png'
import flag_germany from '../../components/assets/img/flag/flag_germany.png'

import { SERVER_URL } from '../../helper.js';
import socket from "../../socket.js";
import jwtDecode from 'jwt-decode';

function UserProfile() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [jwtToken, setJwtToken] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [UploadedImagePath, setUploadedImagePath] = useState(null);
    const [ProfileFotoUrl, setProfileFotoUrl] = useState(null);
    const [isGüncellendi, setIsGüncellendi] = useState(0);
    const [onChange, setOnChange] = useState(0);
    const [ImageOnChange, setImageOnChange] = useState(0);
    const [socket_idim, setSocket_idim] = useState("")
    const [isPremiumUser, setIsPremiumUser] = useState(0)
    const [inMatch, setInMatch] = useState(false);

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
        const jwtToken = Cookies.get('token'); // Çerezi al

        if (jwtToken) {
            try {
                // JWT'yi çözümle
                const decodedToken = jwtDecode(jwtToken);

                setUsername(decodedToken.username)
                setJwtToken(jwtToken)

                setIsLoggedIn(true)

            } catch (error) {
                console.log('JWT Çözümleme Hatası:', error);
            }
        }
    }, []);


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
            fetchInMatch()
        }, 500);

        setInterval(() => {
            fetchStatistics()
        }, 5000);


    }, [isLoggedIn])

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
            // console.log(res)

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
                setFlag(res.data.country)
                setIsPremiumUser(res.data.isPremiumUser)
                if (res.data.profileFotoUrl === null) {
                    setProfileFotoUrl(null)
                    // console.log("fotourl1 :", res.data.profileFotoUrl)
                } else {
                    const fotourl = `${res.data.profileFotoUrl.split('/')[1]}/${res.data.profileFotoUrl.split('/')[2]}`
                    // console.log("fotourl2 :", fotourl, res.data.profileFotoUrl)
                    setProfileFotoUrl(fotourl)
                }
            }

        } catch (error) {
            console.log(error)
        }
    }

    fetchStatistics()

    const changeProfile = () => {
        setIsGüncellendi(0)
        setOnChange(1)
    }

    const handleImageUpload = async () => {
        try {
            const formData = new FormData();
            formData.append('image', selectedImage, `${username}.png`);

            for (const entry of formData.entries()) {
                console.log(entry);
            }

            // Node.js sunucusuna dosyayı gönder
            const response = await axios.post(`${SERVER_URL}/uploadPhoto`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log(response.data);
            // Yükleme işlemi başarılıysa, yüklenen resmin yolunu state'e kaydet
            if (response.data.status === 'success') {
                setUploadedImagePath(response.data.imagePath);
                console.log(response.data.imagePath)
                setIsGüncellendi(1)

                setTimeout(async () => {
                    setOnChange(0)
                }, 500)
            }
        } catch (error) {
            console.error('Dosya yükleme hatası:', error);
        }
    };


    const güncelle = async () => {
        handleImageUpload()
    }


    return (
        <div>
            {isLoggedIn ? (
                <div id='user-profile-container'>
                    {(onChange ? (
                        <div id='changed_top_bar'>
                            {isGüncellendi ? (
                                <span>Güncellendi</span>
                            ) : (<></>)}
                            <button onClick={güncelle}>Kaydet</button>
                        </div>
                    ) : (<></>))}

                    <section id='user-profile-container-orta'>
                        <div id='user-profile-container-orta-sol'>
                            <div id='user-profile-container-orta-sol-main'>
                                <div id='user-profile-container-orta-sol-main-düzenle'>
                                    <span onClick={changeProfile} className='span-15'>Düzenle</span>
                                </div>
                                <div id='user-profile-container-orta-sol-main-profile'>
                                    <div>
                                        {isGüncellendi ? (
                                            <>{ProfileFotoUrl === null ? (
                                                <>
                                                    <img id='user-profile-container-orta-sol-main-profile-img' src={user_home_default_profile_img} alt="" />
                                                </>) : (
                                                <>
                                                    <img id='user-profile-container-orta-sol-main-profile-img' src={`${SERVER_URL}/${ProfileFotoUrl}`} alt="" />
                                                </>)}</>
                                        ) : (<>{ProfileFotoUrl === null ? (
                                            <>
                                                <img id='user-profile-container-orta-sol-main-profile-img' src={user_home_default_profile_img} alt="" />
                                            </>) : (
                                            <>
                                                <img id='user-profile-container-orta-sol-main-profile-img' src={`${SERVER_URL}/${ProfileFotoUrl}`} alt="" />
                                            </>)}</>)}
                                        {(onChange ? (
                                            <input type="file" name='image' onChange={(e) => setSelectedImage(e.target.files[0])} />
                                        ) : (<></>))}
                                    </div>
                                    <div id='user-profile-container-orta-sol-main-profile-info'>
                                        <span>{username}</span>
                                        <img id='user-profile-container-orta-sol-main-profile-info-user-flag' src={countryPath} alt="" />
                                        {isPremiumUser ? (<img id='user-profile-container-orta-sol-main-profile-info-user-diamond' src={diamond} alt=''></img>) : <></>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id='user-profile-container-orta-ara'></div>

                        <div id='user-profile-container-orta-sag'>

                        </div>
                    </section>
                </div >
            ) : (
                <div></div>
            )
            }
        </div >
    )
}

export default UserProfile