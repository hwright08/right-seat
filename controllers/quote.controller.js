const axios = require('axios');

/** Get a random quote from ZenQuotes */
exports.getRandomQuote = async () => {
  const { data } = await axios.get('https://zenquotes.io/api/random');
  return data[0];
}
