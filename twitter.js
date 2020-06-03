const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
const fs = require('fs');
const config = require('./config.json');
const cookies = require('./cookies.json');

let URL = 'https://twitter.com/explore';
let API_url = "https://api.chucknorris.io/jokes/random";
let message = "this tweet was created by a bot, please ignore";



const twitter = {
  // properties:
  browser: null,
  page: null,

  // functions:
  initialize: async () => {
    twitter.browser = await puppeteer.launch({
      headless: false,
      ignoreHTTPSErrors: true,
      defaultViewport: {
        width: 1820,
        height: 920
      }
    });
    twitter.page = await twitter.browser.newPage();
  },

  login: async () => {
    if(Object.keys(cookies).length) {
      await twitter.page.setCookie(...cookies);
      await twitter.page.goto( URL, {
        waitUntil: 'networkidle2',
        timeout: 1200000
      });
    } else {
      await twitter.page.goto( URL, {
        waitUntil: 'networkidle2',
        timeout: 110000
      });
      await twitter.page.waitFor('div[aria-haspopup = "true"]');
      await twitter.page.waitFor(5000);
      
      let button = await twitter.page.$$('a[data-testid = "login"]');
      await button[0].click();
      
      await twitter.page.waitFor(5000);
      try {
        await twitter.page.waitFor('div[data-testid = "LoginForm_Login_Button"]');
      } catch(error) {
        console.log(error);
        process.exit(0);
      }


      await twitter.page.type('input[name="session[username_or_email]"]', config.username, { delay: 50 });
      await twitter.page.type('input[name="session[password]"]', config.password, { delay: 50 });
      button = await twitter.page.$$('div[data-testid = "LoginForm_Login_Button"]');
      await button[0].click();

      try {
        await twitter.page.waitFor('div[data-testid="SideNav_AccountSwitcher_Button"]');
      } catch(error) {
        console.log(error);
        process.exit(0);
      }

      let currentCookies = await twitter.page.cookies();
      fs.writeFileSync('./cookies.json', JSON.stringify(currentCookies, null, 2), error => {
        if(error)
          console.log(error);
      });

    }
  },

  tweet: async () => {
    await twitter.page.waitFor(5000);
    let button = await twitter.page.$$('nav>a[data-testid="AppTabBar_Home_Link"]');
    await button[0].click();
    await twitter.page.waitFor('div[data-testid="SideNav_AccountSwitcher_Button"]');
    await twitter.page.waitFor(5000);
    button = await twitter.page.$$('a[data-testid="SideNav_NewTweet_Button"]');
    await button[0].click();
    await twitter.page.waitFor('div[role="presentation"]');
    await twitter.page.waitFor(5000);

    message = await fetch(API_url);
    message = await message.json();
    message = await message.value;

    await twitter.page.waitFor('div[data-testid="tweetButton"]');
    await twitter.page.waitFor(5000);

    await twitter.page.type('div[class="public-DraftStyleDefault-block public-DraftStyleDefault-ltr"]', message, { delay: 50 });
    await twitter.page.waitFor(5000);
    button = await twitter.page.$$('div[data-testid="tweetButton"]');
    await button[0].click();

  },

  logout: async () => {
    await twitter.page.waitFor('div[data-testid="SideNav_AccountSwitcher_Button"]');
    await twitter.page.waitFor(5000);
    let button = await twitter.page.$$('div[data-testid="SideNav_AccountSwitcher_Button"]');
    await button[0].click();
    await twitter.page.waitFor('div[role="presentation"]');
    await twitter.page.waitFor(5000);
    // await twitter.page.waitFor('a[data-testid="AccountSwitcher_Logout_Button"]');
    button = await twitter.page.$$('a[data-testid="AccountSwitcher_Logout_Button"]');
    await button[0].click();
    await twitter.page.waitFor('div[data-testid="confirmationSheetConfirm"]');
    button = await twitter.page.$$('div[data-testid="confirmationSheetConfirm"]');
    await button[0].click();

    let temp = {};
    fs.writeFile('./cookies.json', JSON.stringify(temp), error => {
      if(error)
        console.log(error);
    });

  },

  wrapup: async () => {
    await twitter.page.waitFor(5000);
    twitter.browser.close();
  }
}

module.exports = twitter;