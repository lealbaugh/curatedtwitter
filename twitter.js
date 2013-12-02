var keys = require("./apikeys.js");

var mongo = require('mongodb');
var mongoUri = process.env.MONGOHQ_URL || require("./apikeys.js").mongoURL;

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
				console.log("Inserted tweet into DB.");
				db.close();
			});
		});
	});
};

var screen_name = "gnurr";
var twitter = require('ntwitter');
// var twit = new twitter({
// 	consumer_key: process.env.TWITTER_CONSUMER_KEY || require("./apikeys.js").consumer_key,
// 	consumer_secret: process.env.TWITTER_CONSUMER_SECRET || require("./apikeys.js").consumer_secret,
// 	access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY || require("./apikeys.js").access_token_key,
// 	access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET || require("./apikeys.js").access_token_secret
// });

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


function openStream(user_id){
	twit.stream('statuses/filter', {follow:user_id}, function(stream){
		console.log("Making a stream for user #", user_id, ".");
		stream.on('data', function (data){
			if (data.id_str){
				id = data.id_str
				putInCollection(data, "tweets");
				twit.retweetStatus(id, function(data){
					console.log("retweeted!");
				});
			}	
		});
		stream.on('event', function (e){
			console.log(e);
		})
	});
}

function initiateStream(screen_name) {
	twit.get("/users/show.json", {"screen_name":screen_name}, function(fake, data) {
		openStream(data.id);
	});
};


function openUserStream(source, re){
	source.stream('user', {follow:user_id}, function(stream){
		console.log("Making my stream.");
		stream.on('data', function (data){
			if (data.id_str){
				id = data.id_str
				putInCollection(data, "tweets");
				re.retweetStatus(id, function(data){
					console.log("retweeted!");
				});
			}	
		});
		stream.on('event', function (e){
			console.log(e);
		})
	});
}

// {
// 	"tweet_id": id_str,
// 	"favorite_count": favorite_count,
// 	"retweeted": false
// }





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