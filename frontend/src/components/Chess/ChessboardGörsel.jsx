import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from "react-router";
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import '../assets/css/public.css'
import './chess.css'
import socket from '../../socket.js';
import { useParams } from 'react-router-dom';

import { SquareBackground_bos, DarkSquareBackground_ana, LightSquareBackground_ana, DarkSquareBackground_buzlu_deniz, LightSquareBackground_buzlu_deniz } from './CustomBoard.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRectangleXmark, faGear, faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons"
import { SERVER_URL } from '../../helper.js';
import axios from "axios";


function ChessboardGörsel() {

  const [pieceTheme, setPieceTheme] = useState('ana')
  const [darkSquareTheme, setDarkSquareTheme] = useState(DarkSquareBackground_ana)
  const [lightSquareTheme, setLightSquareTheme] = useState(LightSquareBackground_ana)

  const pieces = [
    "wP",
    "wN",
    "wB",
    "wR",
    "wQ",
    "wK",
    "bP",
    "bN",
    "bB",
    "bR",
    "bQ",
    "bK",
  ];
  const customPieces = () => {
    const returnPieces = {};
    pieces.map((p) => {
      returnPieces[p] = ({ squareWidth }) => (
        <div
          style={{
            width: squareWidth,
            height: squareWidth,
            backgroundImage: `url(${SERVER_URL}/piece/${pieceTheme}/${p}.png)`,
            backgroundSize: "100%",
          }}
        />
      );
      return null;
    });
    return returnPieces;
  };

  const customDarkSquareStyle = () => {
    return darkSquareTheme;
  }

  const customLightSquareStyle = () => {
    return lightSquareTheme;
  }


  const board_setting_on_btn = () => {
    document.querySelector(".board_setting_on").style.display = 'flex';
  }
  const board_setting_off_btn = () => {
    document.querySelector(".board_setting_on").style.display = 'none';
  }

  return (
    <div className='board-container-normal'>

      <div className='board'>
        <Chessboard
          customBoardStyle={{
            zIndex: "1",
            position: "relative",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          }}
          customDarkSquareStyle={{ backgroundColor: customDarkSquareStyle() }}
          customLightSquareStyle={{ backgroundColor: customLightSquareStyle() }}
          customPieces={customPieces()}
          boardOrientation={
            "white"
          }
        />
      </div>
      <div className="board_setting_on">
        <div className='board_setting_on_close_btn_area'>
          <FontAwesomeIcon onClick={board_setting_off_btn} icon={faRectangleXmark} />
        </div>
        <div className='board_setting_on_area'>
          <div className="board-container-normal-btn">
            <button onClick={() => { setPieceTheme('ana') }}>Chess.com</button>
            <button onClick={() => { setPieceTheme('wikipedia') }}>Wikipedia</button>
          </div>
          <div className="board-container-normal-btn">
            <button onClick={() => { setDarkSquareTheme(SquareBackground_bos); setLightSquareTheme(SquareBackground_bos) }}>Empty</button>
            <button onClick={() => { setDarkSquareTheme(DarkSquareBackground_ana); setLightSquareTheme(LightSquareBackground_ana) }}>Chess.com</button>
            <button onClick={() => { setDarkSquareTheme(DarkSquareBackground_buzlu_deniz); setLightSquareTheme(LightSquareBackground_buzlu_deniz) }}>Buzlu Deniz</button>
          </div>
        </div>
      </div>
      <div className="board_setting_off">
        <FontAwesomeIcon onClick={board_setting_on_btn} icon={faGear} />
      </div>
    </div>
  );
}

export default ChessboardGörsel;
