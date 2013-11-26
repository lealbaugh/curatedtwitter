var twitter = require('ntwitter');
var keys = require("./apikeys.js");
var screen_name = "gnurr";

var twit = new twitter({
	consumer_key: keys.consumer_key,
	consumer_secret: keys.consumer_secret,
	access_token_key: keys.access_token_key,
	access_token_secret: keys.access_token_secret
});


function openStream(user_id){
	twit.stream('statuses/filter', {follow:user_id}, function(stream){
		console.log("making a stream for user ", user_id);
		stream.on('data', function (data){
			if (data.id_str){
				id = data.id_str				
				twit.retweetStatus(id, function(data){
					console.log("retweeted!");
				});
			}	
		});
	});
}


function initiateStream(screen_name) {
	twit.get("/users/show.json", {"screen_name":screen_name}, function(fake, data) {
		console.log("USER ID: ",data.id);
		openStream(data.id);
	});
};


function pluck(tweet, keys){
	return keys.reduce(function(a, k){
		a[k] = tweet[k];
		return a;
	}, {});
}

// Make it go!
initiateStream(screen_name);

// twit.updateStatus("Hello?", null, function(){
// 	console.log("tweeted");
// })