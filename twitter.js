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



function checkIntoDatabase(thistweet, collectionname) {
	// The findAndModify command atomically modifies and returns a single document. By default, the returned document does not include the modifications made on the update. To return the document with the modifications made on the update, use the "new" option.
	db.collection(collectionname).findAndModify({"tweet_id": thistweet.tweet_id}, [], {
		$set: {
			"tweet_id": thistweet.tweet_id,
			"author": thistweet.author,
			"author_id": thistweet.author_id,
			"text": thistweet.text,
			"retweet_count": thistweet.retweet_count,
			"favorite_count": thistweet.favorite_count,
			"retweeted_by_bot": "false",
			}
		}, {upsert: "true"}, function(err, object, thistweet, collectionname) {
			if (err) {
				console.warn(err.message);
			}
			else {
				if (object.value == null || object.retweeted_by_bot == "false") {
					if (tweetQualifiesForRetweet(thistweet)) {
						retweet(thistweet.tweet_id, collectionname);
					}
				}
		}
	});
}

function tweetQualifiesForRetweet(tweet) {
	return true;
	// return thistweet.retweet_count*2 + thistweet.favorite_count > 2;
}

function retweet(tweet_id, collectionname) {
	retweeter.retweetStatus(tweet_id, function(data){
		console.log("retweeted!");
		});
	db.collection(collectionname).findAndModify({"tweet_id": tweet_id}, [], {$set: { "retweeted_by_bot": "true" } }, {}, function(err, object) {
		if (err) console.warn(err.message);
		else console.log("logged retweet!");
	});

}


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
				checkIntoDatabase(thistweet, "tweets");
			}
			if(data.retweeted_status) {
				console.log("Retweeted by "+data.user.name+": "+data.retweeted_status.text);
				thistweet = condenseTweet(data.retweeted_status);
				checkIntoDatabase(thistweet, "tweets");
			}

			console.log("-------------------------------------------------------------------------------------------------------");
		});
	});
}



function condenseTweet(tweet) {
	return {
		"tweet_id": tweet.id_str,
		"author": tweet.user.id_str,
		"author_id": tweet.user.name,
		"text": tweet.text,
		"retweet_count": tweet.retweet_count,
		"favorite_count": tweet.favorite_count,
		"retweeted_by_bot": "false",
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