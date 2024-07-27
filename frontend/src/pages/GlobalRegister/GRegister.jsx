import { useRef, useState, useEffect } from "react";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from 'axios'
import './GRegister.css'
import { useNavigate } from "react-router";
import { SERVER_URL } from "../../helper";
import Cookies from "js-cookie";
import jwtDecode from "jwt-decode";

import google_img from '../../components/assets/img/google.svg'

const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,24}$/;
const EMAIL_REGEX = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/


const Register = ({ data }) => {

  const userRef = useRef();
  const emailRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState('');
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [email, setEmail] = useState('');
  const [validEmail, setValidEmail] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);

  const [pwd, setPwd] = useState('');
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState('');
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState('');

  const [errMsg, setErrMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const jwtToken = Cookies.get('token'); // Çerezi al

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
    userRef.current.focus();
  }, [])

  useEffect(() => {
    setValidName(USER_REGEX.test(user));
  }, [user])

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email])

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd])

  useEffect(() => {
    setErrMsg('');
  }, [user, email, pwd, matchPwd])

  const up_veri = {
    username: user,
    email: email,
    password: pwd,
    country: selectedCountry
  }

  const navigate = useNavigate()

  const handleCountrySelect = async (event) => {
    setSelectedCountry(event.target.value);
  };

  const handleSubmit = async (e) => {
    console.log("tıklandi")
    console.log(user, email, pwd)
    e.preventDefault();
    try {
      const res = await axios.post(`${SERVER_URL}/register`, up_veri)
      if (res.data.kayit) {
        console.log(res)
        setSuccessMsg(res.data.msg)
        errRef.current.focus();
        setTimeout(() => {
          navigate(`/login`)
        }, 3000)
      } else {
        setSuccessMsg()
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
    <div className="gregister_section">
      <h1 className="sign-form-title">Chesswallet.com</h1>
      <div className="register-container">
        <section>
          <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
          <p ref={errRef} className={successMsg ? "successmsg" : "offscreen"} aria-live="assertive">{successMsg}</p>
          <form id="sign_form" onSubmit={handleSubmit}>
            <label htmlFor="username">
              Username:
              <FontAwesomeIcon icon={faCheck} className={validName ? "valid" : "hide"} />
              <FontAwesomeIcon icon={faTimes} className={validName || !user ? "hide" : "invalid"} />
            </label>
            <input
              type="text"
              id="username"
              ref={userRef}
              autoComplete="off"
              onChange={(e) => setUser(e.target.value)}
              value={user}
              required
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

            <label htmlFor="email">
              Email:
              <FontAwesomeIcon icon={faCheck} className={validEmail ? "valid" : "hide"} />
              <FontAwesomeIcon icon={faTimes} className={validEmail || !email ? "hide" : "invalid"} />
            </label>

            <input
              type="email"
              id="email"
              autoComplete="off"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
              aria-invalid={validEmail ? "false" : "true"}
              aria-describedby="uidnotee"
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
            />

            <p id="uidnotee" className={emailFocus && email && !validEmail ? "instructions" : "offscreen"}>
              <FontAwesomeIcon icon={faInfoCircle} />
              4 to 24 characters.<br />
              Must begin with a letter.<br />
              Letters, numbers, underscores, hyphens allowed.
            </p>


            <label htmlFor="password">
              Password:
              <FontAwesomeIcon icon={faCheck} className={validPwd ? "valid" : "hide"} />
              <FontAwesomeIcon icon={faTimes} className={validPwd || !pwd ? "hide" : "invalid"} />
            </label>
            <input
              type="password"
              id="password"
              onChange={(e) => setPwd(e.target.value)}
              value={pwd}
              required
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


            <label htmlFor="confirm_pwd">
              Confirm Password:
              <FontAwesomeIcon icon={faCheck} className={validMatch && matchPwd ? "valid" : "hide"} />
              <FontAwesomeIcon icon={faTimes} className={validMatch || !matchPwd ? "hide" : "invalid"} />
            </label>
            <input
              type="password"
              id="confirm_pwd"
              onChange={(e) => setMatchPwd(e.target.value)}
              value={matchPwd}
              required
              aria-invalid={validMatch ? "false" : "true"}
              aria-describedby="confirmnote"
              onFocus={() => setMatchFocus(true)}
              onBlur={() => setMatchFocus(false)}
            />
            <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
              <FontAwesomeIcon icon={faInfoCircle} />
              Must match the first password input field.
            </p>

            <div>
              <select name="country" id="country" onChange={handleCountrySelect}>
                <option value="Select">Ülke Seçiniz</option>
                <option value="Turkey">Turkey</option>
                <option value="Germany">Germany</option>
              </select>
            </div>
            <button id="sign_btn" onClick={handleSubmit} className={(validMatch || validName || validPwd ? "register-submit:hover" : "")} disabled={!validName || !validPwd || !validMatch ? true : false}>Sign Up</button>
          </form>
          <div className="signpageor"><span>OR</span></div>
          <div className="authentication-social-signin-options">
            <div className="authentication-google" onClick={googleAuth}>
              <img src={google_img} alt="google icon" />
              <span>Sing Up with Google</span>
            </div>
          </div>
          <p className="register-form-en-alt">
            Already registered?<br />
            <span className="line">
              {/*put router link here*/}
              <a href="/login">Sıgn In</a>
            </span>
          </p>
        </section>
      </div>
    </div>
  )
}

export default Register