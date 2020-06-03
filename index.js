const twitter = require('./twitter');
const cron = require('node-cron');

(() => {

  cron.schedule('0 */3 * * * *', async() => {
    await twitter.initialize();
    await twitter.login();
    await twitter.tweet();
    await twitter.logout();
    await twitter.wrapup();
  });

})();