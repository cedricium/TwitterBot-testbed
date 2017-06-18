// Required packages for running this bot
var Twit = require('twit');
var fs = require('fs');
var download = require('image-downloader');

var config = require('./config');

// creating new Twitter instance with @twitbot_testbed's credentials
var T = new Twit(config);

// creating a stream event of type 'user'
var stream = T.stream('user');

console.log('event: bot_started');

// user stream event listens for type 'tweet' (in this case mentions)
stream.on('tweet', tweetEvent);

// method used to construct a tweet with an image and the given text
function tweet(text) {
  console.log('event: creating_reply_to_mention');
  
  var newTweet = text;
  
  // info needed to upload RoboHash image
  var filename = 'pics/RoboHash.png';
  var params = {
    encoding: 'base64'
  }

  var b64content = fs.readFileSync(filename, params);

  // uploading RoboHash image
  T.post('media/upload', { media: b64content }, uploaded);
  
  function uploaded(err, data, response) {
      var idStr = data.media_id_string;
      var tweet = {
        status: newTweet,
        media_ids: [idStr]
      }

      T.post('statuses/update', tweet, tweeted);
    }

    function tweeted(err, data, response) {
      if (err)
        console.log(err);
      if (data)
        console.log('event: tweet_with_image_successful');
    }
}

// method used for handling 'tweet' events
function tweetEvent(eventMsg) {
  console.log('event: mention_occurred');
  
  var json = JSON.stringify(eventMsg, null, 2);
  fs.writeFile('tweet.json', json);
  
  var replyTo;
  
  // if tweet event was a direct reply ('@twitbot_testbed ....')
  if (eventMsg.in_reply_to_screen_name != null)
    replyTo = eventMsg.in_reply_to_screen_name;
  // this covers tweets that start with text first ('... @twitbot_testbed')
  else if (eventMsg.in_reply_to_screen_name == null && 
           eventMsg.entities.user_mentions.length == 1)
    replyTo = eventMsg.entities.user_mentions[0].screen_name;
           
  var text = eventMsg.text;
  var from = eventMsg.user.screen_name;
  
  if (replyTo === 'twitbot_testbed') {
    newTweet = 'Hey @' + from + ', here is your unique RoboHash gravatar!';
    
    // download RoboHash unique image with from's handle
    var beginningURL = 'https://robohash.org/set_set1/bgset_bg1/',
        endingURL = '?size=500x500',
        usersURL = beginningURL + from + endingURL;
    
    const options = {
      url: usersURL,
      dest: 'pics/RoboHash.png'
    }
    
    download.image(options)
    .then(({ filename, image }) => {
      console.log('File saved to', filename);
      tweet(newTweet);
    }).catch((err) => {
      throw err
    });
  }
}