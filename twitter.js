var keys = require("./apikeys.js");

var mongo = require('mongodb');
var mongoUri = keys.mongoURL;

function putInCollection(thisobject, collectionname){
	mongo.Db.connect(mongoUri, function (err, db) {
		if (err) {
			console.log(err);
		}
		console.log("Connected to db.");
		db.collection(collectionname, function(er, collection) {
			console.log("Got collection ", collectionname);
			collection.insert(thisobject, {safe: true}, function(er,rs) {
				if (er) {
					console.log(er);
				}
				console.log("Inserted tweet into DB:", thisobject);
				db.close();
			});
		});
	});
};


var twitter = require('ntwitter');

var retweeter = new twitter({
	consumer_key: keys.retweeter_consumer_key,
	consumer_secret: keys.retweeter_consumer_secret,
	access_token_key: keys.retweeter_access_token_key,
	access_token_secret: keys.retweeter_access_token_secret
});

var sourcetweeter = new twitter({
	consumer_key: keys.source_consumer_key,
	consumer_secret: keys.source_consumer_secret,
	access_token_key: keys.source_access_token_key,
	access_token_secret: keys.source_access_token_secret
});


function openUserStream(source, re){
	source.stream('user', {}, function(stream){
		console.log("Making my stream.");
		stream.on('data', function (data){
			if(data.event == "favorite") {
				console.log(data.source.name+" favorited "+data.target.name+"\'s tweet: "+data.target_object.text+" ("+data.target_object.id_str+")");
				thistweet = condenseTweet(data.target_object);
				putInCollection(thistweet, "tweets");
			}
			if(data.retweeted_status) {
				console.log("Retweeted by "+data.user.name+": "+data.retweeted_status.text);
				thistweet = condenseTweet(data.retweeted_status);
				putInCollection(thistweet, "tweets");
			}

			console.log("-------------------------------------------------------------------------------------------------------");
		});
	});
}

// if retweeted = false:
// 	if (tweet is notable):
// 		retweet it
// 		notate it as retweeted

// 		"favorited_by": tweet.source.name,
// 		"retweeted": false,


function condenseTweet(tweet) {
	return {
		"tweet_id": tweet.id_str,
		"author": tweet.user.id_str,
		"author_id": tweet.user.name,
		"text": tweet.text,
		"retweet_count": tweet.retweet_count,
		"favorite_count": tweet.favorite_count
				}
}


function pluck(tweet, keys){
	return keys.reduce(function(a, k){
		a[k] = tweet[k];
		return a;
	}, {});
}

// Make it go!
console.log("going");
// putInCollection({"Hi":"hi"}, "tweets");
openUserStream(sourcetweeter, retweeter);