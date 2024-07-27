import React, { Component, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import axios from "axios";
import jwtDecode from 'jwt-decode'
import Cookies from 'js-cookie'
import './GHome.css'
import '../../components/assets/css/public.css'
import GHome_Tahta from '../../components/assets/img/tahta.png'
import GHome_Siralama from '../../components/assets/img/home-nasil-img.png'
import GHome_Bulmaca from '../../components/assets/img/board-puzzles.png'
import GHome_Hikaru from '../../components/assets/img/hikaru-nakamura.jpg'
import GHome_YT from '../../components/assets/img/youtube-icon.png'
import GHome_TW from '../../components/assets/img/twitter-icon.png'
import GHome_INS from '../../components/assets/img/instagram-icon.png'
import GHome_TK from '../../components/assets/img/tiktok-icon.png'
import { SERVER_URL } from "../../helper.js";


function GHome() {
  const [totalWinnerCash, setTotalWinnerCash] = useState(0)
  const [totalActiveMatch, setTotalActiveMatch] = useState(0)

  const canli_oyun_sayisi = 80000
  const toplam_kazanan = 1000

  const navigate = useNavigate()

  useEffect(() => {
    const jwtToken = Cookies.get('token');
    getTotalWinnerCash()

    if (jwtToken) {
      try {
        // JWT'yi çözümle
        const decodedToken = jwtDecode(jwtToken);

        navigate(`/home/${decodedToken.username}`)
        // navigate(`/dashboard`)
      } catch (error) {
        console.log('JWT Çözümleme Hatası:', error);
      }
    }
  }, [])

  const getTotalWinnerCash = async () => {
    try {
      const res = await axios.get(`${SERVER_URL}/GhomeVeri`)
      if (res.data.status === 'OK') {
        setTotalWinnerCash(res.data.veri.TopWinnerCash.TopWinnerCash)
        setTotalActiveMatch(res.data.veri.toplam_satir.toplam_satir)
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <div className="mobile-warning">
        <div>CHESSWALLET.COM</div>
        <h2>Currently, we only provide services in a computer environment</h2>
      </div>
      <div className='ghome_section'>
        <div className='ghome_section_con'>
          <section id='section1_top_title'><div>CHESSWALLET.COM</div></section>

          <section id='section2'>

            <div id='section2_sol'>
              <img src={GHome_Tahta} alt="board" />
            </div>

            <div id='section2_ara'></div>

            <div id='section2_sag'>

              <div id='section2_title'>
                <span>PLAY CHESS</span><br />
                <span>EARN MONEY</span>
              </div>

              <div id='section2_istatistik'>
                <span>{totalActiveMatch} Games Currently</span>
                <span>{totalWinnerCash} Total Winners</span>
              </div>

              <div id='section2_btn'>
                <a href="/register"><button>PLAY</button></a>
              </div>
            </div>
          </section>

          <section id='section3'>
            <div id='section3_sol'>
              <div id='section3_sol_title'>Satranç Oynayarak Nasıl Para Kazanabilirim</div>
              <div id='section3_sol_p'>
                <p>Chesswallet.com herhangi seviyede üyelikleri bulunan kullanıcılara kendi düzenlediği haftalık ödüllü turnuvalar ve liglere katılma hakkı tanır.</p>
                <div></div>
                <p>Ödüllü turnuva veya liglere katılıp ilk üçe girenlere chesspoint verilir. Kulanıcılar bunları biriktirerek para dönüştürürler ve girdikleri hesaba en geç hafta sonuna kadar parası yatırılır.</p>
              </div>
            </div>
            <div id='section_3_sag'>
              <img src={GHome_Siralama} alt="Nasıl" />
            </div>
          </section>

          <section id='section4'>
            <div id='section4_sol'>
              <div id='section4_sol_title'>Satranç Bulmacaları Çözün</div>
              <div id='section4_sol_yazi'>
                <div id='section4_sol_yazi_title'>Bulmaca çözün, gelişin, daha iyi oynayın</div>
                <div></div>
                <div id='section4_sol_yazi_alt'>
                  <img src={GHome_Hikaru} alt="Hikaru Nakamura" />
                  <div>
                    <p>"Kalıpları tanımayı geliştirmek için en iyi yol bulmacalardır."</p>
                    <div></div>
                    <button disabled='true'><strong>GM</strong></button><span>Hikaru Nakamura</span>
                  </div>
                </div>
              </div>
            </div>
            <div id='section_4_sag'>
              <img src={GHome_Bulmaca} alt="Nasıl" />
            </div>
          </section>

          <section id='section5'>
            <div id='section5_sol'>
              <a href='https://www.youtube.com/chesswallet.com'><img src={GHome_YT} alt="Youtube" /></a>
              <a href='https://www.twitter.com/chesswallet.com'><img src={GHome_TW} alt="Twitter" /></a>
            </div>
            <div id='section5_orta'>Sosyal Media</div>
            <div id='section5_sag'>
              <a href='https://www.instagram.com/melih_ytkn'><img src={GHome_INS} alt="Instagram" /></a>
              <a href='https://www.tiktok.com/chesswallet.com'><img src={GHome_TK} alt="Tiktok" /></a>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

export default GHome;
