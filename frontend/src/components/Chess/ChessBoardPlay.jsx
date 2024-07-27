import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from "react-router";
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import '../assets/css/public.css'
import './chess.css'
import socket from '../../socket.js';
import { useParams } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import Cookies from 'js-cookie';
import PubSub from 'pubsub-js';

import { SquareBackground_bos, DarkSquareBackground_ana, LightSquareBackground_ana, DarkSquareBackground_buzlu_deniz, LightSquareBackground_buzlu_deniz } from './CustomBoard.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRectangleXmark, faGear, faAngleLeft, faAngleRight, faPlay, faPause, faChessKing, faTrophy, faHouse } from "@fortawesome/free-solid-svg-icons"
import { SERVER_URL } from '../../helper.js';
import axios from "axios";
import user_home_default_profile_img from '../../components/assets/img/default_user.png'
import flag_icon from '../../components/assets/img/flag_icon.svg'
import half from '../../components/assets/img/half.svg'
import { Across_img, Correct_img, LeftMini, Toggle, Find_lamb, Expand_less, Expand_more, Chess_Board, World, Flag } from '../assets/js/icon.jsx';
import CircularLoader from '../assets/js/loader.jsx';
import { Howl } from 'howler';

import moveSelf_sounds from '../assets/sounds/move-self.mp3'
import capture_sounds from '../assets/sounds/capture.mp3'
import notification_sounds from '../assets/sounds/notify.mp3'
import castle_sounds from '../assets/sounds/castle.mp3'
import moveCheck_sounds from '../assets/sounds/move-check.mp3'
import promote_sounds from '../assets/sounds/promote.mp3'
import gameStart_sound from '../assets/sounds/gameStartSound.mp3'




// function ChessBoardPlay({ boardOrientation, username, rakip_username, room, rakip_socketID, mySocketID, MovesWhite, MovesBlack, whiteDuration, blackDuration }) {
function ChessBoardPlay({ boardOrientation }) {

  const navigate = useNavigate()
  const [username, setUsername] = useState("")
  const [isDataArrived, setIsDataArrived] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [jwtToken, setJwtToken] = useState('');
  const [socket_idim, setSocket_idim] = useState("")
  const [rakipSocketID, setRakipSocketID] = useState('');
  const [rakipUsername, setRakipUsername] = useState('');

  const [game, setGame] = useState(() => new Chess(), []);
  const [gameResultMsg, setGameResultMsg] = useState('');
  const { game_id_sayisi } = useParams();
  const game_id = game_id_sayisi - 1000000
  const [fen, setFen] = useState(game.fen());
  const [game_over, setGame_over] = useState(false)

  const [movesWhite, setMovesWhite] = useState([]);
  const [movesBlack, setMovesBlack] = useState([]);

  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [playing, setPlaying] = useState(false); // To manage autoplay state
  const [isWinner, setIsWinner] = useState(0);

  const [pieceTheme, setPieceTheme] = useState('ana')
  const [darkSquareTheme, setDarkSquareTheme] = useState(DarkSquareBackground_ana)
  const [lightSquareTheme, setLightSquareTheme] = useState(LightSquareBackground_ana)

  const [whiteTime, setWhiteTime] = useState();
  const [blackTime, setBlackTime] = useState();
  const [isWhiteTurn, setIsWhiteTurn] = useState(true);

  const [gameStart, setGameStart] = useState(false)
  const [GameData, setGameData] = useState()

  let prevTime = isWhiteTurn ? whiteTime : blackTime;
  const [sound, setSound] = useState(null);
  const [isGameNotificationSend, setIsNotificationSend] = useState(false)

  const [opponentInfo, setOpponentInfo] = useState({
    username: '',
    country: '',
    isPremiumUser: 0,
    normal_mod_puan: 0,
    uzun_mod_puan: 0,
    puzzle_puan: 0,
    toplam_mac_sayisi: 0,
    toplam_normal_mod_mac_sayisi: 0,
    toplam_uzun_mod_mac_sayisi: 0,
    toplam_bulmaca_sayisi: 0,
    win_normal_mod: 0,
    draw_normal_mod: 0,
    lose_normal_mod: 0,
    win_uzun_mod: 0,
    draw_uzun_mod: 0,
    lose_uzun_mod: 0,
    puzzle_elo: 0,
    friends: '',
    profile_durum: '',
    is_online: true,
    inMatch: true,
    notification: '',
    profileFotoUrl: null
  })

  const [MyInfo, setMyInfo] = useState({
    username: '',
    country: '',
    isPremiumUser: 0,
    normal_mod_puan: 0,
    uzun_mod_puan: 0,
    puzzle_puan: 0,
    toplam_mac_sayisi: 0,
    toplam_normal_mod_mac_sayisi: 0,
    toplam_uzun_mod_mac_sayisi: 0,
    toplam_bulmaca_sayisi: 0,
    win_normal_mod: 0,
    draw_normal_mod: 0,
    lose_normal_mod: 0,
    win_uzun_mod: 0,
    draw_uzun_mod: 0,
    lose_uzun_mod: 0,
    puzzle_elo: 0,
    friends: '',
    profile_durum: '',
    is_online: true,
    inMatch: true,
    notification: '',
    profileFotoUrl: null
  })

  const playSound = (moveType) => {
    const sound = new Howl({
      src: [moveType]
    });

    sound.play();
    setSound(sound);
  };

  useEffect(() => {
    const jwtToken = Cookies.get('token'); // Çerezi al

    if (jwtToken) {
      try {
        // JWT'yi çözümle
        const decodedToken = jwtDecode(jwtToken);
        setUsername(decodedToken.username)

        setIsLoggedIn(true)

      } catch (error) {
        console.log('JWT Çözümleme Hatası:', error);
      }
    }
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const veri = {
        username: username,
        socket_id: socket.id
      }
      socket.emit("logged_in", veri)
      setSocket_idim(socket.id)
    }, 500);

  }, [isLoggedIn])

  useEffect(() => {
    const channel = `game_${game_id_sayisi}`;
    const token = PubSub.subscribe(channel, (msg, data) => {
      // console.log("PubSub : ", data)

      const playerData = boardOrientation === 'white' ? data.GameData.whiteData[0] : data.GameData.blackData[0];
      const opponentData = boardOrientation === 'white' ? data.GameData.blackData[0] : data.GameData.whiteData[0];

      const opponentInfo = {
        username: opponentData.username,
        country: opponentData.country,
        isPremiumUser: opponentData.isPremiumUser,
        normal_mod_puan: opponentData.normal_mod_puan,
        uzun_mod_puan: opponentData.uzun_mod_puan,
        puzzle_puan: opponentData.puzzle_puan,
        toplam_mac_sayisi: opponentData.toplam_mac_sayisi,
        toplam_normal_mod_mac_sayisi: opponentData.toplam_normal_mod_mac_sayisi,
        toplam_uzun_mod_mac_sayisi: opponentData.toplam_uzun_mod_mac_sayisi,
        toplam_bulmaca_sayisi: opponentData.toplam_bulmaca_sayisi,
        win_normal_mod: opponentData.win_normal_mod,
        draw_normal_mod: opponentData.draw_normal_mod,
        lose_normal_mod: opponentData.lose_normal_mod,
        win_uzun_mod: opponentData.win_uzun_mod,
        draw_uzun_mod: opponentData.draw_uzun_mod,
        lose_uzun_mod: opponentData.lose_uzun_mod,
        puzzle_elo: opponentData.puzzle_elo,
        friends: opponentData.friends,
        profile_durum: opponentData.profile_durum,
        is_online: opponentData.is_online,
        inMatch: opponentData.inMatch,
        notification: opponentData.notification,
        profileFotoUrl: opponentData.profileFotoUrl
      };

      const myInfo = {
        username: playerData.username,
        country: playerData.country,
        isPremiumUser: playerData.isPremiumUser,
        normal_mod_puan: playerData.normal_mod_puan,
        uzun_mod_puan: playerData.uzun_mod_puan,
        puzzle_puan: playerData.puzzle_puan,
        toplam_mac_sayisi: playerData.toplam_mac_sayisi,
        toplam_normal_mod_mac_sayisi: playerData.toplam_normal_mod_mac_sayisi,
        toplam_uzun_mod_mac_sayisi: playerData.toplam_uzun_mod_mac_sayisi,
        toplam_bulmaca_sayisi: playerData.toplam_bulmaca_sayisi,
        win_normal_mod: playerData.win_normal_mod,
        draw_normal_mod: playerData.draw_normal_mod,
        lose_normal_mod: playerData.lose_normal_mod,
        win_uzun_mod: playerData.win_uzun_mod,
        draw_uzun_mod: playerData.draw_uzun_mod,
        lose_uzun_mod: playerData.lose_uzun_mod,
        puzzle_elo: playerData.puzzle_elo,
        friends: playerData.friends,
        profile_durum: playerData.profile_durum,
        is_online: playerData.is_online,
        inMatch: playerData.inMatch,
        notification: playerData.notification,
        profileFotoUrl: playerData.profileFotoUrl
      };


      setOpponentInfo(opponentInfo);
      setMyInfo(myInfo);
      setWhiteTime(data.GameData.activeGamesVeri.whiteDuration);
      setBlackTime(data.GameData.activeGamesVeri.blackDuration);
      console.log(data.GameData.activeGamesVeri.movesWhite)
      setMovesWhite(data.GameData.activeGamesVeri.movesWhite)
      setMovesBlack(data.GameData.activeGamesVeri.movesBlack)

      setGameData(data.GameData.activeGamesVeri)

      if (boardOrientation === 'white') {
        setRakipSocketID(data.GameData.activeGamesVeri.blackSocketID)
        setRakipUsername(data.GameData.activeGamesVeri.playerBlack)
      } else if (boardOrientation === 'black') {
        setRakipSocketID(data.GameData.activeGamesVeri.whiteSocketID)
        setRakipUsername(data.GameData.activeGamesVeri.playerWhite)
      }


      setIsDataArrived(true)
    });

    return () => {
      PubSub.unsubscribe(token);
    };
  }, [isLoggedIn]);

  const fetchAndStartGame = async () => {
    try {
      setWhiteTime(whiteTime);
      setBlackTime(blackTime);
      setGameStart(true);
    } catch (error) {
      console.error('Error fetching and starting game:', error);
    }
  };

  useEffect(() => {
    const gameStarttimer = setTimeout(() => {
      fetchAndStartGame();
    }, 3000);
    playSound(gameStart_sound)
    return () => clearTimeout(gameStarttimer);
  }, [isLoggedIn]);

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


  // Timer'ları güncelleyen useEffect kısmını değiştir
  useEffect(() => {
    let timer;
    if (!game_over && gameStart) {
      console.log(isWhiteTurn, game)
      timer = setInterval(() => {
        const newTime = isWhiteTurn ? whiteTime - 1 : blackTime - 1;
        console.log(newTime)
        if (isWhiteTurn) {
          setWhiteTime(newTime);
          updateGameTimer(newTime, 'white');
          if (prevTime <= 1) {
            setWhiteTime(0);
            setGameResultMsg(`black wins!`);
            setGame_over(true);
          }
        } else {
          setBlackTime(newTime);
          updateGameTimer(newTime, 'black');
          if (prevTime <= 1) {
            setBlackTime(0);
            setGameResultMsg(`white wins!`);
            setGame_over(true);
          }
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isWhiteTurn, game_over, gameStart, whiteTime, blackTime]);

  // API'ye gönderilecek timer güncelleme fonksiyonu
  const updateGameTimer = async (time, side) => {
    try {
      socket.emit("timecontrol", { game_id, side: side, time: time });
    } catch (error) {
      console.error('Error updating game timer:', error);
    }
  };


  const makeAMove = useCallback(
    (move) => {
      try {
        const result = game.move(move);

        if (result === null) {
          // Eğer hamle geçerli değilse, bir hata mesajı ayarla
          console.error('Invalid move:', move);
          // veya setGameResultMsg('Invalid move: ' + move);
        } else {
          console.log(game.turn())
          console.log("over, checkmate", game.isGameOver(), game.isCheckmate());
          if (game.isGameOver()) { // check if move led to "game over"
            if (game.isCheckmate()) { // if reason for game over is a checkmate
              // Set message to checkmate. 
              if (game.turn() === 'w' && boardOrientation === 'white') {
                const winner = 'black'
                setIsWinner(boardOrientation === winner ? 1 : 0)
                console.log(boardOrientation === winner ? 1 : 0)
                setGameResultMsg(
                  `${winner} wins!`
                );
                console.log(`${winner} wins!`)
                setGame_over(true)

              } else {
                const winner = 'white'
                setIsWinner(boardOrientation === winner ? 1 : 0)
                console.log(boardOrientation === winner ? 1 : 0)
                setGameResultMsg(
                  `${winner} wins!`
                );
                console.log(`${winner} wins!`)
                setGame_over(true)
              }
              // The winner is determined by checking for which side made the last move
            } else if (game.isDraw()) { // if it is a draw
              setGameResultMsg("Draw"); // set message to "Draw"
              setGame_over(true)
            } else {
              setGameResultMsg("Game over");
              setGame_over(true)
            }
          }

          console.log(move)

          if (result.captured) {
            playSound(capture_sounds); // taş kırışma sesi
          } else if (game.isCheck()) {
            playSound(moveCheck_sounds); // Şah sesini çal
          } else if (result.promotion) {
            playSound(promote_sounds); // piyon terfi sesi
          }
          // else if (move.san.includes("0-0") === true) {
          //     playSound(castle_sounds); // rok sesi
          // }
          else {
            playSound(moveSelf_sounds); // yalın hamle sesi
          }
          setFen(game.fen());
        }

        return result;
      } catch (e) {
        console.error('An error occurred while making a move:', e);
        return null;
      }
    },
    [game]
  );

  // const interleaveMoves = (movesWhite, movesBlack) => {
  //   console.log('White Moves:', movesWhite);
  //   console.log('Black Moves:', movesBlack);

  //   let interleavedMoves = [];
  //   for (let i = 0; i < Math.max(movesWhite.length, movesBlack.length); i++) {
  //     if (movesWhite[i]) {
  //       interleavedMoves.push(movesWhite[i]);
  //     }
  //     if (movesBlack[i]) {
  //       interleavedMoves.push(movesBlack[i]);
  //     }
  //   }
  //   return interleavedMoves.join(' ');
  // };

  // useEffect(() => {
  //   if (Array.isArray(movesWhite) && Array.isArray(movesBlack)) {
  //     const interleaved = interleaveMoves(movesWhite, movesBlack);
  //     console.log('Interleaved Moves:', interleaved);

  //     game.loadPgn(interleaved);
  //     setFen(game.fen());
  //   } else {
  //     console.error('movesWhite and movesBlack should be arrays');
  //   }
  // }, [movesWhite, movesBlack]);

  useEffect(() => {
    // "move" event dinleyicisini sadece component mount olduğunda tanımla
    const handleMove = (move) => {
      if (game.turn() === "b") {
        setMovesBlack((prevMoves) => [...prevMoves, move.san]);
      }
      else {
        setMovesWhite((prevMoves) => [...prevMoves, move.san]);
      }
      makeAMove(move);
      setIsWhiteTurn(prevTurn => !prevTurn);
      console.log(move.san)
    };

    socket.on("move", handleMove);
    socket.on("GameTerkReceive", (data) => {
      if (data.status === 'OK') {
        console.log(data)

        setGameResultMsg(`${boardOrientation === 'white' ? 'black' : "white"} wins`)
        setGame_over(true)
        setTimeout(() => {
          navigate(`/game/archive/${game_id_sayisi}`)
        }, 5000)
      }
    });
    socket.on("GameDrawReceive", (data) => {
      if (data.status === 'OK') {
        console.log(data)
        setIsNotificationSend(true)
      }
    });

    // Component unmount olduğunda "move" event dinleyicisini temizle
    return () => {
      socket.off("move", handleMove);
    };
  }, []);

  useEffect(() => {
    // game_over durumu değiştiğinde, "game_over" event'i emit et
    if (game_over) {
      console.log(movesBlack, movesWhite)
      socket.emit("game_over", {
        game_id: 1000000 + game_id,
        gameResultMsg: gameResultMsg,
      });

      // setTimeout(() => {
      //   navigate(`/game/archive/${game_id_sayisi}`)
      // }, 5000)
    }
  }, [game_over]);

  function onDrop(source, target) {
    if (game.turn() !== boardOrientation[0]) {
      console.log("onDrop false")
      return false;
    }

    const moveData = {
      from: source,
      to: target,
      color: game.turn(),
      promotion: "q",
    };

    const move = makeAMove(moveData);
    setIsWhiteTurn(prevTurn => !prevTurn);

    if (move === null) {
      console.error('Invalid move:', moveData);
      // veya setGameResultMsg('Invalid move: ' + moveData);
      return false;
    }

    if (game.turn() === "b") {
      setMovesWhite((prevMoves) => [...prevMoves, move.san]);
    } else {
      setMovesBlack((prevMoves) => [...prevMoves, move.san]);
    }

    socket.emit("move", {
      move,
      game_id: 1000000 + game_id,
      username,
      rakip_username: rakipUsername,
      rakip_socketID: rakipSocketID,
      side: boardOrientation
    });

    return true;
  }

  const handleMoveForward = () => {
    game.move(movesWhite[currentMoveIndex]);
    game.move(movesBlack[currentMoveIndex]);
    let history = game.history()
    setFen(game.fen(history));
  };

  const handleMoveBackward = () => {
    game.undo();
    let history = game.history()
    setFen(game.fen(history));
  };

  const gotoHome = () => {
    navigate(`/home/${username}`)
  }



  const board_setting_on_btn = () => {
    if (game_over) {
      document.querySelector(".board_setting_on").style.display = 'none';
    } else {
      document.querySelector(".board_setting_on").style.display = 'flex';
    }
  }
  const board_setting_off_btn = () => {
    document.querySelector(".board_setting_on").style.display = 'none';
  }

  const GameLeaveButton = () => {
    //   console.log("terk", rakip_socketID)
    //   socket.emit("GameTerk", rakip_socketID)
    //   setGameResultMsg(`${boardOrientation === 'white' ? 'black' : "white"} wins`)
    //   setGame_over(true)
    //   setTimeout(() => {
    //     navigate(`/game/archive/${game_id_sayisi}`)
    //   }, 5000)
  }

  const GameDrawOfferButton = () => {
    //   console.log("berabere", rakip_socketID)
    //   socket.emit("GameDraw", rakip_socketID)
  }
  const teklifKabul = () => {
    //   console.log("kabul", rakip_socketID)
    //   setIsNotificationSend(false)
    //   socket.emit("GameDrawKabul", rakip_socketID)
  }

  const teklifreddet = () => {
    //   console.log("reddet", rakip_socketID)
    //   setIsNotificationSend(false)
    //   socket.emit("GameDrawReddet", rakip_socketID)
  }

  // const startPlaying = () => {
  //   if (playing) return;
  //   setPlaying(true);

  //   playIntervalRef.current = setInterval(() => {
  //     console.log(`Current Move Index: ${moveIndex}`);
  //     console.log(`History Length: ${history.length}`);

  //     if (moveIndex < history.length - 1) {
  //       console.log(moveIndex + 1)
  //       navigateToMove(moveIndex + 1);
  //     } else {
  //       stopPlaying();
  //     }
  //   }, 1000);
  // };

  // const stopPlaying = () => {
  //   if (playIntervalRef.current) {
  //     clearInterval(playIntervalRef.current);
  //     playIntervalRef.current = null;
  //   }
  //   setPlaying(false);
  // };

  return (
    <>
      {isDataArrived ? (
        <div className='allContainerPlay'>

          <div className='play_sol_section'>
            <div id='play_sol_section_rakip'>
              <div>
                {opponentInfo.profileFotoUrl === null ? (
                  <>
                    <img id='play_sol_section_rakip_img' src={user_home_default_profile_img} alt="" />
                  </>) : (
                  <>
                    <img id='play_sol_section_rakip_img' src={`${SERVER_URL}/${opponentInfo.profileFotoUrl}`} alt="" />
                  </>)}
              </div>
              <div>
                <span className='play_sol_section_rakip_name'>{opponentInfo.username} ({opponentInfo.normal_mod_puan})</span>
              </div>
            </div>

            {isGameNotificationSend ? (
              <div>
                <div>Beraberlik ?</div>
                <button onClick={teklifKabul}>Evet</button>
                <button onClick={teklifreddet}>Hayır</button>
              </div>) : (<></>)}

            <div id='play_sol_section_orta'>
              <div id='play_sol_section_timer'>
                {(boardOrientation === 'white' ? (
                  <>
                    <div className='play_rakip_timer_container'>
                      <span className='play_rakip_timer'>
                        {Math.floor(blackTime / 60)}:{(blackTime % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <div className='play_me_timer_container'>
                      <span className='play_me_timer'>
                        {Math.floor(whiteTime / 60)}:{(whiteTime % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  </>

                ) : (<>
                  <div className='play_rakip_timer_container'>
                    <span className='play_rakip_timer'>
                      {Math.floor(whiteTime / 60)}:{(whiteTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                  <div className='play_me_timer_container'>
                    <span className='play_me_timer'>
                      {Math.floor(blackTime / 60)}:{(blackTime % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </>))}

              </div>

              <div id='play_sol_section_tools'>
                {game_over ? (
                  <></>
                ) : (
                  <>
                    <img onClick={GameLeaveButton} className='flag_icon' src={flag_icon} alt="" />
                    <img onClick={GameDrawOfferButton} className='half_icon' src={half} alt="" />
                  </>
                )}
              </div>
            </div>

            <div id='play_sol_section_me'>
              <div>
                {MyInfo.profileFotoUrl === null ? (
                  <>
                    <img id='play_sol_section_my_img' src={user_home_default_profile_img} alt="" />
                  </>) : (
                  <>
                    <img id='play_sol_section_my_img' src={`${SERVER_URL}/${MyInfo.profileFotoUrl}`} alt="" />
                  </>)}
              </div>
              <div>
                <span className='play_sol_section_my_name'>{MyInfo.username} ({MyInfo.normal_mod_puan})</span>
              </div>
            </div>
            {/* <div>White Time: {Math.floor(whiteTime / 60)}:{(whiteTime % 60).toString().padStart(2, '0')}</div>
        <div>Black Time: {Math.floor(blackTime / 60)}:{(blackTime % 60).toString().padStart(2, '0')}</div> */}
          </div>

          <div className='board-container-normal'>
            <div className='board'>
              <Chessboard
                position={fen}
                onPieceDrop={onDrop}
                // arePremovesAllowed={true}
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
                  boardOrientation === "white" ? "white" : "black"
                }
              />
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
              <div className={`board-result ${game_over ? 'display-flex' : 'display-none'}`}>
                <div id='game_result_title' className={`${isWinner ? 'game_result_title_winner' : 'game_result_title_loser'}`}>
                  <FontAwesomeIcon icon={faTrophy} style={{ color: "#A9A9A9", }} className='game_result_title_img' />
                  <span className='font-weight-700'>{isWinner ? `You Won` : `${boardOrientation} Won`}</span>
                </div>
                <div>

                </div>
                <div className='board-result-ara'>

                </div>
                <div className='board-result-homebtn' onClick={gotoHome}>
                  <FontAwesomeIcon icon={faHouse} size="lg" style={{ color: "#939291", }} />
                  <span className='span-21 mrgn-l-10'>Home</span>
                </div>
              </div>
            </div>
            <div className="board_setting_off">
              <FontAwesomeIcon onClick={board_setting_on_btn} icon={faGear} />
            </div>
          </div>
          <div className='board-istatistik-area'>
            <div className="board-istatistik-area-top">
              <div>
                <FontAwesomeIcon icon={faChessKing} style={{ color: "#A9A9A9", }} className="board-istatistik-area-top-img" />
                <span className="span-24">Play</span>
              </div>
            </div>
            <div className='moves-container'>
              {/* <div className='moves-white-area'>
                {Array.isArray(movesWhite) ? (
                  movesWhite.map((move, index) => (
                    <div className="move-area" key={index}>
                      {move}
                    </div>
                  ))
                ) : (
                  <></>
                )}
              </div>

              <div className='moves-black-area'>
                {Array.isArray(movesBlack) ? (
                  movesBlack.map((move, index) => (
                    <div className="move-area" key={index}>
                      {move}
                    </div>
                  ))
                ) : (
                  <></>
                )}
              </div> */}
            </div>

            <div className='moves-button-ara'></div>

            <div className='moves-button-area'>

              <button onClick={handleMoveBackward}>
                <FontAwesomeIcon icon={faAngleLeft} />
              </button>
              <div className='movesButtons-ara'></div>

              <button onClick={handleMoveBackward}>
                <FontAwesomeIcon icon={faAngleLeft} />
              </button>
              <div className='movesButtons-ara'></div>

              {playing ? (<>
                <button disabled={!playing}>
                  <FontAwesomeIcon icon={faPause} />
                </button>
              </>) : (<>
                <button disabled={playing}>
                  <FontAwesomeIcon icon={faPlay} />
                </button>
              </>)}
              <div className='movesButtons-ara'></div>

              <button onClick={handleMoveForward}>
                <FontAwesomeIcon icon={faAngleRight} />
              </button>

              <div className='movesButtons-ara'></div>

              <button onClick={handleMoveForward}>
                <FontAwesomeIcon icon={faAngleRight} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div id='reloader'>
          <div className='w-center h-center flex_drc_column'>
            <CircularLoader />
            <span className='mrgn-t-20'>Veriler yükleniyor...</span>
          </div>
        </div>
      )}
    </>
  );
}

export default ChessBoardPlay;
