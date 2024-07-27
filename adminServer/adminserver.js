const mysql = require("mysql2");
const cors = require("cors");

const express = require('express');
const app = express();
const http = require('http')
const server = http.createServer(app)
const { v4: uuidv4 } = require('uuid');

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken')
const fileupload = require('express-fileupload')

const bcrypt = require("bcrypt");
const saltRounds = 10;

const PORT = 1903

app.use(express.json());
app.use(fileupload());
app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// const db = mysql.createConnection({
//     host: 'chessplay-site.ccipuqjvw7qe.us-east-1.rds.amazonaws.com',
//     user: 'admin',
//     password: 'Melih0858',
//     database: 'chessplaysite',
//     port: 3306,
// });
 

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chesswallet.com',
    port : 3306,
  });

db.connect((err) => {
    if (err) {
        console.error('MySQL bağlantısı başarısız:', err);
    } else {
        console.log('MySQL bağlantısı başarıyla sağlandı!');
    }
})

app.get("/", (req, res) => {
    res.send("hello worlddd");
})

app.get("/admin_fetch_info", (req, res) => {
    res.json(
        {
            admin_user_isLogged: true,
            adminname: "melihytkn",
        }
    )
})

app.get("/admin_fetch_tournaments_info", async (req, res) => {

    try {
        const selectQuery = "SELECT * FROM tournaments";
        db.query(selectQuery, (err, result) => {
            if (err) throw err;

            if (result.length > 0) {

                res.send({
                    admin_user_isLogged: true,
                    message: "GELDİ",
                    result: result
                })
            } else {
                console.log("Turnuva Yok")
                res.send({
                    message: "Turnuva Yok"
                })
            }
        });
    } catch (error) {
        console.log("Hata")
    }
})

app.get("/admin_fetch_top_info", async (req, res) => {

    try {
        const selectQuery = "SELECT * FROM admin";
        db.query(selectQuery, (err, result) => {
            if (err) throw err;

            if (result.length > 0) {

                res.send({
                    admin_user_isLogged: true,
                    message: "GELDİ",
                    result: result[0]
                })
                console.log(result[0])
            } else {
                console.log("Veri Yok")
                res.send({
                    message: "Veri Yok"
                })
            }
        });
    } catch (error) {
        console.log("Hata")
    }
})

const tournamentsLists = new Map();

app.post("/createTournaments", async (req, res) => {
    const { tournamentName, selectedDate, selectedTime, tournamentDuration, formattedSelectedDate } = req.body

    const datePart = formattedSelectedDate; // "DD/MM/YYYY" formatında
    const timePart = selectedTime + ':00';
    const [day, month, year] = datePart.split("/");
    const [hour, minute, second] = timePart.split(":");
    const datetime = new Date(`${day}-${month}-${year}T${hour}:${minute}:${second}`);
    const mysqlDatetime = datetime.toISOString().slice(0, 19).replace("T", " ");

    try {
        const customUUID = uuidv4().replace(/-/g, '').substr(0, 8);
        const insertQuery = "INSERT INTO tournaments (tournamentID, tournamentName, tournamentDate, tournamentDuration, JoinPlayerCount ,JoinPlayer) VALUES (?, ?, ?, ?, ?, ?)";
        db.query(insertQuery, [customUUID, tournamentName, mysqlDatetime, tournamentDuration, 0, ''], (err) => {
            if (err) throw err;
            console.log("Tournament inserted successfully.");
            res.send({
                isCreate: true,
                message: "Tournament inserted successfully."
            })
        });

    } catch (error) {
        console.log(error)
    }
})

server.listen(PORT, (err) => {
    if (err) {
        console.log("Hata")
    } else {
        console.log("Admin Server is running...")
    }
})