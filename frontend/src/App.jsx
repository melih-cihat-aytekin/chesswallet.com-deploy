import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GHome from "./pages/GlobalHome/GHome.jsx";
import GRegister from "./pages/GlobalRegister/GRegister.jsx";
import UserHome from "./pages/UserHome/UserHome.jsx";
import axios from 'axios'
import Login from "./pages/GLoginPage/GLoginPage.jsx";
import Play from "./pages/Play/Play.jsx";
import Wallet from "./pages/Wallet/Wallet.jsx";
import GameArchive from "./pages/GameArchive/GameArchive.jsx";
import SolvingPuzzles from "./pages/SolvingPuzzles/SolvingPuzzles.jsx";
import UserStatistic from "./pages/UserStatistic/UserStatistic.jsx";
import NavigateStatistic from "./pages/UserStatistic/NavigateStatisticPage.jsx";
import Admin from "./pages/Admin/Admin/Admin.jsx";
import GlobalPremiumPage from "./pages/GlobalPremiumPage/GlobalPremiumPage.jsx";
import { ADMIN_URL } from "./helper";
import Tournaments from "./pages/Tournaments/Tournaments.jsx";
import TournamentsPlay from "./pages/Tournaments/TournamentsPlay.jsx";
import PlayComputer from "./pages/PlayComputer/PlayComputer.jsx";
import Computer from "./pages/PlayComputer/Computer.jsx";
import UserProfile from "./pages/UserProfile/UserProfile.jsx";
import Leaderboards from "./pages/Leaderboards/Leaderboards.jsx";
import Analysis from "./pages/Analysis/Analysis.jsx";
import ChooseUsername from "./ChooseUsername.jsx";
import EmailValidate from "./EmailValidate.jsx";

function App() {


  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route>
            <Route exact path="/" element={<GHome />} />
            <Route exact path={`/${ADMIN_URL}`} element={<Admin />} />

            <Route exact path={`/${ADMIN_URL}/:profil`} element={<Admin />} />
            <Route exact path={`/${ADMIN_URL}/:top`} element={<Admin />} />
            <Route exact path={`/${ADMIN_URL}/:games`} element={<Admin />} />
            <Route exact path={`/${ADMIN_URL}/:puzzles`} element={<Admin />} />
            <Route exact path={`/${ADMIN_URL}/:tournaments`} element={<Admin />} />
            <Route exact path={`/${ADMIN_URL}/:users`} element={<Admin />} />
            <Route exact path={`/${ADMIN_URL}/:posts`} element={<Admin />} />
            <Route exact path="/register" element={<GRegister />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/home/:username" element={<UserHome />} />
            <Route exact path="/:username/wallet" element={<Wallet />} />
            <Route exact path="/game/live/:game_id_sayisi" element={<Play />} />
            <Route exact path="/game/archive/:game_id_sayisi" element={<GameArchive />} />
            <Route exact path="/puzzles/:puzzleid" element={<SolvingPuzzles />} />
            <Route exact path="/statistic/:username_url" element={<UserStatistic />} />
            <Route exact path="/statistic" element={<NavigateStatistic />} />
            <Route exact path="/premium" element={<GlobalPremiumPage/>} />
            <Route exact path="/tournaments" element={<Tournaments/>} />
            <Route exact path="/tournaments/:tournamentID" element={<Tournaments/>} />
            <Route exact path="/tournaments/:tournamentID/:gameID" element={<TournamentsPlay/>} />
            <Route exact path="/play/computer" element={<Computer/>} />
            <Route exact path="/play/computer/:game_id_sayisi" element={<PlayComputer/>} />
            <Route exact path="/:username/profile" element={<UserProfile/>} />
            <Route exact path="/statistic/:username" element={<UserStatistic/>} />
            <Route exact path="/leaderboard" element={<Leaderboards/>} />
            <Route exact path="/analysis" element={<Analysis/>} />
            <Route exact path="/chooseusername" element={<ChooseUsername/>} />
            <Route exact path="/verify-email" element={<EmailValidate/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
