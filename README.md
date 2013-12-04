curatedtwitter
==============
Retweets the best (that is, the most favorited and retweeted) tweets from a source user account.  Uses [ntwitter](https://github.com/AvianFlu/ntwitter) to interface with the Twitter API and [mongodb](https://npmjs.org/package/mongodb) to interface with a MongoHQ database.

You'll need to add an `apikeys.js` file like this, with authentication information for the source twitter account, the retweeter account, and the database:
```javascript
	module.exports =  {
		retweeter_consumer_key: 'whatever',
		retweeter_consumer_secret: 'whatever',
		retweeter_access_token_key: 'whatever-whatever',
		retweeter_access_token_secret: 'whatever',

		source_consumer_key: 'whatever', 
		source_consumer_secret: 'whatever',
		source_access_token_key: 'whatever-whatever',
		source_access_token_secret: 'whatever',

		mongoURL: "mongodb://username:passphrase@paulo.mongohq.com:port/database",
	}
```

To change the retweeting metric, just change the tweetQualifiesForRetweet function. It's currently:
```javascript
function tweetQualifiesForRetweet(tweet) {
	return tweet.retweet_count*2 + tweet.favorite_count >= 2;
}
```

Also included are files for using [supervisord](http://supervisord.org/), per the tutorial at http://edvanbeinum.com/how-to-install-and-configure-supervisord/