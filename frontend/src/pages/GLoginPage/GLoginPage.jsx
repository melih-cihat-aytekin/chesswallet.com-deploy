import { useRef, useState, useEffect } from "react";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from 'axios'
import './GLoginPage.css'
import { useNavigate } from "react-router";
import Cookies from 'js-cookie';
import { SERVER_URL } from "../../helper";
import jwtDecode from "jwt-decode";

import google_img from '../../components/assets/img/google.svg'

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,24}$/;
const EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/


const Login = () => {

    const [jwtToken, setJwtToken] = useState('');

    const userRef = useRef();
    const errRef = useRef();

    const [secim, setSecim] = useState(1)

    const [giris_sekli, setGiris_sekli] = useState('username')

    const [user, setUser] = useState('');
    const [validName, setValidName] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const [email, setEmail] = useState('');
    const [validEmail, setValidEmail] = useState(false);
    const [emailFocus, setEmailFocus] = useState(false);

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);


    const [errMsg, setErrMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');


    useEffect(() => {
        const jwtToken = Cookies.get('token');

        if (jwtToken) {
            try {
                // JWT'yi çözümle
                const decodedToken = jwtDecode(jwtToken);

                navigate(`/home/${decodedToken.username}`)
            } catch (error) {
                console.log('JWT Çözümleme Hatası:', error);
            }
        }
    }, [])

    useEffect(() => {
        if (secim === 1) {
            setGiris_sekli('username')
        }
    }, [secim])

    useEffect(() => {
        if (secim === 2) {
            setGiris_sekli('email')
        }
    }, [secim])

    useEffect(() => {
        console.log(giris_sekli)
    }, [giris_sekli])

    useEffect(() => {
        setValidName(USER_REGEX.test(user));
    }, [user])

    useEffect(() => {
        setValidEmail(EMAIL_REGEX.test(email));
    }, [email])

    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd));
    }, [pwd])

    useEffect(() => {
        setErrMsg('');
    }, [user, email, pwd])

    const secim_yap_e = () => {
        if (secim === 1) {
            setSecim(2)
        }
    }

    const secim_yap_u = () => {
        if (secim === 2) {
            setSecim(1)
        }
    }


    const in_veri = {
        username: user,
        email: email,
        password: pwd,
        giris_sekli: giris_sekli
    }

    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        console.log("tıklandi")
        console.log(user, email, pwd)
        e.preventDefault();
        Cookies.remove('token');
        Cookies.remove('Country');
        try {
            const res = await axios.post(`${SERVER_URL}/login`, in_veri)
            if (res.data.giris) {
                console.log(res)
                setSuccessMsg(res.data.msg)
                errRef.current.focus();

                const tokenFromServer = res.data.token;

                const { username } = res.data;

                const Country = 'Turkey';

                Cookies.set('token', tokenFromServer, { expires: 7 });

                setJwtToken(tokenFromServer);

                setTimeout(() => {
                    navigate(`/home/${username}`); // Yönlendirme yaparken JWT'yi kullanmak
                }, 3000);

            } else {
                setSuccessMsg('')
                setErrMsg(res.data.msg)
                errRef.current.focus();
            }
        } catch (error) {
            console.log(error)
        }
    }

    const googleAuth = () => {
        window.open(
            `http://localhost:5000/auth/google/`,
            "_self"
        );
    };

    return (
        <div className="glogin_section">
            <h1 className="sign-form-title">Chesswallet.com</h1>
            <div className="login-container">
                <section>
                    <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                    <p ref={errRef} className={successMsg ? "successmsg" : "offscreen"} aria-live="assertive">{successMsg}</p>
                    <form id="sign_form" onSubmit={handleSubmit}>
                        {secim === 1 ? (
                            <>
                                <div className="login-label-area">
                                    <label id="username-login-label" htmlFor="username">
                                        Username:
                                        <FontAwesomeIcon icon={faCheck} className={validName ? "valid" : "hide"} />
                                        <FontAwesomeIcon icon={faTimes} className={validName || !user ? "hide" : "invalid"} />
                                    </label>
                                    <label id="email-login-label-secim" onClick={secim_yap_e}>Email İle Giriş Yap</label>

                                </div>
                                <input
                                    type="text"
                                    id="username"
                                    ref={userRef}
                                    autoComplete="off"
                                    onChange={(e) => setUser(e.target.value)}
                                    value={user}
                                    aria-invalid={validName ? "false" : "true"}
                                    aria-describedby="uidnote"
                                    onFocus={() => setUserFocus(true)}
                                    onBlur={() => setUserFocus(false)}
                                />
                                <p id="uidnote" className={userFocus && user && !validName ? "instructions" : "offscreen"}>
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                    4 to 24 characters.<br />
                                    Must begin with a letter.<br />
                                    Letters, numbers, underscores, hyphens allowed.
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="login-label-area">
                                    <label id="email-login-label" htmlFor="email">
                                        Email:
                                        <FontAwesomeIcon icon={faCheck} className={validEmail ? "valid" : "hide"} />
                                        <FontAwesomeIcon icon={faTimes} className={validEmail || !email ? "hide" : "invalid"} />
                                    </label>
                                    <label id="username-login-label-secim" onClick={secim_yap_u}>Username İle Giriş Yap</label>
                                </div>

                                <input
                                    type="email"
                                    id="email"
                                    autoComplete="off"
                                    onChange={(e) => setEmail(e.target.value)}
                                    value={email}
                                    aria-invalid={validEmail ? "false" : "true"}
                                    aria-describedby="uidnotee"
                                    onFocus={() => setUserFocus(true)}
                                    onBlur={() => setUserFocus(false)}
                                />

                                <p id="uidnotee" className={emailFocus && email && !validEmail ? "instructions" : "offscreen"}>
                                    <FontAwesomeIcon icon={faInfoCircle} />
                                    4 to 24 characters.<br />
                                    Must begin with a letter.<br />
                                    Letters, numbers, underscores, hyphens allowed.
                                </p>
                            </>
                        )}

                        <label htmlFor="password" className="loginPassword">
                            Password:
                            <FontAwesomeIcon icon={faCheck} className={validPwd ? "valid" : "hide"} />
                            <FontAwesomeIcon icon={faTimes} className={validPwd || !pwd ? "hide" : "invalid"} />
                        </label>
                        <input
                            type="password"
                            id="password"
                            onChange={(e) => setPwd(e.target.value)}
                            value={pwd}
                            aria-invalid={validPwd ? "false" : "true"}
                            aria-describedby="pwdnote"
                            onFocus={() => setPwdFocus(true)}
                            onBlur={() => setPwdFocus(false)}
                        />
                        <p id="pwdnote" className={pwdFocus && !validPwd ? "instructions" : "offscreen"}>
                            <FontAwesomeIcon icon={faInfoCircle} />
                            8 to 24 characters.<br />
                            Must include uppercase and lowercase letters, a number and a special character.<br />
                        </p>


                        <button id="sign_btn" onClick={handleSubmit}
                            className={((giris_sekli === 'username' ? (validName || validPwd) : (validEmail || validPwd)) ? "register-submit:hover" : "")}
                            disabled={(giris_sekli === 'username' ? (!validName || !validPwd) : (!validEmail || !validPwd)) ? true : false}>Sign In</button>
                    </form>
                    <div className="signpageor"><span>OR</span></div>
                    <div className="authentication-social-signin-options">
                        <div className="authentication-google" onClick={googleAuth}>
                            <img src={google_img} alt="google icon" />
                            <span>Sing in with Google</span>
                        </div>
                    </div>
                    <p className="register-form-en-alt">
                        Already registered?<br />
                        <span className="line">
                            {/*put router link here*/}
                            <a href="/register">Sıgn Up</a>
                        </span>
                    </p>                </section>
            </div>
        </div >
    )
}

export default Login