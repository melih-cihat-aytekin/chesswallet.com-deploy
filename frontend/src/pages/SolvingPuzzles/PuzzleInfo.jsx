import React, { useEffect, useState, useMemo } from 'react';
import './PuzzleInfo.css'
import { Across_img, Correct_img, LeftMini, Toggle, Find_lamb } from '../../components/assets/js/icon.jsx';
import { useNavigate } from 'react-router';
import './../../components/assets/css/auto.css'

import user_home_default_profile_img from '../../components/assets/img/user_profile_kare_img_melih_ytkn.jpeg'
import Stopwatch from '../../components/assets/js/StopWatch.jsx';

function PuzzleInfo({ isPuzzleTrue, side, puzzleRating, moves, isHamleYanlis, ratingDeviation, handleHintClick, handleNextPuzzleClick, handleReturnClick }) {
    const navigate = useNavigate()

    const [toggled, setToggled] = useState(false);
    const [isStart, setIsStart] = useState(true);

    useEffect(() => {
        setToggled(true)
    }, [])

    if (isHamleYanlis) {
        console.log(`-${ratingDeviation}`)
    }

    const logState = () => {
        if (toggled) {
            document.querySelector("body").style.backgroundColor = "#262522";
            setToggled(false)
        } else {
            document.querySelector("body").style.backgroundColor = "white";
            setToggled(true)
        }
    };

    const ipucu = () => {
        // handleHintClick fonksiyonunu çağırın.
        handleHintClick();
    };

    const nextPuzzle = () => {
        // handleHintClick fonksiyonunu çağırın.
        handleNextPuzzleClick();
    };

    const returnPuzzle = () => {
        // handleHintClick fonksiyonunu çağırın.
        handleReturnClick();
    };


    const gotoPuzzles = () => {
        navigate("/puzzles")
    }

    return (
        <div className='puzzleInfoContainer'>

            <section id='puzzleInfoTitleArea' className={isPuzzleTrue ? `bg-green-win` : (isHamleYanlis ? `bg-green-lose` : `bg-grey`)}>
                <div id='puzzleInfoTitleAreaLeftBtn' onClick={gotoPuzzles}>
                    <LeftMini color={"white"} strokeWidth={'80px'} />
                </div>

                {isPuzzleTrue ? (
                    <div id='puzzleInfoTitleAreaOrtaAlan'>
                        {/* <img className='check-green-img' src={correct_img} alt="" /> */}
                        <Correct_img color={"white"} strokeWidth={'80px'} />

                        <div id='puzzleInfoTitleAreaOrtaAlanText'>
                            <span className='span-27 mrgn-l-10'><b>Doğru</b></span>
                        </div>
                    </div>
                ) : (
                    <>
                        {
                            isHamleYanlis ? (
                                <div id='puzzleInfoTitleAreaOrtaAlan'>
                                    {/* <img className='check-green-img' src={correct_img} alt="" /> */}
                                    <Across_img color={"white"} strokeWidth={'80px'} />

                                    <div id='puzzleInfoTitleAreaOrtaAlanText'>
                                        <span className='span-27 mrgn-l-10 '><b>Yanlış</b></span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {side === "w" ? (
                                        <div id='puzzleInfoTitleAreaOrtaAlan'>
                                            <div id='puzzleInfoTitleAreaOrtaAlanKare' className='kare-puzzle-white' />
                                            <div id='puzzleInfoTitleAreaOrtaAlanText'>
                                                <span className='span-27 mrgn-l-10'><b>Beyaz</b></span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div id='puzzleInfoTitleAreaOrtaAlan'>
                                            <div id='puzzleInfoTitleAreaOrtaAlanKare' className='kare-puzzle-black'>

                                            </div>
                                            <div id='puzzleInfoTitleAreaOrtaAlanText'>
                                                <span className='span-27 mrgn-l-10'><b>Siyah</b></span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )
                        }
                    </>
                )}
            </section >
            {/* <section>
                <Toggle
                    label=""
                    toggled={toggled}
                    onClick={logState}
                />
            </section> */}

            <section id='puzzleInfoAnaArea'>
                <img id="user_home_default_profile_img" src={user_home_default_profile_img} alt="" />
                <div id='puzzleInfoAnaAreaText'>
                    <span className='font-gl span-30 mrgn-l-30 font-weight-800'>{puzzleRating}</span>
                    <span className={`span-20 ${isPuzzleTrue ? "color-green" : (isHamleYanlis ? "color-red" : "color-black")} mrgn-t-10 mrgn-l-10`}>{isPuzzleTrue ? (<div>+{ratingDeviation}</div>) : (isHamleYanlis ? (<div>-{ratingDeviation}</div>) : (<div></div>))}</span>
                </div>
                <div id='puzzleInfoAnaAreaCrono'>
                    <Stopwatch isStart={isStart} />
                </div>
            </section>

            <section id='puzzleInfoAnaAra'></section>

            <section id='puzzleInfoAnaButtonArea'>
                {isPuzzleTrue ? (
                    <div id='puzzleInfoAnaButtonAreaNext'>
                        <div id='puzzleInfoAnaButtonAreaNextÜst'>
                            <button className='puzzleInfoAnaButton' onClick={nextPuzzle}>Sıradaki Bulmaca</button>
                        </div>
                        <div id='puzzleInfoAnaButtonAreaNextAlt'>

                        </div>
                    </div>) : (isHamleYanlis ? (
                        <div id='puzzleInfoAnaButtonAreaTekrar'>
                            <div id='puzzleInfoAnaButtonAreaTekrarÜst'>
                                <button className='puzzleInfoAnaButton' onClick={returnPuzzle}>Tekrar</button>
                            </div>
                            <div id='puzzleInfoAnaButtonAreaTekrarAlt'>

                            </div>
                        </div>) : (

                        <div id='puzzleInfoAnaButtonAreaIpucu'>
                            <div id='puzzleInfoAnaButtonAreaIpucuÜst'>
                                <button className='puzzleInfoAnaButton' onClick={ipucu}>
                                    {/* <Find_lamb color={"white"} strokeWidth={'150px'} /> */}
                                    Ipucu</button>
                            </div>
                            <div id='puzzleInfoAnaButtonAreaIpucuAlt'>

                            </div>
                        </div>))}
            </section>

            {/* <section>
                <div>
                    {
                        moves[0].map((move, i) =>
                            <div key={i}>
                                {move}
                            </div>
                        )
                    }
                </div>
            </section> */}
        </div >
    )
}

export default PuzzleInfo