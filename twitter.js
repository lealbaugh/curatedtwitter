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
	source.stream('user', {}, function(stream){
		console.log("Making my stream.");
		stream.on('data', function (data){
			if(data.event == "favorite") {
				console.log(data.source.name," favorited ", data.target.name,"\'s tweet: ", data.target_object.text, " (", data.target_object.id_str, ")")
				thistweet = {
					"tweet_id": data.target_object.id_str,
					"favorited_by": data.source.name,
					"author": data.target.name,
					"text": data.target_object.text,
					"retweeted": false
				}
				putInCollection(thistweet, "tweets");
			}
			console.log("-------------------------------------------------------------------------------------------------------");
			// if (data.id_str){
			// 	id = data.id_str
			// 	putInCollection(data, "tweets");
			// 	re.retweetStatus(id, function(data){
			// 		console.log("retweeted!");
			// 	});
			// }	
		});
		// stream.on('event', function (e){
		// 	console.log(e);
		// })
	});
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