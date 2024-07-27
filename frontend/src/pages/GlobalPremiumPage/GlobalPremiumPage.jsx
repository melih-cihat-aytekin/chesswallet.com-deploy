import React from 'react'
import './GlobalPremiumPage.css';
import DarkLogo from '../../components/assets/img/DarkLogo.png';
import { Correct_img } from '../../components/assets/js/icon.jsx';
import diamond from '../../components/assets/img/diamond.png'
import axios from 'axios'
import { SERVER_URL } from '../../helper';
import jwtDecode from 'jwt-decode';
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router";

const GlobalPremiumPage = () => {

    const [userData, setUserData] = useState();
    const [username, setUsername] = useState("")
    const [isLoggedIn, setIsLoggedIn] = useState();

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

    const tikla = () => {
        axios.post(`${SERVER_URL}/payment`, 
        {
            price: 150,
            cardUserName: "John Doe",
            cardNumber: 5528790000000008,
            expireDate: "12/30",
            cvc: 123,
            registerCard: "0",
            username : username
        })
        .then(function (response) {
            console.log(response.data.status);
            if (response.data.status === "success"){
                alert("Ödemeniz Başarıyla Gerçekleşti")
                navigate(`/`)
            }
        })
        .catch(function (error) {
            console.log(error);
        });
        console.log("tıklandı")
    }

    return (
        <div id='premium_global_sec'>
            <section id='premium_global_sec1'>
                <img src={DarkLogo} alt="DarkLogo" id='premiumDarkLogo' />
            </section>

            <section id='premium_global_sec2'>
            </section>

            <section id='premium_global_sec3'>
                <div>
                    AYRICALIKLI ÜYE OLUN
                </div>

                <div>
                    SATRANÇTA ZİRVEYE OYNAYIN
                </div>
            </section>

            <section id='premium_global_sec4'>
                <div id='premium_plan_con'>
                    <div id='premium_plan_title_con'>
                        <div id="premium_plan_img">
                            <img src={diamond} alt="" />
                        </div>
                        <div id='premium_plan_title'>
                            Elmas
                        </div>
                    </div>

                    <div id='premium_plan_fayda_con'>
                        <div id='premium_plan_fayda_con_con'>
                            <div>
                                <Correct_img color={"green"} strokeWidth={'40px'} /><div id='premium_plan_fayda_madde'>Sınırsız Oyun İncelemesi</div>
                            </div>
                            <div>
                                <Correct_img color={"green"} strokeWidth={'40px'} /><div id='premium_plan_fayda_madde'>Sınırsız Bulmaca</div>
                            </div>
                            <div>
                                <Correct_img color={"green"} strokeWidth={'40px'} /><div id='premium_plan_fayda_madde'>Tüm Botlara Erişim Elde Edin</div>
                            </div>
                            <div>
                                <Correct_img color={"green"} strokeWidth={'40px'} /><div id='premium_plan_fayda_madde'>Reklamsız Arayüz</div>
                            </div>
                        </div>
                    </div>

                    <div id='premium_plan_button_con'>
                        <button onClick={tikla}>ABONE OL</button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default GlobalPremiumPage