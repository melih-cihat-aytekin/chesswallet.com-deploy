import axios from "axios";

axios.post('https://chesswallet-com-server.onrender.com/register', ({ withCredentials: true,}), (req, res) => {
      console.log(req.data)
    }).then(response => {
      console.log(response.data)
      setTimeout(() => {
        if (response.data.kayit) {
          // window.location = `http://localhost:3000/${user}/home`
        }
      }, 1500)
    })