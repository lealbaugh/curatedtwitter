var twitter = require('ntwitter');
var keys = require("./apikeys.js");

var twit = new twitter({
	consumer_key: keys.consumer_key,
	consumer_secret: keys.consumer_secret,
	access_token_key: keys.access_token_key,
	access_token_secret: keys.access_token_secret
});

twit.stream('statuses/filter', {follow:'107145739'}, function(stream){
	console.log("making a stream");
	stream.on('data', function (data){
		if (data.text){
			console.log(pluck(data, ["text"]));
		}	
	});
});