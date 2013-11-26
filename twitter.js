var keys = require("./apikeys.js") || null;

var mongo = require('mongodb');
var mongoUri = keys.mongoURL || process.env.MONGOHQ_URL;

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
				console.log("Inserted: ", thisobject);
				db.close();
			});
		});
	});
};

var screen_name = "gnurr";
var twitter = require('ntwitter');
var twit = new twitter({
	consumer_key: keys.consumer_key || process.env.TWITTER_CONSUMER_KEY,
	consumer_secret: keys.consumer_secret || process.env.TWITTER_CONSUMER_SECRET,
	access_token_key: keys.access_token_key || process.env.TWITTER_ACCESS_TOKEN_KEY,
	access_token_secret: keys.access_token_secret || process.env.TWITTER_ACCESS_TOKEN_SECRET
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
	});
}


function initiateStream(screen_name) {
	twit.get("/users/show.json", {"screen_name":screen_name}, function(fake, data) {
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