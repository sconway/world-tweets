// Require our dependencies
var express = require('express'),
  http      = require('http'),
  sentiment = require('sentiment'),
  twitter   = require('twitter'),
  io        = require('socket.io'),
  path      = require('path'),
  config    = require('./config'),
  app       = express(),
  port      = process.env.PORT || 1243,
  numTweets = 0,
  term;


// Disable etag headers on responses
app.disable('etag');

// Create a new ntwitter instance
var twit = new twitter(config.twitter);


// Fire this bitch up (start our server)
var server = http.createServer(app).listen(port, function() {
  console.log('Express server listening on port ' + port);
});


// Index Route
app.get('/', function(req, res) {

  // Set /public as our static content dir
  app.use("/", express.static(__dirname + "/"));

  res.sendFile(path.join(__dirname, 'index.html'));

  // Filter based on a search term or nothing, if no term is provided
  term = req.query.term || ' ';

  init(term);

});


/**
 * Initializes the web socket and handlers.
 */
const init = (term) => {
  // Initialize socket.io
  var sock = io.listen(server);

  sock.on("connection", (socket) => {
    initStream(term, socket);

    // If we get a country change, refine the stream.
    socket.on("countryChange", (country) => {
      var latLon = country["west"] + ',' + country["south"] + ',' + 
                   country["east"] + ',' + country["north"];

      initStream(term, sock, latLon);
    });

    // If the country changes back to the world view, restart the main stream.
    socket.on("countryChangeBack", () => {
      initStream(term, sock, null);
    });
  }); 
}


/**
 * Sets up and starts our tweet stream, sending the tweet to the client
 * as they come in via a web socket.
 * 
 * @param    term    :    String
 * @param    socket  :    Object
 * @param    coords  :    String
 *
 */
const initStream = (term, sock, coords) => {

  // If there is already a stream, destroy it.
  if (twit.currentTwitStream) {
    console.log("Destroying Current Twitter Stream");
    twit.currentTwitStream.destroy();
  }

  // Set a stream listener for tweets with geo location
  twit.stream('statuses/filter', 
              { locations: coords || '-180,-90,180,90' }, function(stream) {

    stream.on('data', function(data) {

      if (data['user'] !== undefined) {

        // Construct a new tweet object if we have coordinates to use
        if (data['coordinates'] && data['text'].indexOf(term) >= 0) {

          var tweet = {
            twid:        data['id_str'],
            active:      false,
            author:      data['user']['name'],
            avatar:      data['user']['profile_image_url'],
            body:        data['text'],
            date:        data['created_at'],
            screenname:  data['user']['screen_name'],
            coordinates: data['coordinates'],
            sentiment: sentiment(data['text'])
          };

          if (!coords) {

            if (numTweets%4 === 0) sock.emit('tweet', tweet);

          } else {

            sock.emit('tweet', tweet);

          }

          numTweets += 1;
        }

      }

    });

    stream.on('error', function(error) {
      sock.emit("error: ", error);
      
      throw error;
    });

    twit.currentTwitStream = stream;

  });

}
