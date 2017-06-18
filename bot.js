var Twit = require('twit');
var fs = require('fs');
var download = require('image-downloader');

var config = require('./config');

var T = new Twit(config);


var stream = T.stream('user');


options = {
  url: 'https://robohash.org/set_set1/bgset_bg1/twitbot_testbed?size=500x500',
  dest: 'RoboHash.png'
}

download.image(options);


// Posting a tweet w/ an image
tweetIt();

function tweetIt() {
  postImage();
  function postImage() {
    var filename = 'RoboHash.png';
    var params = {
      encoding: 'base64'
    }

    var b64content = fs.readFileSync(filename, params);

    T.post('media/upload', { media: b64content }, uploaded);

    function uploaded(err, data, response) {
      var idStr = data.media_id_string;
      var tweet = {
        status: 'testing posting a tweet with an image',
        media_ids: [idStr]
      }

      T.post('statuses/update', tweet, tweeted);
    }

    function tweeted(err, data, response) {
      if (err)
        console.log(err);
      if (data)
        console.log(data);
    }
  }
}