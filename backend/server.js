const mysql = require("mysql2");
const { spawn } = require('child_process');
const fs = require('fs');
const cors = require("cors");
const nodemailer = require('nodemailer');
require('dotenv').config()

const multer = require('multer');
const express = require('express');
const app = express();
const http = require('http')


var Iyzipay = require('iyzipay');

const { v4: uuidV4 } = require('uuid');
const crypto = require('crypto');
const path = require('path');

const { Server } = require('socket.io');
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
})

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require('jsonwebtoken')

const bcrypt = require("bcrypt");
const { error } = require("console");
const saltRounds = 10;

const PORT = 5000
const STOCKFISH_PATH = process.env.STOCKFISH_PATH || './backend/stockfish/stockfish.exe';

app.use(express.json());
app.use(express.static('public'))
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const transporter = nodemailer.createTransport({
  host: 'smtp.eu.mailgun.org',
  port: 587,
  auth: {
    user: 'postmaster@chesswallet.com',
    pass: '7235411f2903afc22c55f962de63ee18-0f1db83d-2f294bc0'
  }
});

const sendMail = async (senderEmail, receiverEmail, emailSubject, emailBody) => {
  try {
    const info = await transporter.sendMail({
      from: `Chesswallet <${senderEmail}>`, // Gönderen adresi
      to: receiverEmail, // Alıcı adresi
      subject: emailSubject, // Konu
      text: emailBody, // Düz metin içerik
      html: `<p>${emailBody}</p>`, // HTML içerik
    });

    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email: ', error);
  }
};

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: '123', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: "134562537385-2hasi202vq655774fie68t1un9g8i4j9.apps.googleusercontent.com",
  clientSecret: "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",
  callbackURL: 'http://localhost:5000/auth/google/callback',
},
  (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
      if (err) return done(err);

      if (results.length > 0) {
        return done(null, results[0]);
      } else {
        const newUser = {
          username: '',
          email: email,
          googleID: profile.id,
          password: 0,
          isEmailVerify: 0
        };

        db.query('INSERT INTO users SET ?', newUser, (err, res) => {
          if (err) return done(err);

          newUser.id = res.insertId;
          return done(null, newUser);
        });

      }
    });
  }));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/', }),
  (req, res) => {
    console.log("2222     :    ", req.user)
    const tokenWithoutUser = jwt.sign({ email: req.user.email }, 'your_jwt_secret', { expiresIn: '1h' });
    console.log("tokenWithoutUser : ", tokenWithoutUser)
    if (req.user.username) {
      const tokenWithUser = jwt.sign({ username: req.user.username, email: req.user.email }, 'your_jwt_secret', { expiresIn: '1h' });
      console.log("tokenWithUser : ", tokenWithUser)
      res.redirect(`http://localhost:3000/home/${req.user.username}?token=${tokenWithUser}`);
    } else {
      res.redirect(`http://localhost:3000/chooseusername?token=${tokenWithoutUser}`);
    }
  }
);

app.post('/saveusername', (req, res) => {
  try {
    const token = req.body.tokenJWT;
    console.log("1111     :    ", req.body)
    console.log(token)

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, 'your_jwt_secret', (err, decoded) => {
      console.log(decoded)

      const userEmail = decoded.email;
      const username = req.body.username;

      const tokenEmail = jwt.sign({ email: userEmail, username }, 'secret_key', { expiresIn: '1h' });
      const verificationLink = `http://localhost:3000/verify-email?token=${tokenEmail}`;

      db.query('UPDATE users SET username = ? WHERE email = ?', [username, userEmail], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Database update failed' });
        }
        let country = "Turkey"
        db.query('INSERT INTO user_statistics (username, country, isPremiumUser, normal_mod_puan, uzun_mod_puan, puzzle_puan, toplam_mac_sayisi, toplam_normal_mod_mac_sayisi, toplam_uzun_mod_mac_sayisi, toplam_bulmaca_sayisi, win_normal_mod, draw_normal_mod, lose_normal_mod, win_uzun_mod, draw_uzun_mod, lose_uzun_mod, puzzle_elo, friends, profile_durum, is_online, inMatch, notification, profileFotoUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ', [username, country, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, '', null], (err) => {
          if (err) console.log(err)
          console.log("İstatistik Kayıt Başarılı")
        })

        db.query('INSERT INTO wallet (username, coins, transactions) VALUES (?, ?, ?) ', [username, 0, '[]'], (err) => {
          if (err) console.log(err)
          console.log("Wallet Kayıt Başarılı")
        })
        const token = jwt.sign({ username: username, email: userEmail }, 'your_jwt_secret', { expiresIn: '1h' });

        // Test e-posta bilgileri
        let senderEmail = 'email@chesswallet.com';
        let receiverEmail = userEmail;
        let emailSubject = `Hi, ${username} => Email Verification`;
        let emailBody = `Please verify your email by clicking the following link: ${verificationLink}`;

        // E-posta gönderme fonksiyonunu çağırın
        sendMail(senderEmail, receiverEmail, emailSubject, emailBody);
        res.status(200).json({ message: 'Username saved successfully', token });
      });
    });
  } catch (error) {
    console.log(error)
    return res.status(401).json({ message: 'Failed to authenticate token' });
  }
});

app.post('/verify-email', (req, res, err) => {
  try {
    const { email, tokenEmail } = req.body;
    console.log(email, tokenEmail)
    console.log(req.body)

    const decoded = jwt.verify(tokenEmail, 'secret_key');
    const username = decoded.username
    console.log(decoded, email === decoded.email)
    if (email === decoded.email) {
      db.query('UPDATE users SET isEmailVerify = ? WHERE email = ?', [1, email], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Database update failed' });
        }
        console.log("Email Verified successfully")
        res.status(200).json({ message: 'Email Verified successfully', username });
      })
    }
  } catch (error) {
    console.log(error)
    res.status(400).send('Invalid token');
  }
});

app.get("/", (req, res) => {
  res.send("hello worl");
})

app.get("/GhomeVeri", (req, res) => {
  db.query('SELECT TopWinnerCash FROM admin', (err, results) => {
    if (err) return done(err);

    if (results.length > 0) {
      db.query('SELECT COUNT(*) AS toplam_satir FROM active_games', (err, toplam_satir) => {
        if (err) return console.log(err);

        const veri = {
          TopWinnerCash: results[0],
          toplam_satir: toplam_satir[0],
        };
        res.status(200).json({ status: 'OK', veri})

      });
    }
  });
})

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/users/")
  },
  filename: (req, file, cb) => {
    // console.log(file)
    const originalname = file.originalname; // Dosyanın orijinal adını al
    const username = originalname.split('.')[0]
    const extension = originalname.split('.').pop(); // Dosya uzantısını al

    const newFilename = `${username}.png`; // Yeni dosya adını oluştur

    cb(null, newFilename); // Yeni dosya adını kullanarak callback'i çağır
  },
})

const upload = multer({ storage: storage })

// const db = mysql.createConnection({
//   host: 'chessplay-site.ccipuqjvw7qe.us-east-1.rds.amazonaws.com',
//   user: 'admin',
//   password: 'Melih0858',
//   database: 'chessplaysite',
//   port : 3306,
// });

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'chesswallet.com',
  port: 3306,
  multipleStatements: true
});


db.connect((err) => {
  if (err) {
    console.error('MySQL bağlantısı başarısız:', err);
  } else {
    console.log('MySQL bağlantısı başarıyla sağlandı!');
  }
})


app.post('/uploadPhoto', upload.single("image"), async (req, res) => {
  try {
    // Yüklenen resmi al
    const image = req.file;
    console.log("files", req.file.originalname)
    const filename = req.file.originalname
    const username = (req.file.originalname).split('.')[0]
    if (!image) {
      return res.status(400).json({ status: 'error', message: 'Resim yüklenemedi.' });
    }

    dbQuery('UPDATE user_statistics SET profileFotoUrl = ? WHERE username = ?', [`users/${filename}`, username]);
    res.status(200).json({ status: 'success', message: 'Resim başarıyla yüklendi.', imagePath: image.path });
    // İşlemleri tamamlandıktan sonra istemciye yanıt gönder
  } catch (error) {
    console.log(error)
  }

});

app.post("/payment", (req, res) => {

  const id = uuidV4()
  const { price, cardUserName, cardNumber, expireDate, cvc, registerCard, username } = req.body

  var iyzipay = new Iyzipay({
    apiKey: process.env.PAYMENT_API_KEY,
    secretKey: process.env.PAYMENT_SECRET_KEY,
    uri: 'https://sandbox-api.iyzipay.com'
  });

  var request = {
    locale: "tr",
    conversationId: id,
    price: price,
    paidPrice: price,
    currency: "TRY",
    installment: '1',
    paymentChannel: "WEB",
    paymentGroup: "PRODUCT",
    paymentCard: {
      cardHolderName: cardUserName,
      cardNumber,
      expireMonth: expireDate.split("/")[0],
      expireYear: "20" + expireDate.split("/")[1],
      cvc,
      registerCard: registerCard
    },
    buyer: {
      id: 'BY789',
      name: 'John',
      surname: 'Doe',
      gsmNumber: '+905350000000',
      email: 'email@email.com',
      identityNumber: '74300864791',
      lastLoginDate: '2015-10-05 12:43:35',
      registrationDate: '2013-04-21 15:12:09',
      registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
      ip: '85.34.78.112',
      city: 'Istanbul',
      country: 'Turkey',
      zipCode: '34732'
    },
    shippingAddress: {
      contactName: 'Jane Doe',
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
      zipCode: '34742'
    },
    billingAddress: {
      contactName: 'Jane Doe',
      city: 'Istanbul',
      country: 'Turkey',
      address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
      zipCode: '34742'
    },
    basketItems: [
      {
        id: 'BI101',
        name: 'Binocular',
        category1: 'Collectibles',
        category2: 'Accessories',
        itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
        price
      }
    ]
  };


  console.log(req.body)
  iyzipay.payment.create(request, (err, result) => {
    if (err) console.log(err)
    console.log(result);
    dbQuery('UPDATE user_statistics SET isPremiumUser = ? WHERE username = ?', [1, username]);
  });
  res.send({ status: 'success' });
})


const gameRooms = new Map();
const Puzzles = new Map();
let playersWaitingForMatch = [];
let room_id = null

io.on('connection', (socket) => {

  const FindBestMove = (stockfishOutput, depth) => {
    // "bestmove" kelimesini bul
    const bestMoveIndex = stockfishOutput.indexOf("bestmove");
    console.log(bestMoveIndex)
    if (bestMoveIndex !== -1) {
      // "bestmove" kelimesinden sonraki kısmı al
      const bestMoveSubstring = stockfishOutput.substring(bestMoveIndex + "bestmove".length).trim();

      // Boşluk veya yeni satır karakterine kadar olan kısmı al
      const bestMove = bestMoveSubstring.split(/[ \r\n]+/)[0];
      console.log("bestmove : ", bestMove)
      console.log(`en iyi hamle hesaplandı : ${bestMove} / derinlik : ${depth}`)

      io.to(socket.id).emit("stockfish_response", bestMove)
    } else {
      console.log('bestmove bulunamadı.');
    }
  }

  const mapDepth = (depth) => {
    const depthMapping = {
      1: 1,
      2: 3,
      3: 5,
      4: 8,
      5: 10,
      6: 12,
      7: 15,
      8: 18,
      9: 20,
      10: 30
    };
    return depthMapping[depth] || 1; // Default to depth 1 if not found
  };

  const evaluateFen = (fen) => {
    return new Promise((resolve, reject) => {
      const stockfish = spawn(STOCKFISH_PATH);
      stockfish.stdin.write('isready\n');
      stockfish.stdin.write(`position fen ${fen}\n`);
      stockfish.stdin.write('go depth 10\n');
      stockfish.stdout.setEncoding('utf-8');

      let outputBuffer = '';

      stockfish.stdout.on('data', (data) => {
        outputBuffer += data.toString();

        if (outputBuffer.includes('bestmove')) {
          const parts = outputBuffer.split(' ');
          const scoreIndex = parts.indexOf('score');
          const bestMoveIndex = outputBuffer.indexOf("bestmove");
          if (scoreIndex !== -1 && scoreIndex + 1 < parts.length) {
            let evaluation;
            if (parts[scoreIndex + 1] === 'cp') {
              evaluation = parseFloat(parts[scoreIndex + 2]) / 100; // centipawn değeri
            } else if (parts[scoreIndex + 1] === 'mate') {
              evaluation = parseFloat(parts[scoreIndex + 2]) * (parts[scoreIndex + 2] > 0 ? 1 : -1); // mate değeri
            } else {
              reject('Unexpected score format.');
              return;
            }

            var bestMove = parts[bestMoveIndex + 1];
            if (bestMoveIndex !== -1) {
              const bestMoveSubstring = outputBuffer.substring(bestMoveIndex + "bestmove".length).trim();              // Boşluk veya yeni satır karakterine kadar olan kısmı al
              bestMove = bestMoveSubstring.split(/[ \r\n]+/)[0];
            } else {
              console.log('bestmove bulunamadı.');
            }

            stockfish.kill(); // İşlem tamamlandığında process'i sonlandır
            resolve({ evaluation, bestMove });

          } else {
            reject('Score or bestmove information not found in output.');
          }
        }
      });

      stockfish.stderr.on('data', (data) => {
        reject(`Stockfish error: ${data}`);
      });
    });
  };

  const evaluateGame = async (gameFenList, socket) => {
    try {
      let evaluations = [];
      for (let i = 0; i < gameFenList.length; i++) {
        const evaluation = await evaluateFen(gameFenList[i]);
        evaluations.push(evaluation);
        const progressAnalysis = ((i + 1) / gameFenList.length) * 100;
        socket.emit('progressAnalysis', progressAnalysis);
      }
      return evaluations;
    } catch (error) {
      console.error('Error evaluating game:', error);
    }
  };

  socket.on('evaluateFen', async (fen) => {
    try {
      const evaluation = await evaluateFen(fen);
      io.to(socket.id).emit('evaluationResult', evaluation);
    } catch (error) {
      console.error('Error evaluating FEN:', error);
    }
  });

  socket.on('analysisGame', async (gameHistory) => {
    try {
      const gameFenList = gameHistory.map(entry => entry.after);
      const evaluations = await evaluateGame(gameFenList, socket);
      // console.log(evaluations, socket.id)
      io.to(socket.id).emit('evaluationResult', evaluations);
    } catch (error) {
      console.error('Error analyzing game:', error);
    }
  });

  socket.on("stockfish", (data) => {
    let { currentFEN, depth, socket } = data;
    console.log(currentFEN, depth);

    depth = mapDepth(depth);
    console.log(`Mapped depth: ${depth}`);

    const stockfish = spawn(STOCKFISH_PATH);
    stockfish.stdin.write(`position fen ${currentFEN}\n`);
    stockfish.stdin.write(`go depth ${depth}\n`);

    stockfish.stdout.setEncoding('utf-8');

    let stockfishOutputBuffer = '';

    stockfish.stdout.on('data', (data) => {
      stockfishOutputBuffer += data;
      console.log(stockfishOutputBuffer);

      if (stockfishOutputBuffer.includes("bestmove")) {
        FindBestMove(stockfishOutputBuffer, depth);
        stockfishOutputBuffer = ''; // Clear the buffer for the next output
      }
    });

    stockfish.stderr.on('data', (data) => {
      console.error(`Stockfish error: ${data}`);
    });

    stockfish.on('close', (code) => {
      console.log(`Stockfish process exited with code ${code}`);
    });

    stockfish.on('error', (err) => {
      console.error(`Failed to start Stockfish: ${err}`);
    });
  });



  socket.on("logged_in", async (socket) => {
    if ((socket.username === '') || (socket.socket_id === '')) { } else {
      console.log("socket : ", socket)

      const results1 = await dbQuery('SELECT * FROM socket WHERE username = ?', [socket.username])

      if (results1.length === 0) {
        db.query('INSERT INTO socket (username, socket_id) VALUES (?, ?)', [socket.username, socket.socket_id], (err, results) => {
          if (err) console.log(err);
          else {
            dbQuery('UPDATE user_statistics SET is_online = ? WHERE username = ?', [1, socket.username]);
            db.query('SELECT * FROM admin', (err, results) => {
              let top_user = (results[0].online_user)
              dbQuery('UPDATE admin SET online_user = ?', [top_user + 1]);
            })
            db.query('SELECT * FROM active_games WHERE playerWhite = ? OR playerBlack = ?', [socket.username, socket.username], (error, response) => {
              if (response.length > 0) {
                if (socket.username === response[0].playerWhite) {
                  db.query('UPDATE active_games SET whiteSocketID = ? WHERE playerWhite = ?', [socket.socket_id, socket.username], (err, results) => {
                    if (err) console.error(err);
                    console.log("Beyaz oyuncunun soket kimliği güncellendi.");
                  });
                }
                if (socket.username === response[0].playerBlack) {
                  db.query('UPDATE active_games SET blackSocketID = ? WHERE playerBlack = ?', [socket.socket_id, socket.username], (err, results) => {
                    if (err) console.error(err);
                    console.log("Siyah oyuncunun soket kimliği güncellendi.");
                  });
                }
              } else {
                console.log(`${socket.username}kullanıcısının aktif maçı yok`)
              }
            })
          }
        })
      } else {
        await dbQuery('UPDATE socket SET socket_id = ? WHERE username = ?', [socket.socket_id, socket.username]);
        const response = await dbQuery('SELECT * FROM active_games WHERE playerWhite = ? OR playerBlack = ?', [socket.username, socket.username]);

        if (response.length > 0) {
          console.log(`${socket.username} kişisinin aktif oyunu : `, response[0])

          if (socket.username === response[0].playerWhite) {
            await dbQuery('UPDATE active_games SET whiteSocketID = ? WHERE playerWhite = ?', [socket.socket_id, socket.username]);
          }
          if (socket.username === response[0].playerBlack) {
            await dbQuery('UPDATE active_games SET blackSocketID = ? WHERE playerBlack = ?', [socket.socket_id, socket.username]);
          }
        }
        else {
          console.log(`${socket.username} kişisinin aktif oyunu : Yok`)
        }


        await dbQuery('UPDATE user_statistics SET is_online = ? WHERE username = ?', [1, socket.username]);
        db.query('SELECT * FROM admin', (err, results) => {
          let top_user = (results[0].online_user)
          dbQuery('UPDATE admin SET online_user = ?', [top_user + 1]);
        })

        io.to(socket.socket_id).emit("logged_in_cevap", ({
          status: "OK",
          veri: results1
        }))
        const results3 = await dbQuery('SELECT * FROM socket')
        let key = 1
        results3.forEach(veri => {
          console.log(`${key}. sonuc : `, veri.username, " ", veri.socket_id)
          key = key + 1
        });
      }
    }

  })

  app.post("/friendsMeydanOkuma", async (req, res) => {
    try {
      const { username, socket_idim, friendsUsername, date } = req.body;

      if ((username === undefined || '') || (socket_idim === undefined || '') || (date === undefined || '') || (friendsUsername === undefined || '')) {
        console.log("hata");
      } else {
        const results1 = await dbQuery('SELECT * FROM socket WHERE username = ?', [friendsUsername])
        if (results1.length === 0) {
          console.log("Arkadaş Çevrimdışı")
          const results2 = await dbQuery('SELECT notification FROM user_statistics WHERE username = ?', [friendsUsername])

          let existingNotification = results2[0].notification;

          if (existingNotification) {
            let veriler = JSON.parse(existingNotification);
            const lastItem = veriler[veriler.length - 1];
            const lastItemId = lastItem.id;

            let newRequest = {
              id: lastItemId + 1,
              Gönderen_username: username,
              date: date,
              type: "meydan-okuma"
            }
            let notificationArray = existingNotification ? JSON.parse(existingNotification) : [];
            notificationArray.push(newRequest);

            db.query('UPDATE user_statistics SET notification = ? WHERE username = ?', [JSON.stringify(notificationArray), friendsUsername], (err, results2) => {
              if (err) console.log(err)
              res.json({
                status: 'OK',
                msg: "Meydan Okuma Gönderildi"
              });
            });
          }
        }
        if (results1.length > 0) {
          socket.to(results1[0].socket_id).emit("meydan_okuma", ({
            username: username,
            gönderenSocket_id: socket_idim,
            date: date,
          }))

          res.json({
            status: 'OK',
            msg: "Arkadaşa Meydan Okuma Gönderildi"
          })
        }
      }
    } catch (error) {
      console.log(error);
    }
  });


  socket.on("free-puzzles-istek", (puzzleid) => {
    console.log("Free Puzzles İstek Geldi : ", puzzleid)
    const puzzles = Puzzles.get(puzzleid)
    console.log(puzzles)
    io.to(socket.id).emit("free-puzzles-cevap", puzzles)
  })

  socket.on("puzzle_bilgi_send", (data) => {

    const puzzles_veri = {
      puzzle_id: data.puzzle_id,
      puzzleFEN: data.puzzleFEN,
      puzzleRating: data.puzzleRating,
    }

    console.log(data)
    // const { puzzle_id, puzzle_fen, puzzle_moves, puzzle_title, puzzle_description, puzzle_rating, puzzle_rating_count, puzzle_image } = data
    socket.emit("puzzle_bilgi_cevap", data)
    Puzzles.set(data.puzzle_id, puzzles_veri)
    console.log(Puzzles)
  })

  socket.on('move', (data) => {
    const { move, game_id, username, rakip_username, rakip_socketID, side } = data;

    if (move && game_id && username && rakip_username && rakip_socketID && side) {
      // Yeni hamleyi veritabanındaki hamlelerle birleştir
      db.query('SELECT * FROM active_games WHERE game_id = ?', [game_id], (err, results) => {
        if (err) {
          console.error(err);
        } else {
          let movesWhite = results[0].movesWhite ? JSON.parse(results[0].movesWhite) : [];
          let movesBlack = results[0].movesBlack ? JSON.parse(results[0].movesBlack) : [];

          // Yeni hamleyi doğru renkteki hamleler listesine ekle
          if (side === 'white') {
            movesWhite.push(move.san);
          } else if (side === 'black') {
            movesBlack.push(move.san);
          }

          db.query('UPDATE active_games SET movesWhite = ?, movesBlack = ? WHERE game_id = ?', [JSON.stringify(movesWhite), JSON.stringify(movesBlack), game_id], (err, results) => {
            if (err) {
              console.error(err);
            } else {
              console.log("Hamleler güncellendi.");

              // Karşı rakibin soket kimliğine sahip olan kullanıcıya hamleyi gönder
              console.log("move : ", move)
              socket.to(rakip_socketID).emit('move', move);
            }
          });
        }
      });
    }
  });

  socket.on("timecontrol", (data) => {
    const { game_id, side, time } = data
    console.log(side, data)
    if (side === 'white') {
      db.query('UPDATE active_games SET whiteDuration = ? WHERE game_id = ?', [time, 1000000 + game_id], (err, results) => {
        if (err) {
          console.error(err);
        } else if (results.affectedRows > 0) {
          console.log("Timer güncellendi.");
        }
      });
    } else if (side === 'black') {
      db.query('UPDATE active_games SET blackDuration = ? WHERE game_id = ?', [time, 1000000 + game_id], (err, results) => {
        if (err) {
          console.error(err);
        } else if (results.affectedRows > 0) {
          console.log("Timer güncellendi.");
        }
      });
    } else {
      console.log("Timer Hatası")
      res.json({
        msg: "Timer Hatası"
      })
    }
  })

  socket.on('GameTerk', (data) => {
    socket.to(data).emit("GameTerkReceive", { message: "Terk Ediyorum", status: "OK" })
  })

  socket.on('GameDraw', (data) => {
    socket.to(data).emit("GameDrawReceive", { message: "Beraberlik Teklif Ediyorum", status: "OK" })
  })




  socket.on('moveTournament', (data) => {
    const value = gameRooms.get(1000000 + data.room);
    let move = data.move
    let username = data.username
    console.log("move :", value, move)
    if (value !== undefined) {
      console.log(gameRooms.get(1000000 + data.room).players[0].id)
      let player1_id = gameRooms.get(1000000 + data.room).players[0].id
      let player2_id = gameRooms.get(1000000 + data.room).players[1].id


      db.query('SELECT * FROM active_games WHERE playerWhite = ? OR playerBlack = ?', [username, username], (error, response) => {
        if (error) {
          console.error('Sorgu hatası: ' + error.stack);
          throw error;
        }
        console.log("response.length :", response.length)
        console.log(response.playerWhite === username)
        if (response.length > 0) {
          if (response.playerWhite === username) async () => {
            db.query('SELECT * FROM socket WHERE username = ?', [username], (error, response) => {
              if (error) {
                console.error('Sorgu hatası: ' + error.stack);
                throw error;
              }
              console.log("socket : ", response[0].socket_id)
              socket.to(response[0].socket_id).emit("move", move)
            })
            console.log("Kullanıcı Beyaz")


          }
          else async () => {
            db.query('SELECT * FROM socket WHERE username = ?', [username], (error, response) => {
              if (error) {
                console.error('Sorgu hatası: ' + error.stack);
                throw error;
              }
              console.log("socket : ", response[0].socket_id)
              socket.to(response[0].socket_id).emit("move", move)
            })
            console.log("Kullanıcı Siyah")

          }
          console.log("uuu", response[0].playerWhite)
        }

      }
      );

      socket.to(player1_id).emit("move", move)
      socket.to(player2_id).emit("move", move)
    }
  });

  socket.on('game_over', async (data) => {
    const { gameResultMsg, game_id } = data;
    console.log(gameResultMsg, game_id)


    const ResultParts = data.gameResultMsg.split(' ');
    console.log(ResultParts)
    const winner = ResultParts[0]

    console.log("winner :", winner)

    const gameResults = winner === 'white' ? 1 : (winner === 'black' ? 0 : 0.5)

    db.query('SELECT * FROM active_games WHERE game_id = ?', [game_id], (error, response) => {
      if (error) {
        console.error('Sorgu hatası: ' + error.stack);
        throw error;
      }



      db.query(
        'SELECT * FROM games_archive WHERE game_id = ?',
        [game_id],
        (err, results) => {
          if (err) console.log("hata")
          if (results.length > 0) {
            console.log("game zaten ekli")
          } else {
            db.query('INSERT INTO games_archive (game_id, white_player_name, black_player_name, game_result, white_moves, black_moves, results, gameType) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [game_id, response[0].playerWhite, response[0].playerBlack, gameResultMsg, response[0].movesWhite, response[0].movesBlack, gameResults, response[0].gameType],
              (err) => {
                if (err) console.log(err);
                else {
                  console.log("Game Kaydedildi");
                  db.query('DELETE FROM active_games WHERE game_id = ?', [game_id], (err, results) => {
                    if (err) console.log(err)
                    console.log(`${game_id} numaralı aktif oyun silindi...`)

                    // Kullanıcı 1 için istatistikleri güncelle
                    updateUserStatistics(response[0].playerWhite);

                    // Kullanıcı 2 için istatistikleri güncelle
                    updateUserStatistics(response[0].playerBlack);
                  });

                }
              }
            );
          }
        }
      );

    })

    const CalculateRating = async (WinnerRating, LoserRating) => {
      const KFactor = 16; // ELO K Faktörü
      const PointDifference = LoserRating - WinnerRating;
      if (WinnerRating === 0 && LoserRating === 0) {
        console.log("0-0", WinnerRating, LoserRating)
        // Her iki oyuncunun rating'i de 0 ise, yeni rating'leri de 0 olarak döndür
        return {
          WinnerNewRating: 10,
          LoserNewRating: 0
        };
      } else if (LoserRating === 0 && !(WinnerRating === 0)) {
        console.log("2", WinnerRating, LoserRating)
        const KFactor = 16;
        const PointDifference = LoserRating - WinnerRating; // Değişiklik burada

        // Calculate new rating of the winner
        // const WinnerNewRating = WinnerRating + KFactor * (1 / (1 + 10 ** (PointDifference / 400)));
        const WinnerNewRating = WinnerRating + KFactor * (1 / (1 + 10 ** (PointDifference / 400)))

        return {
          WinnerNewRating,
          LoserNewRating: 0
        };
      } else {
        console.log("3", WinnerRating, LoserRating)

        const ExpectedScoreWinner = 1 / (1 + 10 ** (PointDifference / 400));
        const ExpectedScoreLoser = 1 - ExpectedScoreWinner;

        const WinnerNewRating = WinnerRating + KFactor * (1 - ExpectedScoreWinner);
        const LoserNewRating = LoserRating + KFactor * (0 - ExpectedScoreLoser);

        // Calculate new rating of the winner
        // const WinnerNewRating = WinnerRating + KFactor * (1 / (1 + 10 ** (PointDifference / 400)));
        // const WinnerNewRating = WinnerRating + KFactor * (1 / (1 + 10 ** (PointDifference / 400)))

        // Calculate new rating of the loser
        // const LoserNewRating = LoserRating + KFactor * (0 - (1 / (1 + 10 ** (PointDifference / 400))));
        // const LoserNewRating = LoserRating - KFactor * (1 / (1 + 10 ** (PointDifference / 400)))

        return {
          WinnerNewRating,
          LoserNewRating
        };
      }
    };


    if (winner === 'white') {
      try {

        db.query(
          'SELECT * FROM active_games WHERE game_id = ?',
          [game_id],
          async (err, results) => {
            if (results.length > 0) {
              console.log("resuluts : ", results)
              const whiteName = results[0].playerWhite
              const blackName = results[0].playerBlack
              const gameType = results[0].gameType

              console.log("isimler : ", whiteName, blackName, results[0].gameType)

              const whiteStas = await dbQuery('SELECT * FROM user_statistics WHERE username = ?', [whiteName]);
              const blackStas = await dbQuery('SELECT * FROM user_statistics WHERE username = ?', [blackName]);

              // White
              const White_toplam_mac_sayisi = whiteStas[0].toplam_mac_sayisi;
              const White_normal_mod_puan = whiteStas[0].normal_mod_puan;
              const White_uzun_mod_puan = whiteStas[0].uzun_mod_puan;
              const White_updatedToplamMacSayisi = White_toplam_mac_sayisi + 1;
              // Black
              const Black_toplam_mac_sayisi = blackStas[0].toplam_mac_sayisi;
              const Black_normal_mod_puan = blackStas[0].normal_mod_puan;
              const Black_uzun_mod_puan = blackStas[0].uzun_mod_puan;
              const Black_updatedToplamMacSayisi = Black_toplam_mac_sayisi + 1;

              if (gameType === 'Blitz') {
                NewWhiteRating = await (await CalculateRating(White_normal_mod_puan, Black_normal_mod_puan)).WinnerNewRating
                NewBlackRating = await (await CalculateRating(White_normal_mod_puan, Black_normal_mod_puan)).LoserNewRating

                console.log("Ratingler : ", NewWhiteRating, NewBlackRating)
                console.log(4)

                // await dbQuery('UPDATE user_statistics SET toplam_mac_sayisi = ? WHERE username = ?', [White_updatedToplamMacSayisi, whiteName]);
                // await dbQuery('UPDATE user_statistics SET toplam_mac_sayisi = ? WHERE username = ?', [Black_updatedToplamMacSayisi, whiteName]);

                await dbQuery('UPDATE user_statistics SET normal_mod_puan = ? WHERE username = ?', [NewWhiteRating, whiteName]);
                await dbQuery('UPDATE user_statistics SET normal_mod_puan = ? WHERE username = ?', [NewBlackRating, blackName]);

              } else if (gameType === 'Rapid') {
                NewWhiteRating = await (await CalculateRating(White_uzun_mod_puan, Black_uzun_mod_puan)).WinnerNewRating
                NewBlackRating = await (await CalculateRating(White_uzun_mod_puan, Black_uzun_mod_puan)).LoserNewRating

                console.log("Ratingler : ", NewWhiteRating, NewBlackRating)
                console.log(4)

                // await dbQuery('UPDATE user_statistics SET toplam_mac_sayisi = ? WHERE username = ?', [White_updatedToplamMacSayisi, whiteName]);
                // await dbQuery('UPDATE user_statistics SET toplam_mac_sayisi = ? WHERE username = ?', [Black_updatedToplamMacSayisi, whiteName]);

                await dbQuery('UPDATE user_statistics SET uzun_mod_puan = ? WHERE username = ?', [NewWhiteRating, whiteName]);
                await dbQuery('UPDATE user_statistics SET uzun_mod_puan = ? WHERE username = ?', [NewBlackRating, blackName]);

              } else {
                console.log("Hata")
              }

              db.query('UPDATE user_statistics SET inMatch = ? WHERE username = ?', [0, whiteName], (err, results) => {
                if (err) console.log(err)
              });

              console.log("Toplam maç sayısı güncellendi.");
            }

          })
      } catch (error) {
        console.log(error);
      }
    } else if (winner === 'black') {
      try {
        db.query(
          'SELECT * FROM games_archive WHERE game_id = ?',
          [game_id],
          async (err, results) => {
            if (results.length > 0) {
              console.log("resuluts : ", results)
              const whiteName = results[0].playerWhite
              const blackName = results[0].playerBlack
              const gameType = results[0].gameType

              console.log("isimler : ", whiteName, blackName, results[0].gameType)

              const whiteStas = await dbQuery('SELECT * FROM user_statistics WHERE username = ?', [whiteName]);
              const blackStas = await dbQuery('SELECT * FROM user_statistics WHERE username = ?', [blackName]);

              // White
              const White_toplam_mac_sayisi = whiteStas[0].toplam_mac_sayisi;
              const White_normal_mod_puan = whiteStas[0].normal_mod_puan;
              const White_uzun_mod_puan = whiteStas[0].uzun_mod_puan;
              const White_updatedToplamMacSayisi = White_toplam_mac_sayisi + 1;
              // Black
              const Black_toplam_mac_sayisi = blackStas[0].toplam_mac_sayisi;
              const Black_normal_mod_puan = blackStas[0].normal_mod_puan;
              const Black_uzun_mod_puan = blackStas[0].uzun_mod_puan;
              const Black_updatedToplamMacSayisi = Black_toplam_mac_sayisi + 1;

              if (gameType === 'Blitz') {
                NewBlackRating = await (await CalculateRating(Black_normal_mod_puan, White_normal_mod_puan)).WinnerNewRating
                NewWhiteRating = await (await CalculateRating(Black_normal_mod_puan, White_normal_mod_puan)).LoserNewRating

                console.log(51, await (await CalculateRating(Black_normal_mod_puan, White_normal_mod_puan)).WinnerNewRating, await (await CalculateRating(Black_normal_mod_puan, White_normal_mod_puan)).LoserNewRating)
                console.log("Ratingler : ", NewWhiteRating, NewBlackRating)
                console.log(5)

                // await dbQuery('UPDATE user_statistics SET toplam_mac_sayisi = ? WHERE username = ?', [White_updatedToplamMacSayisi, whiteName]);
                // await dbQuery('UPDATE user_statistics SET toplam_mac_sayisi = ? WHERE username = ?', [Black_updatedToplamMacSayisi, whiteName]);

                await dbQuery('UPDATE user_statistics SET normal_mod_puan = ? WHERE username = ?', [NewWhiteRating, whiteName]);
                await dbQuery('UPDATE user_statistics SET normal_mod_puan = ? WHERE username = ?', [NewBlackRating, blackName]);

              } else if (gameType === 'Rapid') {
                NewWhiteRating = await (await CalculateRating(Black_uzun_mod_puan, White_uzun_mod_puan)).WinnerNewRating
                NewBlackRating = await (await CalculateRating(Black_uzun_mod_puan, White_uzun_mod_puan)).LoserNewRating

                console.log(51, await (await CalculateRating(Black_normal_mod_puan, White_normal_mod_puan)).WinnerNewRating, await (await CalculateRating(Black_normal_mod_puan, White_normal_mod_puan)).LoserNewRating)
                console.log("Ratingler : ", NewWhiteRating, NewBlackRating)
                console.log(5)

                // await dbQuery('UPDATE user_statistics SET toplam_mac_sayisi = ? WHERE username = ?', [White_updatedToplamMacSayisi, whiteName]);
                // await dbQuery('UPDATE user_statistics SET toplam_mac_sayisi = ? WHERE username = ?', [Black_updatedToplamMacSayisi, whiteName]);

                await dbQuery('UPDATE user_statistics SET uzun_mod_puan = ? WHERE username = ?', [NewWhiteRating, whiteName]);
                await dbQuery('UPDATE user_statistics SET uzun_mod_puan = ? WHERE username = ?', [NewBlackRating, blackName]);

              } else {
                console.log("Hata")
              }

              db.query('UPDATE user_statistics SET inMatch = ? WHERE username = ?', [0, whiteName], (err, results) => {
                if (err) console.log(err)
              });

              console.log("Toplam maç sayısı güncellendi.");
            }
          })
      } catch (error) {
        console.log(error);
      }
    }

    const updateUserStatistics = async (playerName) => {
      try {
        const results = await dbQuery('SELECT * FROM user_statistics WHERE username = ?', [playerName]);
        console.log("veri: ", results[0]);

        const toplam_mac_sayisi = results[0].toplam_mac_sayisi;
        const normal_mod_puan = results[0].normal_mod_puan;
        const uzun_mod_puan = results[0].uzun_mod_puan;

        await logPlayerRatings(playerName, normal_mod_puan, uzun_mod_puan);

        const updatedToplamMacSayisi = toplam_mac_sayisi + 1;

        await dbQuery('UPDATE user_statistics SET toplam_mac_sayisi = ? WHERE username = ?', [updatedToplamMacSayisi, playerName]);

        db.query('UPDATE user_statistics SET inMatch = ? WHERE username = ?', [0, playerName], (err, results) => {
          if (err) console.log(err)
        });

        console.log("Toplam maç sayısı güncellendi.");
      } catch (error) {
        console.log(error);
      }
    }

    const logPlayerRatings = async (username, blitzRating, rapidRating) => {
      try {
        // Get existing logs
        const [existingLog] = await dbQuery('SELECT * FROM player_rating_log WHERE username = ?', [username]);

        const dateCustom = new Date().toISOString()

        const formatDate = (dateString) => {
          const date = new Date(dateString);
          const options = { month: 'short', day: 'numeric', year: 'numeric' };
          return new Intl.DateTimeFormat('en-US', options).format(date);
        };

        let newLogs = [];

        if (existingLog) {
          // Parse existing JSON logs
          newLogs = JSON.parse(existingLog.log_data);
        }

        // Add new log entry
        newLogs.push({
          dateLog: formatDate(dateCustom),
          blitzPuan: blitzRating,
          rapidPuan: rapidRating
        });

        // Update or insert the log entry
        if (existingLog) {
          await dbQuery(
            'UPDATE player_rating_log SET log_data = ? WHERE username = ?',
            [JSON.stringify(newLogs), username]
          );
        } else {
          await dbQuery(
            'INSERT INTO player_rating_log (username, log_data) VALUES (?, ?)',
            [username, JSON.stringify(newLogs)]
          );
        }

        console.log("Player rating logged.");
      } catch (error) {
        console.log("Error logging player rating: ", error);
      }
    };

  });

  socket.on('game_overComputer', async (data) => {
    const value = gameRooms.get(1000000 + data.room);
    console.log(data, value)
    if (value !== undefined) {

      const player1_name = gameRooms.get(1000000 + data.room).players[1].name;
      const player2_name = gameRooms.get(1000000 + data.room).players[0].name;

      if (player1_name === data.computerForce) {
        const computerName = player1_name
        const playerName = player2_name

        return computerName, playerName

      } else if (player2_name === data.computerForce) {
        const computerName = player2_name
        const playerName = player1_name

        return computerName, playerName
      }

      try {
        const [player_results] = await Promise.all([
          queryDb("SELECT id FROM users WHERE username = ?", [playerName]),
        ]);

        const player_id = player_results.length > 0 ? player_results[0].id : null;

        const resultMsg = data.result;

        console.log(resultMsg)

        const game_id = 1000000 + data.room;

        const movesWhite = data.movesWhite

        const movesBlack = data.movesBlack

        const computerForce = data.computerForce;

        const ResultParts = data.result.split(' ');
        console.log(ResultParts)
        const winner = ResultParts[0]

        console.log("winner :", winner)

        const gameResults = winner === 'white' ? 1 : (winner === 'black' ? 0 : 0.5)

        db.query('DELETE FROM active_games WHERE game_id = ?', [game_id], (err, results) => {
          if (err) console.log(err)
          console.log(`${game_id} numaralı aktif oyun silindi...`)
        });

        // console.log("Beyaz : ", movesWhite)
        // console.log("Siyah : ", movesBlack)

        db.query(
          'SELECT * FROM games_archive WHERE game_id = ?',
          [game_id],
          (err, results) => {
            if (err) console.log("hata")
            if (results.length > 0) {
              console.log("game zaten ekli")
            } else {
              db.query('INSERT INTO games_archive (game_id, white_player_name, black_player_name, white_player_id, black_player_id, game_result, white_moves, black_moves, results, gameType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [game_id, player1_name, player2_name, player_id, computerForce, resultMsg, '', '', gameResults, "Computer"],
                (err) => {
                  if (err) console.log(err);
                  else {
                    console.log("Game Kaydedildi");
                  }
                }
              );
            }
          }
        );

        // Beyaz hamleleri güncelleme
        function updateWhiteMoves() {
          const whiteMovesString = movesWhite.join(' '); // Diziyi birleştirerek beyaz hamlelerin dizesini oluşturuyoruz
          console.log(movesWhite)
          console.log(whiteMovesString)
          db.query("UPDATE games_archive SET white_moves = CONCAT(white_moves, ?) WHERE game_id = ?", [whiteMovesString, game_id], (err, result) => {
            if (err) {
              console.error('Beyaz hamle güncelleme hatası:', err);
            } else {
              console.log('Beyaz hamle güncellemesi başarılı:', result.affectedRows, 'kayıt güncellendi.');
            }
          });
        }

        // Siyah hamleleri güncelleme
        function updateBlackMoves() {
          const blackMovesString = movesBlack.join(' '); // Diziyi birleştirerek siyah hamlelerin dizesini oluşturuyoruz
          console.log(movesBlack)
          console.log(blackMovesString)
          db.query("UPDATE games_archive SET black_moves = CONCAT(black_moves, ?) WHERE game_id = ?", [blackMovesString, game_id], (err, result) => {
            if (err) {
              console.error('Siyah hamle güncelleme hatası:', err);
            } else {
              console.log('Siyah hamle güncellemesi başarılı:', result.affectedRows, 'kayıt güncellendi.');
            }
          });
        }

        const updateUserStatistics = async (playerName) => {
          try {
            const results = await dbQuery('SELECT * FROM user_statistics WHERE username = ?', [playerName]);
            console.log("veri: ", results[0]);

            const toplam_mac_sayisi = results[0].toplam_mac_sayisi;
            const normal_mod_puan = results[0].normal_mod_puan;
            const uzun_mod_puan = results[0].uzun_mod_puan;

            const updatedToplamMacSayisi = toplam_mac_sayisi + 1;

            await dbQuery('UPDATE user_statistics SET toplam_mac_sayisi = ? WHERE username = ?', [updatedToplamMacSayisi, playerName]);

            db.query('UPDATE user_statistics SET inMatch = ? WHERE username = ?', [0, playerName], (err, results) => {
              if (err) console.log(err)
            });

            console.log("Toplam maç sayısı güncellendi.");
          } catch (error) {
            console.log(error);
          }
        }

        // Kullanıcı 1 için istatistikleri güncelle
        await updateUserStatistics(playerName);


        updateWhiteMoves();
        updateBlackMoves();



      } catch (error) {
        console.log(error);
      }
    }
  });

  function queryDb(query, values) {
    return new Promise((resolve, reject) => {
      db.query(query, values, (error, results) => {
        if (error) reject(error);
        else resolve(results);
      });
    });
  }


  const playMatch = async (socket, data) => {
    try {
      const query = 'SELECT * FROM games_archive ORDER BY game_id DESC LIMIT 1';
      console.log(data.gameType);

      db.query(query, async (error, results) => {
        if (error) {
          console.error('Sorgu hatası: ' + error.stack);
          throw error;
        }

        let room_id;
        if (results.length > 0) {
          room_id = results[0].game_id + 1;
        } else {
          room_id = 1000000;
        }

        playersWaitingForMatch.push({
          name: data.username,
          side: getBlackOrWhite(),
          gameType: data.gameType // Store the game type
        });

        // Function to find the player name by color in the tournament fixture
        function oyuncuIsmiByRenk(room, renk) {
          for (const player of room.players) {
            if (player.side === renk) {
              return player.name;
            }
          }
          return null; // Return null if no player with the color is found
        }

        // Function to find the socket ID by username
        function findSocketIDByUsername(username) {
          return new Promise((resolve, reject) => {
            db.query('SELECT * FROM socket WHERE username = ?', [username], (err, res) => {
              if (err) {
                console.error(err);
                return reject(err);
              }
              if (res.length > 0) {
                resolve(res[0].socket_id);
              } else {
                resolve(null);
              }
            });
          });
        }

        // Filter players waiting for a match by game type
        const playersForThisGameType = playersWaitingForMatch.filter(player => player.gameType === data.gameType);

        if (playersForThisGameType.length >= 2) {
          const room = {
            id: room_id,
            players: playersForThisGameType.splice(0, 2) // Match two players with the same game type
          };

          // Remove matched players from the main queue
          playersWaitingForMatch = playersWaitingForMatch.filter(player => player.gameType !== data.gameType);

          gameRooms.set(room_id, room);

          const WhitePlayerName = oyuncuIsmiByRenk(room, 'white');
          const BlackPlayerName = oyuncuIsmiByRenk(room, 'black');

          const whiteSocketID = await findSocketIDByUsername(WhitePlayerName);
          const blackSocketID = await findSocketIDByUsername(BlackPlayerName);

          if (whiteSocketID && blackSocketID) {
            console.log(`Rengi White olan oyuncunun ismi:`, WhitePlayerName);
            console.log(`Rengi Black olan oyuncunun ismi:`, BlackPlayerName);
            const gameType = data.gameType;
            const Duration = gameType === 'Blitz' ? 90 : 600;
            console.log(Duration);

            db.query('INSERT INTO active_games (game_id, gameType, movesWhite, movesBlack, playerWhite, playerBlack, whiteDuration, blackDuration, whiteSocketID, blackSocketID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [room_id, gameType, JSON.stringify([]), JSON.stringify([]), WhitePlayerName, BlackPlayerName, Duration, Duration, whiteSocketID, blackSocketID], async (err, res) => {
              if (err) {
                console.error(err);
                throw err;
              }
            });

            db.query('UPDATE user_statistics SET inMatch = ? WHERE username IN (?, ?)', [1, WhitePlayerName, BlackPlayerName], (err, results) => {
              if (err) console.log(err);
            });

            io.to(`${whiteSocketID}`).emit('gameStart', {
              game_id: room_id,
            });
            io.to(`${blackSocketID}`).emit('gameStart', {
              game_id: room_id,
            });
            room_id++;
          } else {
            console.log(`Oyuncuların socket ID'leri bulunamadı.`);
          }
        }
      });
    } catch (error) {
      console.error('Veritabanı hatası:', error.message);
    }
  };


  const playTournament = async (socket, data) => {
    try {
      console.log(data);
      const query = 'SELECT * FROM games_archive ORDER BY game_id DESC LIMIT 1';

      db.query(query, (error, results) => {
        if (error) {
          console.error('Sorgu hatası: ' + error.stack);
          throw error;
        }

        let starting_game_id;
        if (results.length > 0) {
          starting_game_id = results[0].game_id + 1;
        } else {
          starting_game_id = 100000; // İlk oyun ise game_id 100000 olarak ayarlanır
        }

        let current_game_id = starting_game_id;

        // Her bir maç için fikstür verisine game_id eklenir
        const updatedData = {};
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            updatedData[key] = {
              ...data[key],
              game_id: current_game_id++
            };
          }
        }

        const room = {
          id: starting_game_id, // Oda numarası olarak başlangıç game_id'si kullanılıyor
          players: playersWaitingForMatch.splice(0, 2)
        };
        gameRooms.set(room.id, room);

        // Fikstür verisi ve başlangıç game_id'sini yayınla
        io.emit("receiveTournamentVeri", {
          updatedData
        });
        console.log(updatedData);
      });
    } catch (error) {
      console.error('Veritabanı hatası:', error.message);
    }
  };

  const playMatchComputer = async (socket, data) => {
    try {
      console.log("playMatchComputer Data : ", data)
      const side = (data.side === 'Rastgele' ? getBlackOrWhite() : data.side)
      const NumberSide = (side === 'Beyaz' ? 1 : 0)
      const query = 'SELECT * FROM games_archive ORDER BY game_id DESC LIMIT 1';

      db.query(query, (error, results) => {
        if (error) {
          console.error('Sorgu hatası: ' + error.stack);
          throw error;
        }

        let room_id;
        if (results.length > 0) {
          room_id = results[0].game_id + 1;
        } else {
          room_id = 1000000;
        }

        if (side === 'Beyaz') {
          db.query('INSERT INTO active_games (game_id, gameType, movesWhite, movesBlack, playerWhite, playerBlack, whiteDuration, blackDuration, whiteSocketID, blackSocketID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [room_id, "Computer", JSON.stringify([]), JSON.stringify([]), data.username, data.computerForce, 600, 600, 'Computer', socket.id], async (err, res) => {
            if (error) {
              console.log(error)
            }
            db.query('UPDATE user_statistics SET inMatch = ? WHERE username = ?', [1, data.username], (err, results) => {
              if (err) console.log(err)
            });
            console.log("Active Games Kaydedildi")
          })
        } else {
          db.query('INSERT INTO active_games (game_id, gameType, movesWhite, movesBlack, playerWhite, playerBlack, whiteDuration, blackDuration, whiteSocketID, blackSocketID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [room_id, "Computer", JSON.stringify([]), JSON.stringify([]), data.computerForce, data.username, 600, 600, 'Computer', socket.id], async (err, res) => {
            if (error) {
              console.log(error)
            }
            db.query('UPDATE user_statistics SET inMatch = ? WHERE username = ?', [1, data.username], (err, results) => {
              if (err) console.log(err)
            });
            console.log("Active Games Kaydedildi")
          })
        }

        io.to(socket.id).emit('gameStartComputer', {
          game_id: room_id,
        });
        room_id++;
      });
    } catch (error) {
      console.error('Veritabanı hatası:', error.message);
    }
  };

  socket.on("play_match", (data) => {
    playMatch(socket, data);
  });

  socket.on("play_tournament", (data) => {
    playTournament(socket, data);
  });

  socket.on("play_match_computer", (data) => {
    playMatchComputer(socket, data);
  });


  socket.on('computer_game_bilgi_istek', async (game_id, username) => {
    try {
      db.query('SELECT * FROM active_games WHERE playerWhite = ? OR playerBlack = ?', [username, username], (error, response) => {
        if (response.length > 0) {
          io.to(socket.id).emit("computer_game_bilgi_cevap", {
            oyun: "Oyun Hazır",
            value: response[0]
          })
        }
      })
    } catch (error) {
      console.log(error)
    }
  });

  socket.on('game_bilgi_istek', async (game_id, username) => {
    try {
      let sorgu = 1000000 + game_id;

      db.query('SELECT * FROM games_archive WHERE game_id = ?', [game_id + 1000000], async (error, response) => {
        if (response.length > 0) {
          io.to(socket.id).emit("game_bilgi_cevap", {
            oyun: "Oyun Veritabanında Ekli",
            value: response[0]
          })
        } else {
          const value = await dbQuery('SELECT * FROM active_games WHERE game_id = ?', [sorgu]);
          const beyazVeri = await dbQuery('SELECT * FROM user_statistics WHERE username = ?', [value[0].playerWhite]);
          const siyahVeri = await dbQuery('SELECT * FROM user_statistics WHERE username = ?', [value[0].playerBlack]);
          const gameData = {
            activeGamesVeri: value[0],
            whiteData: beyazVeri,
            blackData: siyahVeri,
          }
          io.to(socket.id).emit("game_bilgi_cevap", { gameData, oyun: "Oyun Hazır" });
        }
      })
    } catch (error) {
      console.log(error)
    }
  });

  socket.on("disconnect", async () => {
    const results1 = await dbQuery('SELECT * FROM socket WHERE socket_id = ?', [socket.id])
    if (results1.length > 0) {
      const results2 = await dbQuery('DELETE FROM socket WHERE socket_id = ?', [socket.id])
      if (results2.affectedRows > 0) {
        console.log("Socket Silindi");
        db.query('SELECT * FROM admin', (err, results) => {
          let top_user = (results[0].online_user)
          dbQuery('UPDATE admin SET online_user = ?', [top_user - 1]);
        })
      }
      console.log(results1[0].username)
      dbQuery('UPDATE user_statistics SET is_online = ? WHERE username = ?', [0, results1[0].username]);
    }
  })
})

const dbQuery = (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });
};


function shuffleArray(array) {
  // Fisher-Yates algoritması kullanılarak diziyi karıştırma işlemi gerçekleştirilir.
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

let nextColor = "black";

function getBlackOrWhite() {
  // Sıradaki rengi geçici bir değişkende tutuyoruz
  const currentColor = nextColor;

  // Sıradaki rengi değiştiriyoruz
  nextColor = (nextColor === "white") ? "black" : "white";

  // Sıradaki rengi döndürüyoruz
  return currentColor;
}

app.post("/inMatch", async (req, res) => {
  try {
    const { username } = req.body

    const results = await dbQuery('SELECT * FROM user_statistics WHERE username = ?', [username]);

    const inMatch = results[0].inMatch

    if (inMatch) {
      const response = await dbQuery('SELECT * FROM active_games WHERE playerWhite = ? OR playerBlack = ?', [username, username]);
      if (response.length > 0) {

        res.json({
          status: 'OK',
          msg: "İstatistikler Gönderildi",

          game_id: response[0].game_id,
          response: response,

          inMatch: inMatch,
        })

      } else {

        res.json({
          status: 'OK',
          msg: "İstatistikler Gönderildi",

          room_id: response[0].room_id,

          inMatch: inMatch,
        })
      }
    }

  } catch (error) {
  }
})

app.post("/archive_veri", async (req, res) => {
  try {
    const { room } = req.body

    const results = await dbQuery('SELECT * FROM games_archive WHERE game_id = ?', [room]);

    if (results.length > 0) {
      console.log(results[0])
      res.json({
        status: 'OK',
        msg: "İstatistikler Gönderildi",

        room_id: results[0].room_id,

        results: results[0],
      })
    }

  } catch (error) {
  }
})

app.post("/fetchTournament", async (req, res) => {
  try {
    const { tournamentID } = req.body

    const results = await dbQuery('SELECT * FROM tournaments WHERE tournamentID = ?', [tournamentID]);
    if (results.length > 0) {
      res.json({
        status: 'OK',
        msg: "İstatistikler Gönderildi",

        tournamentID: results[0].tournamentID,

        results: results[0],
      })
    }

  } catch (error) {
  }
})

app.post("/joinTournament", async (req, res) => {
  try {
    const { tournamentID, username } = req.body;

    const results = await dbQuery('SELECT * FROM tournaments WHERE tournamentID = ?', [tournamentID]);
    const playerInfo = await dbQuery('SELECT * FROM users WHERE username = ?', [username])
    const playerStatistic = await dbQuery('SELECT * FROM user_statistics WHERE username = ?', [username])
    const playerID = playerInfo[0].id
    const blitzPuan = playerStatistic[0].normal_mod_puan
    const rapidPuan = playerStatistic[0].uzun_mod_puan

    if (results.length > 0) {
      let existingNotification = results[0].JoinPlayer;

      if (existingNotification.length > 0) {
        try {
          let veriler = JSON.parse(existingNotification) || [];

          let newRequest = {
            id: (playerID ? playerID : '?'),
            username: username,
            blitzPuan: blitzPuan,
            rapidPuan: rapidPuan,
          };

          let notificationArray = [...veriler, newRequest];
          existingNotification = JSON.stringify(notificationArray);

          db.query('UPDATE tournaments SET JoinPlayer = ? WHERE tournamentID = ?', [existingNotification, tournamentID], (err, results) => {
            if (err) {
              console.error(err);
              res.status(500).json({
                status: 'ERROR',
                msg: 'Hata oluştu',
              });
            } else {
              res.json({
                status: 'OK',
                msg: 'Turnuvaya Katıldınız',
              });
            }
          });
        } catch (error) {
          console.error("Hata oluştu:", error);
        }
      } else {
        existingNotification = `[{"id": ${playerID}, "username": "${username}", "BlitzPuan": ${blitzPuan}, "RapidPuan": ${rapidPuan}}]`;

        db.query('UPDATE tournaments SET JoinPlayer = ? WHERE tournamentID = ?', [existingNotification, tournamentID], (err, results) => {
          if (err) {
            console.error(err);
            res.status(500).json({
              status: 'ERROR',
              msg: 'Hata oluştu',
            });
          } else {
            res.json({
              status: 'OK',
              msg: 'Turnuvaya Katıldınız',
            });
            console.log('Turnuvaya birisi katıldı...');
          }
        });
      }

      let TournamentUsersCount = results[0].JoinPlayerCount;
      TournamentUsersCount++;
      await dbQuery('UPDATE tournaments SET JoinPlayerCount = ? WHERE  tournamentID = ?', [TournamentUsersCount, tournamentID]);

    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'ERROR',
      msg: 'Hata oluştu',
    });
  }
});


app.post("/leaveTournament", async (req, res) => {
  try {
    const { tournamentID, username } = req.body;

    const results = await dbQuery('SELECT * FROM tournaments WHERE tournamentID = ?', [tournamentID]);

    if (results.length > 0) {
      let existingNotification = results[0].JoinPlayer;

      if (existingNotification.length > 0) {
        try {
          let veriler = JSON.parse(existingNotification);
          let updatedVeriler = veriler.filter(item => item.username !== username);

          existingNotification = JSON.stringify(updatedVeriler);

          db.query('UPDATE tournaments SET JoinPlayer = ? WHERE tournamentID = ?', [existingNotification, tournamentID], (err, results) => {
            if (err) {
              console.error(err);
              res.status(500).json({
                status: 'ERROR',
                msg: 'Hata oluştu',
              });
            } else {
              res.json({
                status: 'OK',
                msg: 'Turnuvadan Ayrıldınız',
              });
            }
          });
        } catch (error) {
          console.error("Hata oluştu:", error);
        }
      } else {
        res.json({
          status: 'OK',
          msg: 'Zaten turnuvaya kayıtlı değilsiniz.',
        });
      }

      let TournamentUsersCount = results[0].JoinPlayerCount;
      TournamentUsersCount--;

      await dbQuery('UPDATE tournaments SET JoinPlayerCount = ? WHERE  tournamentID = ?', [TournamentUsersCount, tournamentID]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 'ERROR',
      msg: 'Hata oluştu',
    });
  }
});



app.post("/fetchStatistics", async (req, res) => {
  try {
    const { username } = req.body
    if (username) {
      const results = await dbQuery('SELECT * FROM user_statistics WHERE username = ?', [username]);

      const notification = results[0].notification
      const friends = results[0].friends
      const country = results[0].country

      const toplam_mac_sayisi = results[0].toplam_mac_sayisi

      const blitz_elo = results[0].normal_mod_puan
      const rapid_elo = results[0].uzun_mod_puan
      const puzzle_elo = results[0].puzzle_puan

      const toplam_normal_mod_mac_sayisi = results[0].toplam_normal_mod_mac_sayisi
      const toplam_uzun_mod_mac_sayisi = results[0].toplam_uzun_mod_mac_sayisi
      const toplam_bulmaca_sayisi = results[0].toplam_bulmaca_sayisi

      const win_normal_mod = results[0].win_normal_mod
      const draw_normal_mod = results[0].draw_normal_mod
      const lose_normal_mod = results[0].lose_normal_mod

      const win_uzun_mod = results[0].win_uzun_mod
      const draw_uzun_mod = results[0].draw_uzun_mod
      const lose_uzun_mod = results[0].lose_uzun_mod
      const inMatch = results[0].inMatch
      const isPremiumUser = results[0].isPremiumUser
      const profileFotoUrl = results[0].profileFotoUrl
      const regDate = results[0].regDate
      const isOnline = results[0].is_online

      res.json({
        status: 'OK',
        msg: "İstatistikler Gönderildi",

        blitz_elo: blitz_elo,
        rapid_elo: rapid_elo,

        toplam_game: toplam_mac_sayisi,
        toplam_bulmaca: toplam_bulmaca_sayisi,

        blitz_win: win_normal_mod,
        blitz_draw: draw_normal_mod,
        blitz_lose: lose_normal_mod,
        rapid_win: win_uzun_mod,
        rapid_draw: draw_uzun_mod,
        rapid_lose: lose_uzun_mod,
        puzzle_elo: puzzle_elo,
        notification: notification,
        country: country,
        friends: friends,
        inMatch: inMatch,
        isPremiumUser,
        profileFotoUrl,
        regDate,
        isOnline
      })
    }
  } catch (error) {
    console.log(error)
  }
})

app.post("/fetchGameStatistics", async (req, res) => {
  try {
    const { game_id } = req.body

    console.log(game_id, req.body)

    // db.query('SELECT * FROM active_games WHERE game_id = ?', [1000000 + game_id], (error, response) => {
    //   if (response.length > 0) {
    //     console.log(response[0])
    //   }
    // })

    const game = await dbQuery('SELECT * FROM active_games WHERE game_id = ?', [1000000 + game_id]);

    if (game.length > 0) {
      const beyazVeri = await dbQuery('SELECT * FROM user_statistics WHERE username = ?', [game[0].playerWhite]);
      const siyahVeri = await dbQuery('SELECT * FROM user_statistics WHERE username = ?', [game[0].playerBlack]);

      res.json({
        status: 'OK',
        beyazVeri,
        siyahVeri
      })
    } else {
      res.json({
        status: 'ERROR',
      })
    }
  } catch (error) {
    console.log(error)
  }
})

app.post("/fetchGameTimer", async (req, res) => {
  try {
    const { game_id } = req.body

    const game = await dbQuery('SELECT * FROM active_games WHERE game_id = ?', [1000000 + game_id]);

    if (game.length > 0) {
      const whiteTime = game[0].whiteDuration;
      const blackTime = game[0].blackDuration;

      res.json({
        status: 'OK',
        whiteTime,
        blackTime
      })
    } else {
      res.json({
        status: 'ERROR',
      })
    }
  } catch (error) {
  }
})

app.post("/fetchLeaderboards", async (req, res) => {
  const blitzResults = await dbQuery('SELECT username, normal_mod_puan AS blitz_elo, profileFotoUrl FROM user_statistics')

  const rapidResults = await dbQuery('SELECT username, uzun_mod_puan AS rapid_elo, profileFotoUrl FROM user_statistics');
  const puzzleResults = await dbQuery('SELECT username, puzzle_puan AS puzzle_elo, profileFotoUrl FROM user_statistics');

  const blitzLeaderboard = blitzResults.map(result => ({
    username: result.username,
    blitz_elo: result.blitz_elo,
    profileFotoUrl: result.profileFotoUrl
  }));

  const rapidLeaderboard = rapidResults.map(result => ({
    username: result.username,
    rapid_elo: result.rapid_elo,
    profileFotoUrl: result.profileFotoUrl
  }));

  const puzzleLeaderboard = puzzleResults.map(result => ({
    username: result.username,
    puzzle_elo: result.puzzle_elo,
    profileFotoUrl: result.profileFotoUrl
  }));

  res.json({
    status: 'OK',
    blitzLeaderboard,
    rapidLeaderboard,
    puzzleLeaderboard
  });
});

app.post('/playerRatingLog', async (req, res) => {
  const { username } = req.body;

  try {
    const [log] = await dbQuery('SELECT * FROM player_rating_log WHERE username = ?', [username]);
    if (log) {
      res.json({ log, status: 'OK', });
    } else {
      res.json({ log_data: JSON.stringify([]) });
    }
  } catch (error) {
    console.error("Error fetching player rating logs: ", error);
    res.status(500).send("Internal Server Error");
  }
});


app.post("/fetchWallet", async (req, res) => {
  try {
    const { username } = req.body
    const results = await dbQuery('SELECT * FROM wallet WHERE username = ?', [username]);

    const coins = results[0].coins;
    const transactions = results[0].transactions;

    res.json({
      status: 'OK',
      msg: "Wallet Gönderildi",
      transactions,
      coins
    })
  } catch (error) {
    console.log(error)
  }
})

app.post("/fetchGameArchive", async (req, res) => {
  try {
    const { username } = req.body

    // if (!username) return res.status(401).send("Geçersiz Kullanıcı Adı")
    const results = await dbQuery('SELECT * FROM games_archive WHERE white_player_name = ? OR black_player_name = ?', [username, username]);
    if (results.length === 0) {
      res.send("Veri yok")
    } else {
      res.status(200)
      res.json({
        status: "OK",
        games: results
      })
    }

  } catch (error) {
    console.log(error)
  }
})

app.post("/fetchGameArchiveStatistics", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) return res.status(401).send("Geçersiz Kullanıcı Adı");

    // Güncel yıl ve ay
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // Ay indeksi 0'dan başladığı için +1 ekliyoruz

    // Güncel ay verilerini çekme
    const monthQuery = `
      SELECT * FROM games_archive
      WHERE (white_player_name = ? OR black_player_name = ?)
      AND YEAR(gameDate) = ?
      AND MONTH(gameDate) = ?
    `;
    const monthResults = await new Promise((resolve, reject) => {
      db.query(monthQuery, [username, username, currentYear, currentMonth], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    // Güncel yıl verilerini çekme
    const yearQuery = `
      SELECT * FROM games_archive
      WHERE (white_player_name = ? OR black_player_name = ?)
      AND YEAR(gameDate) = ?
    `;
    const yearResults = await new Promise((resolve, reject) => {
      db.query(yearQuery, [username, username, currentYear], (err, results) => {
        if (err) reject(err);
        resolve(results);
      });
    });

    // Sonuçları paketleme
    const response = {
      status: "OK",
      monthGames: monthResults,
      yearGames: yearResults,
    };

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).send("Sunucu Hatası");
  }
});

app.get("/fetchTournaments", async (req, res) => {

  try {
    const selectQuery = "SELECT * FROM tournaments";
    db.query(selectQuery, (err, tournaments) => {
      if (err) throw err;

      if (tournaments.length > 0) {

        res.send({
          status: 'OK',
          tournaments
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

app.get("/api/deneme", async (req, res) => {
  try {
    const { friendsUsername } = req.body
    console.log("friendsUsername : ", friendsUsername)
    console.log("req :", req.body)

    const results = await dbQuery('SELECT * FROM user_statistics WHERE username = ?', [friendsUsername]);

    const friends = results[0].friends
    const country = results[0].country

    const toplam_mac_sayisi = results[0].toplam_mac_sayisi

    const blitz_elo = results[0].normal_mod_puan
    const rapid_elo = results[0].uzun_mod_puan
    const puzzle_elo = results[0].puzzle_elo

    const toplam_normal_mod_mac_sayisi = results[0].toplam_normal_mod_mac_sayisi
    const toplam_uzun_mod_mac_sayisi = results[0].toplam_uzun_mod_mac_sayisi
    const toplam_bulmaca_sayisi = results[0].toplam_bulmaca_sayisi

    const win_normal_mod = results[0].win_normal_mod
    const draw_normal_mod = results[0].draw_normal_mod
    const lose_normal_mod = results[0].lose_normal_mod

    const win_uzun_mod = results[0].win_uzun_mod
    const draw_uzun_mod = results[0].draw_uzun_mod
    const lose_uzun_mod = results[0].lose_uzun_mod
    const inMatch = results[0].inMatch


    res.json({
      status: 'OK',
      msg: "İstatistikler Gönderildi",

      blitz_elo: blitz_elo,
      rapid_elo: rapid_elo,

      toplam_game: toplam_mac_sayisi,
      toplam_bulmaca: toplam_bulmaca_sayisi,

      blitz_win: win_normal_mod,
      blitz_draw: draw_normal_mod,
      blitz_lose: lose_normal_mod,
      rapid_win: win_uzun_mod,
      rapid_draw: draw_uzun_mod,
      rapid_lose: lose_uzun_mod,
      puzzle_elo: puzzle_elo,
      country: country,
      friends: friends,
      isOnline: results[0].is_online,
      profileDurum: results[0].profile_durum,
      inMatch: inMatch,
    })
  } catch (error) {
    console.log("error", error)
  }
})

app.post("/searchFriends", async (req, res) => {
  const { username, searchFriendName } = req.body
  console.log(username, searchFriendName)
  console.log(req.body)

  const results = await dbQuery('SELECT * FROM users WHERE username = ?', [searchFriendName])
  if (results.length > 0) {
    console.log("first")

    const results2 = await dbQuery('SELECT * FROM user_statistics WHERE username = ?', [searchFriendName])
    if (err) throw err;
    console.log(results2)
    console.log("second")
    if (results2.length > 0) {
      console.log("third")
      res.json({
        status: 'OK',
        username: results2[0].username,
        country: results2[0].country,
        isOnline: results2[0].is_online,
        profileDurum: results2[0].profile_durum,
      })
    }

  } else {
    console.log("User Was Not Found!")
    res.json({
      status: 'FALSE',
      msg: "User Was Not Found!"
    })
  }
})

app.post("/addFriendRequest", async (req, res) => {
  try {
    const { username, addFriendRequestUsername, date } = req.body;

    if ((username === undefined) || (addFriendRequestUsername === undefined) || date === undefined) {
      console.log("hata");
    } else {

      db.query('SELECT notification FROM user_statistics WHERE username = ?', [addFriendRequestUsername], (err, results) => {
        if (err) console.log(err);

        let existingNotification = results[0].notification;

        if (existingNotification) {
          let veriler = JSON.parse(existingNotification);

          // Aynı kişi zaten istek gönderdiyse ekleme
          if (veriler.some(request => request.username === username)) {
            console.log("Bu kişi zaten istek göndermiş.");
            res.json({
              status: 'Error',
              msg: "Bu kişi zaten istek göndermiş."
            });
          } else {
            const lastItem = veriler[veriler.length - 1];
            const lastItemId = lastItem.id;

            let newRequest = {
              id: lastItemId + 1,
              username: username,
              date: date,
            }

            let notificationArray = existingNotification ? JSON.parse(existingNotification) : [];
            notificationArray.push(newRequest);

            db.query('UPDATE user_statistics SET notification = ? WHERE username = ?', [JSON.stringify(notificationArray), addFriendRequestUsername], (err, results) => {
              if (err) console.log(err)
              res.json({
                status: 'OK',
                msg: "Arkadaşlık isteği gönderildi"
              });
            });
          }
        } else {
          let newRequest = {
            id: 0,
            username: username,
            date: date,
          }

          let notificationArray = existingNotification ? JSON.parse(existingNotification) : [];
          notificationArray.push(newRequest);

          db.query('UPDATE user_statistics SET notification = ? WHERE username = ?', [JSON.stringify(notificationArray), addFriendRequestUsername], (err, results) => {
            if (err) console.log(err)
            res.json({
              status: 'OK',
              msg: "Arkadaşlık isteği gönderildi"
            });
          });
        }
      });
    }
  } catch (error) {
    console.log(error);
  }
});



app.post("/deleteFriendRequest", async (req, res) => {
  try {
    const { username, addFriendRequestUsername, id } = req.body;

    console.log(id);

    if ((username === undefined) || (addFriendRequestUsername === undefined) || id === undefined) {
      console.log("hata");
      res.status(400).json({ error: "Hatalı istek parametreleri" });
    } else {
      db.query('SELECT notification FROM user_statistics WHERE username = ?', [username], (err, results) => {
        if (err) {
          console.log(err);
          res.status(500).json({ error: "Veritabanı hatası" });
        } else {
          let existingNotification = results[0].notification;

          if (existingNotification) {
            let veriler = JSON.parse(existingNotification);

            // Belirli bir ID'ye sahip isteği kaldırmak için
            const updatedNotification = veriler.filter(request => request.id !== id);

            if (updatedNotification.length === 0) {
              db.query('UPDATE user_statistics SET notification = ? WHERE username = ?', ['', username], (err, results) => {
                if (err) {
                  console.log(err);
                  res.status(500).json({ error: "Veritabanı hatası" });
                } else {
                  res.json({
                    status: 'OK',
                    msg: "Arkadaşlık isteği kaldırıldı"
                  });
                }
              });

            } else {
              db.query('UPDATE user_statistics SET notification = ? WHERE username = ?', [JSON.stringify(updatedNotification), username], (err, results) => {
                if (err) {
                  console.log(err);
                  res.status(500).json({ error: "Veritabanı hatası" });
                } else {
                  res.json({
                    status: 'OK',
                    msg: "Arkadaşlık isteği kaldırıldı"
                  });
                }
              });
            }

          } else {
            console.log("Veritabanında veri bulunmuyor.");
            res.json({
              status: 'Error',
              msg: "Veritabanında veri bulunmuyor."
            });
          }
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});


app.post("/acceptFriendRequest", async (req, res) => {
  try {
    const { username, acceptFriendUsername, id } = req.body;

    console.log(id);

    if ((username === undefined) || (acceptFriendUsername === undefined) || id === undefined) {
      console.log("hata");
      res.status(400).json({ error: "Hatalı istek parametreleri" });
    } else {
      console.log(username, acceptFriendUsername, id)

      // 1

      db.query('SELECT friends FROM user_statistics WHERE username = ?', [username], (err, results) => {
        if (err) console.log(err);

        let existingNotification = results[0].friends;

        if (existingNotification) {
          let veriler = JSON.parse(existingNotification);
          const lastItem = veriler[veriler.length - 1];
          const lastItemId = lastItem.id;

          let newRequest = {
            frinedID: lastItemId + 1,
            friendsUsername: acceptFriendUsername,
            date: new Date(),
          }

          let notificationArray = existingNotification ? JSON.parse(existingNotification) : [];
          notificationArray.push(newRequest);

          db.query('UPDATE user_statistics SET friends = ? WHERE username = ?', [JSON.stringify(notificationArray), username], (err, results) => {
            if (err) console.log(err)
          });
        } else {
          let newRequest = {
            id: 0,
            friendsUsername: acceptFriendUsername,
            date: new Date(),
          }

          let notificationArray = existingNotification ? JSON.parse(existingNotification) : [];
          notificationArray.push(newRequest);

          db.query('UPDATE user_statistics SET friends = ? WHERE username = ?', [JSON.stringify(notificationArray), username], (err, results) => {
            if (err) console.log(err)
          });
        }
      });

      // 2

      db.query('SELECT friends FROM user_statistics WHERE username = ?', [acceptFriendUsername], (err, results) => {
        if (err) console.log(err);

        let existingNotification = results[0].friends;

        if (existingNotification) {
          let veriler = JSON.parse(existingNotification);
          const lastItem = veriler[veriler.length - 1];
          const lastItemId = lastItem.id;

          let newRequest = {
            id: lastItemId + 1,
            friendsUsername: username,
            date: new Date(),
          }

          let notificationArray = existingNotification ? JSON.parse(existingNotification) : [];
          notificationArray.push(newRequest);

          db.query('UPDATE user_statistics SET friends = ? WHERE username = ?', [JSON.stringify(notificationArray), acceptFriendUsername], (err, results) => {
            if (err) console.log(err)
          });
        } else {
          let newRequest = {
            id: 0,
            friendsUsername: username,
            date: new Date(),
          }

          let notificationArray = existingNotification ? JSON.parse(existingNotification) : [];
          notificationArray.push(newRequest);

          db.query('UPDATE user_statistics SET friends = ? WHERE username = ?', [JSON.stringify(notificationArray), acceptFriendUsername], (err, results) => {
            if (err) console.log(err)
          });
        }
      });

      res.json({
        status: 'OK',
        msg: "Arkadaşlık isteği kabul edildi"
      });
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

app.get('/piece/ana/bwK.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/ana', 'bwK.png');
  res.sendFile(filePath)
})

// siyah ana
app.get('/piece/ana/bN.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/ana', 'bN.png');
  res.sendFile(filePath)
})
app.get('/piece/ana/bB.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/ana', 'bB.png');
  res.sendFile(filePath)
})
app.get('/piece/ana/bK.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/ana', 'bK.png');
  res.sendFile(filePath)
})
app.get('/piece/ana/bP.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/ana', 'bP.png');
  res.sendFile(filePath)
})
app.get('/piece/ana/bQ.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/ana', 'bQ.png');
  res.sendFile(filePath)
})
app.get('/piece/ana/bR.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/ana', 'bR.png');
  res.sendFile(filePath)
})

// beyaz ana

app.get('/piece/ana/wN.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/ana', 'wN.png');
  res.sendFile(filePath)
})
app.get('/piece/ana/wB.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/ana', 'wB.png');
  res.sendFile(filePath)
})
app.get('/piece/ana/wK.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/ana', 'wK.png');
  res.sendFile(filePath)
})
app.get('/piece/ana/wP.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/ana', 'wP.png');
  res.sendFile(filePath)
})
app.get('/piece/ana/wQ.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/ana', 'wQ.png');
  res.sendFile(filePath)
})
app.get('/piece/ana/wR.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/ana', 'wR.png');
  res.sendFile(filePath)
})

// siyah wikipedia
app.get('/piece/wikipedia/bN.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/wikipedia', 'bN.png');
  res.sendFile(filePath)
})
app.get('/piece/wikipedia/bB.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/wikipedia', 'bB.png');
  res.sendFile(filePath)
})
app.get('/piece/wikipedia/bK.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/wikipedia', 'bK.png');
  res.sendFile(filePath)
})
app.get('/piece/wikipedia/bP.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/wikipedia', 'bP.png');
  res.sendFile(filePath)
})
app.get('/piece/wikipedia/bQ.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/wikipedia', 'bQ.png');
  res.sendFile(filePath)
})
app.get('/piece/wikipedia/bR.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/wikipedia', 'bR.png');
  res.sendFile(filePath)
})

// beyaz wikipedia

app.get('/piece/wikipedia/wN.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/wikipedia', 'wN.png');
  res.sendFile(filePath)
})
app.get('/piece/wikipedia/wB.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/wikipedia', 'wB.png');
  res.sendFile(filePath)
})
app.get('/piece/wikipedia/wK.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/wikipedia', 'wK.png');
  res.sendFile(filePath)
})
app.get('/piece/wikipedia/wP.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/wikipedia', 'wP.png');
  res.sendFile(filePath)
})
app.get('/piece/wikipedia/wQ.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/wikipedia', 'wQ.png');
  res.sendFile(filePath)
})
app.get('/piece/wikipedia/wR.png', (req, res) => {
  const filePath = path.join(__dirname, 'public/piece/wikipedia', 'wR.png');
  res.sendFile(filePath)
})


app.post('/register', (req, res) => {
  const { username, email, password, country } = req.body

  console.log(username, email, password, country)
  db.query(
    'SELECT * FROM users WHERE email = ? AND username = ?', // aynı kullanıcı adına sahip başka birisi varmı ?
    [email, username],
    (error, results) => {
      if (error) return res.json(err)

      if (results.length > 0) {
        res.json({ kayit: false, msg: 'Kullanıcı Adı ve Email daha önce alınmış' });
        return;
      }
      db.query(
        'SELECT * FROM users WHERE email = ?', // aynı kullanıcı adına sahip başka birisi varmı ?
        [email],
        (error, results) => {
          if (error) return res.json(err)

          if (results.length > 0) {
            res.json({ kayit: false, msg: 'Email daha önce alınmış' });
            return;
          }
          db.query(
            'SELECT * FROM users WHERE username = ?', // aynı kullanıcı adına sahip başka birisi varmı ?
            [username],
            (error, results) => {
              if (error) return res.json(err)

              if (results.length > 0) {
                res.json({ kayit: false, msg: 'Kullanıcı Adı daha önce alınmış' });
                return;
              }
              // Şifre hash'leme
              bcrypt.hash(password, saltRounds, (err, hash) => {
                if (err) res.json({ kayit: false, msg: "User failed to register" })

                // Kullanıcıyı veritabanına kaydetme
                db.query('INSERT INTO users (googleID, username, email, password, isEmailVerify) VALUES (?, ?, ?)', [0, username, email, hash], (err) => {
                  if (err) res.json({ kayit: false, msg: "User failed to register" })
                  res.status(200).json({ msg: "Kayıt Başarılı", kayit: true })
                  console.log("Kayıt Başarılı   Yönlendiriliyorsunuz...")

                  db.query('INSERT INTO user_statistics (username, country, isPremiumUser, normal_mod_puan, uzun_mod_puan, puzzle_puan, toplam_mac_sayisi, toplam_normal_mod_mac_sayisi, toplam_uzun_mod_mac_sayisi, toplam_bulmaca_sayisi, win_normal_mod, draw_normal_mod, lose_normal_mod, win_uzun_mod, draw_uzun_mod, lose_uzun_mod, puzzle_elo, friends, profile_durum, is_online, inMatch, notification, profileFotoUrl) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ', [username, country, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', 0, 0, '', null], (err) => {
                    if (err) console.log(err)
                    console.log("İstatistik Kayıt Başarılı")
                  })

                  db.query('INSERT INTO wallet (username, coins, transactions) VALUES (?, ?, ?) ', [username, 0, '[]'], (err) => {
                    if (err) console.log(err)
                    console.log("Wallet Kayıt Başarılı")
                  })
                }
                );
              });
            })
        }
      );
    }
  )
});



app.post('/login', async (req, res) => {
  const username = req.body.username
  const email = req.body.email
  const password = req.body.password
  const giris_sekli = req.body.giris_sekli

  if (giris_sekli === 'username') {
    console.log("Bilgiler", username, password, giris_sekli)
    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, result) => {
      if (err) return res.json(err)
      if (result.length === 0) return res.json({ giris: false, msg: "User not found!" })

      const isPasswordCorrect = await bcrypt.compare(password, result[0].password);
      if (!isPasswordCorrect) return res.json({ giris: false, msg: "Wrong username or password!" })
      console.log("Parola :", isPasswordCorrect)

      const key = crypto.randomBytes(32).toString('hex');
      console.log('Oluşturulan Anahtar:', key);
      const token = jwt.sign(
        {
          id: result[0].id,
          username: result[0].username,
        },
        key,
        { expiresIn: '1h' });

      res.json({
        giris: true,
        msg: "Giriş Yapılıyor...",
        token: token,
        id: result[0].id,
        username: result[0].username
      });
    })
  }
  if (giris_sekli === 'email') {
    console.log("Bilgiler", email, password, giris_sekli)
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
      if (err) return res.json(err)
      if (result.length === 0) return res.json({ giris: false, msg: "User not found!" })

      const isPasswordCorrect = bcrypt.compare(password, result[0].password);
      if (!isPasswordCorrect) {
        res.json({ giris: false, msg: "Wrong username or password!" })
      } else {

        const key = crypto.randomBytes(32).toString('hex');
        console.log('Oluşturulan Anahtar:', key);

        console.log("Parola :", isPasswordCorrect)
        const token = jwt.sign(
          {
            id: result[0].id,
            username: result[0].username,
          },
          key,
          { expiresIn: '1h' });

        res.json({
          giris: true,
          msg: "Giriş Yapılıyor...",
          token: token,
          id: result[0].id,
          username: result[0].username
        });
      }
    })
  }


});


server.listen(PORT, (err) => {
  if (err) {
    console.log("Hata")
  } else {
    console.log("Server is running...")
    console.log("heyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy")
  }
})