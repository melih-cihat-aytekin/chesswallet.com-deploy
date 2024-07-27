import React, { useState } from 'react';
import './ToggleButton.css'

const Correct_img = ({ color, strokeWidth }) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">
        <path d="M378-246 154-470l43-43 181 181 384-384 43 43-427 427Z" fill={color} stroke={color} strokeWidth={strokeWidth} />
    </svg>
);

const Across_img = ({ color, strokeWidth }) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">
        <path d="m249-207-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z" fill={color} stroke={color} strokeWidth={strokeWidth} />
    </svg>
);

const Find_lamb = ({ color, strokeWidth }) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24">
        <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Zm-80-60 30-98-80-64h98l32-98 32 98h98l-80 64 30 98-80-62-80 62Z" fill={color} stroke={color} strokeWidth={strokeWidth} />
    </svg>
);

const LeftMini = ({ color, strokeWidth }) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">
        <path d="M561-240 320-481l241-241 43 43-198 198 198 198-43 43Z" fill={color} stroke={color} strokeWidth={strokeWidth} />
    </svg>
);

const Toogle_on_img = ({ color, strokeWidth }) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">
        <path d="M280-240q-100 0-170-70T40-480q0-100 70-170t170-70h400q100 0 170 70t70 170q0 100-70 170t-170 70H280Zm0-60h400q75 0 127.5-52.5T860-480q0-75-52.5-127.5T680-660H280q-75 0-127.5 52.5T100-480q0 75 52.5 127.5T280-300Zm400.941-79Q723-379 752.5-408.441t29.5-71.5Q782-522 752.559-551.5t-71.5-29.5Q639-581 609.5-551.559t-29.5 71.5Q580-438 609.441-408.5t71.5 29.5ZM480-480Z" fill={color} stroke={color} strokeWidth={strokeWidth} />
    </svg>
);

const Toggle = ({ label, toggled, onClick }) => {
    const [isToggled, toggle] = useState(toggled)

    const callback = () => {
        toggle(!isToggled)
        onClick(!isToggled)
    }

    return (
        <label id='toggle_label'>
            <input id='toggle_input' type="checkbox" defaultChecked={isToggled} onClick={callback} />
            <span id='toggle_span' />
            <strong>{label}</strong>
        </label>
    )
}


const Toogle_off_img = ({ color, strokeWidth }) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="48" viewBox="0 -960 960 960" width="48">
        <path d="M561-240 320-481l241-241 43 43-198 198 198 198-43 43Z" fill={color} stroke={color} strokeWidth={strokeWidth} />
    </svg>
);

const Expand_less = () => (
    <svg height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.83 30.83l9.17-9.17 9.17 9.17 2.83-2.83-12-12-12 12z" />
        <path d="M0 0h48v48h-48z" fill="none" />
    </svg>

);

const Expand_more = () => (
    <svg height="48" width="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.83 16.42 24 25.59l9.17-9.17L36 19.25l-12 12-12-12z" fill="#ffffffb8" className="fill-000000"></path>
        <path d="M0-.75h48v48H0z" fill="none"></path>
    </svg>
);

const Chess_Board = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="60" height="60"><g data-name="Layer 32"><rect width="58" height="58" x="3" y="3" fill="#5d6972" rx="4" className="color5d6972 svgShape"></rect><path fill="#7a838b" d="M8 8h12v12H8z" className="color7a838b svgShape"></path><path fill="#c7ced1" d="M8 20h12v12H8z" className="colorc7ced1 svgShape"></path><path fill="#7a838b" d="M8 32h12v12H8z" className="color7a838b svgShape"></path><path fill="#c7ced1" d="M8 44h12v12H8zM20 8h12v12H20z" className="colorc7ced1 svgShape"></path><path fill="#7a838b" d="M20 20h12v12H20z" className="color7a838b svgShape"></path><path fill="#c7ced1" d="M20 32h12v12H20z" className="colorc7ced1 svgShape"></path><path fill="#7a838b" d="M20 44h12v12H20zM32 8h12v12H32z" className="color7a838b svgShape"></path><path fill="#c7ced1" d="M32 20h12v12H32z" className="colorc7ced1 svgShape"></path><path fill="#7a838b" d="M32 32h12v12H32z" className="color7a838b svgShape"></path><path fill="#c7ced1" d="M32 44h12v12H32zM44 8h12v12H44z" className="colorc7ced1 svgShape"></path><path fill="#7a838b" d="M44 20h12v12H44z" className="color7a838b svgShape"></path><path fill="#c7ced1" d="M44 32h12v12H44z" className="colorc7ced1 svgShape"></path><path fill="#7a838b" d="M44 44h12v12H44z" className="color7a838b svgShape"></path><path fill="#fcab68" d="M40 53H24a2 2 0 0 0-2 2v2h20v-2a2 2 0 0 0-2-2Z" className="colorfcab68 svgShape"></path><path fill="#f98658" d="M42 57H22a2 2 0 0 0-2 2v2h24v-2a2 2 0 0 0-2-2zm-5-24H27v3.607a39.982 39.982 0 0 1-1.393 10.464L24 53h16l-1.607-5.929A39.982 39.982 0 0 1 37 36.607z" className="colorf98658 svgShape"></path><rect width="14" height="4" x="25" y="29" fill="#fcab68" rx="2" className="colorfcab68 svgShape"></rect><path fill="#f98658" d="M38 25a6 6 0 1 0-10.463 4h8.926A5.968 5.968 0 0 0 38 25Z" className="colorf98658 svgShape"></path></g></svg>
);

const World = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="60" height="60">
        <g fill="none" fillRule="evenodd" transform="translate(-3)">
            <circle cx="15" cy="12" r="12" fill="#2980b9" className="color2980B9 svgShape"></circle>
            <path fill="#19b596" d="M6.98 3.073c.351.057.68.225 1.056.241.973.042 1.712-1.216 2.394-1.135.626.074 3.25 1.135 3.25 1.135s-.174 1.87-.99 2.956c-.369.49-2.26 1.592-2.26 1.592s-.21-2.097-.307-2.416a1.479 1.479 0 0 0-.695-.863s-.043 1.84 0 2.662c.039.746.245 2.043.245 2.043s-2.065 1.68-3.082 2.306c-.546.336-1.417.988-1.417.988l1.2.9s2.9.464 3.299.981c.259.336 1.16.581 1.367 1.04.412.917-.907 1.99-1.612 3.156-.086.142-.585.162-.793.714-.271.718-.25 1.986-.25 1.986s-.784-.764-1-1.744c-.118-.532 0-2.792 0-2.792s-.654-.672-.794-1.09c-.124-.369 0-1.27 0-1.27s-1.973-.924-2.874-1.88c-.138-.147-.45-.474-.713-.902A11.97 11.97 0 0 1 6.98 3.073Zm19.89 7.152a4.22 4.22 0 0 1-.069.065c-.357.335-.612 2.863-1.092 3.283-.645.564-1.535-1.006-2.102-.934-.091.012-.978 1.774-1.062 1.774-.733 0-2.002-2.042-2.002-2.042s-.604 1.253-.945 1.202c-.546-.082-1.716-1.601-1.716-1.601s1.563 2.216 1.417 2.441c-.68 1.051-1.451 4.162-2.707 4.064-1.256-.098-.864-3.953-1.628-4.064-1.052-.152-1.885.456-2.12-.84-.048-.264-.1-1.773 1.06-2.283.276-.122 2.691.174 2.85 0 .015-.017-3.182-.5-3.182-.5s.241-.43.332-1.11c.06-.455-.203-1.109-.176-1.152.208-.33 1.236.614 1.236.614V7.794s.62-1.155 1.047-1.567c.115-.11.581 0 .581 0 .134.044 1.629.268 2.474-.22.695-.4.962-1.044 1.477-1.514.498-.455 1.254-.743 1.376-.743 1.182 0 1.062.31 2.107.342a11.954 11.954 0 0 1 2.844 6.133ZM24.22 19.68c-.274-.481-.663-1.141-.777-1.219-.181-.123-1.774.296-1.774.296v-1.36c0-.189.812-.608 1.042-.71.335-.147 1.133-.559 1.133-.559.374 0 .15.397.442.673.165.156.569-.673.569-.673s.572.914.705 1.574c-.38.705-.83 1.367-1.34 1.978Z" className="color19B596 svgShape"></path>
        </g>
    </svg>
);

const Flag = () => {
    <svg xmlns="http://www.w3.org/2000/svg" className="feather feather-flag" fill="#ffffff" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>
    </svg>
}



export {
    Correct_img,
    Across_img,
    LeftMini,
    Toogle_on_img,
    Toogle_off_img,
    Toggle,
    Find_lamb,
    Expand_less,
    Expand_more,
    Chess_Board,
    World,
    Flag,
}

