import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie';
import { useNavigate } from "react-router";

function NavigateStatistic() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isSorguAyni, setIsSorguAyni] = useState(true);

    const navigate = useNavigate()
    const userIdFromCookie = Cookies.get('me');
    const userCountryFromCookie = Cookies.get('Country');

    const [username, setUsername] = useState("")
    console.log(username)

    useEffect(() => { 
        // Kullanıcı ID'sini çerezden al

        if (userIdFromCookie) {
            setUsername(userIdFromCookie);
            setIsLoggedIn(true);
            navigate(`/statistic/${userIdFromCookie}`)
        } else {
            setTimeout(() => {
                navigate('/login')
            }, 3000)
        }
    }, [userIdFromCookie]);


  return (
    <div></div>
  )
}

export default NavigateStatistic