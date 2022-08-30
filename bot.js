let Discord = require('discord.io');
let logger = require('winston');
let auth = require('./auth.json');

// Configure logger settings

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';

// Initialize Discord Bot
let bot = new Discord.Client({
  token: auth.token,
  autorun: true
});

bot.on('ready', function (evt) {
  logger.info('Connected');
  logger.info('Logged in as: ');
  logger.info(bot.username + ' - (' + bot.id + ')');
});


function formatArray(message, arr) {
  let build = message + "\n";
  for (let i = 0; i < arr.length; i++) {
    build += '`' + arr[i] + "`\n";
  }

  return build;
}

function getCardValue(card) {
  const isAlpha = str => /^[a-zA-Z]*$/.test(str);
  if (isAlpha(card.Value)) {
    if (card.Value == 'Ace')
      return 11;
    else
      return 10;
  } else {
    return parseInt(card.Value);
  }
}

function getCards (card1, card2) {
  let cards = card1.Value + ' ' + card1.Suit + ' and ';
  cards += card2.Value + ' ' + card2.Suit;
  let val1 = getCardValue(card1);
  let val2 = getCardValue(card2);
  let tot = 0;
  if (val1 == 11 && val2 == 11)
    tot = 12;
  else
    tot = val1 + val2
  return cards + ' for a value of ' + tot;
}

function playBlackjack(channelID) {
const suits = [":spades:", ":diamonds:", ":clubs:", ":hearts:"];
const values = [
  "Ace",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "Jack",
  "Queen",
  "King",
  ];

  let deck = [];

  for (let i = 0; i < suits.length; i++) {
    for (let x = 0; x < values.length; x++) {
      let card = { Value: values[x], Suit: suits[i] };
      deck.push(card);
    }
  }

  // shuffle the cards
  for (let i = deck.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    let temp = deck[i];
    deck[i] = deck[j];
    deck[j] = temp;
  }

  bot.sendMessage({
    to: channelID,
    message: 'Your cards are: ' + getCards(deck[0], deck[2])
  });

  bot.sendMessage({
    to: channelID,
    message: 'The dealer\'s cards are: ' + getCards(deck[1], deck[3])
  });

}

bot.on('message', function (user, userID, channelID, message, evt) {

// Our bot needs to know if it will execute a command
// It will listen for messages that will start with `!`

let commands = ['!help', '!play', '!daily']
let games = ['Blackjack']

if (message.substring(0, 1) == '!') {
  let args = message.substring(1).split(' ');
  let cmd = args[0];
  //args = args.splice(1);
  switch(cmd) {
    case 'help':
      bot.sendMessage({
        to: channelID,
        message: formatArray('Here is a list of commands you can use!', commands)
      });
      break;
    case 'play':
      if (args.length != 2) {
        bot.sendMessage({
          to: channelID,
          message: 'The proper way to call this command is `!play <game>`\n' +
            formatArray('Here is a list of available games!', games)
        });
      }
      else {
        switch(args[1].toLowerCase()) {
          case 'blackjack':
            playBlackjack(channelID);
            break;
        }
      }
    break;
  }
 }
});
