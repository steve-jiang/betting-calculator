process.stdin.setEncoding('utf8');

/**
 * Hash table to store all bets for each product
 */
const game = {};

/**
 * Store config for each product/game including its commission
 */
const productConfigs = [
  { 
    code: 'w',
    name: 'Win',
    commission: 0.15
  },
  {
    code: 'p',
    name: 'Place',
    commission: 0.12
  },
  {
    code: 'e',
    name: 'Exacta',
    commission: 0.18
  }
];

/**
 * Util function to process each bet into a hash table for further lookup and calculation
 * @param {string} product - the code of the product, e.g. 'w', 'p' or 'e'
 * @param {string} selections - the selection(s) of each bet, could be single selection like '1' or multiple selections that is comma seperated: '1,2'
 * @param {string} stake - the amount of the bet, in string
 */
const processBet = (product, selections, stake) => {
  const currentGame = game[product];
  const stakeNum = Number(stake);
  if (currentGame) {
    game[product] = {
      ...currentGame,
      pool: currentGame.pool + stakeNum,
      [selections]: currentGame[selections] ? currentGame[selections] + stakeNum : stakeNum
    }
    return;
  }

  game[product] = {
    pool: stakeNum,
    [selections]: stakeNum
  }
};

/**
 * Util function to process the result input, it outputs the result to stdout
 * @param {string} first - winner of the game
 * @param {string} second - second place of the game
 * @param {string} third - thrid place of the game
 */
const processResult = (first, second, third) => {
  const output = productConfigs.reduce((content, config) => {
    const { code, name, commission } = config;
    const poolAfterCommission = game[code].pool * (1 - commission);
    
    switch (code) {
      case 'w': {
        const dividend = poolAfterCommission / game[code][first]
        content += `${name}:${first}:$${dividend.toFixed(2)}\n`;
        break;
      }
      case 'p': {
        const placePoolIndividual = poolAfterCommission / 3;
        const dividendFirst = placePoolIndividual / game[code][first];
        const dividendSecond = placePoolIndividual / game[code][second];
        const dividendThird = placePoolIndividual / game[code][third];
        content += `${name}:${first}:$${dividendFirst.toFixed(2)}\n`;
        content += `${name}:${second}:$${dividendSecond.toFixed(2)}\n`;
        content += `${name}:${third}:$${dividendThird.toFixed(2)}\n`;
        break;
      }
      case 'e': {
        const dividend = poolAfterCommission / game[code][`${first},${second}`];
        content += `${name}:${first},${second}:$${dividend.toFixed(2)}\n`;
        break;
      }
    }
    return content;
  }, '');

  // Stdout the dividents
  console.log("\n======== Dividents ========\n")
  console.log(output);
  process.exit();
};

/**
 * Util function to process each line input, routes to processBet or processResult depends on the input
 * @param {string} line - stdin of each line
 */
const processLineInput = (line) => {
  const [key, ...params] = line.split(':');
  switch (key) {
    case 'bet':
      processBet(...params);
      break;
    case 'result':
      processResult(...params);
      break
    default:
      // do nothing
  }
};

/**
 * Entry point of the app, add listener to each line input
 */
const main = () => {
  process.stdout.write(`\nPlease enter the bet(s), enter the result as the last input/line to calculate the dividends:\n`);
  
  process.stdin.on('data', (data) => {
    const lineInput = data.toLowerCase().trim();
    processLineInput(lineInput);
  });
}

main();