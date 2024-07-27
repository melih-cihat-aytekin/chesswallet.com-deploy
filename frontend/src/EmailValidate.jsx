import React, { useEffect, useState } from 'react';
import axios from 'axios'; 'react';
import jwtDecode from 'jwt-decode';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router";
import { SERVER_URL } from "./helper";

import './components/assets/css/public.css'
import CircularLoader from './components/assets/js/loader';


const EmailValidate = () => {
    const [isEmailVerify, setIsEmailVerify] = useState(false);
    const navigate = useNavigate()

    useEffect(() => {
        const tokenParams = new URLSearchParams(window.location.search).get('token');
        console.log(tokenParams)
        const decoded = jwtDecode(tokenParams);
        validateEmail(decoded.email, tokenParams)
    }, [])

    const validateEmail = async (email, token) => {
        try {
            const veri = {
                email,
                tokenEmail: token
            }
            const res = await axios.post(`${SERVER_URL}/verify-email`, veri)
            console.log(res.data)
            if (res.data.message === 'Email Verified successfully') {
                console.log(res.data.message)
                Cookies.set('token', res.data.token, { expires: 7 });
                setTimeout(() => {
                    navigate(`/home/${res.data.username}`);
                }, 3000);
                // setIsEmailVerify(true)
            } else {
                console.error('Error saving username:', res.data.message);
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            {isEmailVerify ? (
                <div className='AllContainerColumn'>
                    <h1>Your email has been verified.</h1>
                    <CircularLoader />
                </div>
            ) : (
                <div className='AllContainerColumn'>
                    <h1>Your email is being verified.</h1>
                    <CircularLoader />
                </div>
            )}
        </>
    );
};

export default EmailValidate;
