import React, { useEffect, useState } from 'react';
import axios from 'axios'; 'react';
import jwtDecode from 'jwt-decode';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router";
import { SERVER_URL } from "./helper";

import './components/assets/css/public.css'


const ChooseUsername = () => {
    const [username, setUsername] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [tokenJWT, setTokenJWT] = useState('');
    const navigate = useNavigate()

    useEffect(() => {
        const tokenParams = new URLSearchParams(window.location.search).get('token');
        console.log(tokenParams)
        if (tokenParams) {
            const decoded = jwtDecode(tokenParams);
            setUserEmail(decoded.email);
            Cookies.set('token', tokenParams, { expires: 7 });
            setTokenJWT(tokenParams)
        }
    }, [])

    const veri = {
        username: username,
        tokenJWT: tokenJWT
    }

    const handleSubmit = async (e) => {
        try {
            e.preventDefault();

            console.log(username, tokenJWT)
            const res = await axios.post(`${SERVER_URL}/saveusername`, veri)
            if (res.data.message === 'Username saved successfully') {
                console.log(res.data.token)
                Cookies.set('token', res.data.token, { expires: 7 });
                navigate(`/home/${username}`);
            } else {
                console.error('Error saving username:', res.data.message);
            }
        } catch (error) {
            console.log(error)
        }
    };

    return (
        <div className='AllContainer'>
            <h2>Enter Username</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username..."
                    required
                />
                <button type="submit">Save Username</button>
            </form>
        </div>
    );
};

export default ChooseUsername;
