const axios = require('axios'); // axios modülünü alın

const fetchData = async () => {
  const options = {
    method: 'GET',
    url: 'https://chess-puzzles.p.rapidapi.com/',
    params: {
      themes: '["middlegame","advantage"]',
      rating: '1500',
      themesType: 'ALL',
      playerMoves: '4',
      count: '25'
    },
    headers: {
      'X-RapidAPI-Key': 'c023473017msh4bcc72c2ab900c5p1970f1jsndc10439b8c96',
      'X-RapidAPI-Host': 'chess-puzzles.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options); // axios fonksiyonunu düzgün şekilde kullanın
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

module.exports = fetchData;
