const axios = require('axios');

exports.getRandomQuote = async () => {
  const { data } = await axios.get('https://zenquotes.io/api/random');
  return data[0];
}
