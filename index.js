// Our Twitter library
const Twit = require("twit");

// We need to include our configuration file...
require("dotenv").config();

// declare the followers variable
let followers = [];

// create new twit with our access tokens
const twit = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL: true,     // optional - requires SSL certificates to be valid.
});

// This search query matches 100 recent tweets with the hashtag #foundryvtt
const hashtagSearch = { q: "#foundryvtt", count: 100, result_type: "recent" };

// This function finds the latest 100 tweets with the foundryvtt hashtag, and retweets all of them that haven't been retweeted yet, but only if they follow @foundry_bot.
const retweetAllFollowers = () => {
    twit.get("search/tweets", hashtagSearch, (error, data) => {
        // If our search request to the server had an error...
        if (error) {
            // We want to print it out here.
            console.log(error.message);
        }
        // Otherwise, if we got some data back...
        else {
        // Loop through all of the tweets we got back...
            for (let i = 0; i < data.statuses.length; i++) {
                // If I haven't retweeted the tweet yet and the user who tweeted it is a follower of @foundry_bot...
                if (!data.statuses[i].retweeted_status && followers.includes(data.statuses[i].user.id)) {
                    // Retweet it!
                    twit.post("statuses/retweet/" + data.statuses[i].id_str, {}, (error, response) => {
                        if (response) {
                            console.log("Success! Your bot has retweeted " + data.statuses[i].text + " by " + data.statuses[i].user.screen_name);
                        }
                        // If there was an error with our Twitter call...
                        if (error) {
                            // Print it out.
                            console.log(error.message);
                        }
                    });
                }
            }
        }
    });
};

// This function gets all of @foundry_bot's followers...
const getFollowers = () => {
    twit.get("followers/ids", { screen_name: "foundry_bot" }, (error, data) => {

        // If our search request to the server had an error...
        if (error) {
            // We want to print it out here.
            console.log(error.message);
        }
        // Otherwise, add each follower user id to the followers array...
        else {
            followers = [];
            for (let i = 0; i < data.ids.length; i++) {
                followers.push(data.ids[i]);
                // Print out each follower's user id to the console...
                console.log(data.ids[i]);
            }
            // Print out a success message to the console...
            console.log("Success! You have " + followers.length + " followers.");
        }
    });
};
// Try to get @foundry_bot's followers...
getFollowers();
// Try to retweet something as soon as we run the program...
retweetAllFollowers();
// ...and then every hour/half thereafter. Time here is in milliseconds, so
// 1000 ms = 1 second, 1 sec * 60 = 1 min, 1 min * 60 = 1 hour --> 1000 * 60 * 60
//setInterval(retweetLatest, 1000 * 60 * 30);
//setInterval(retweetAll, 1000 * 60 * 60);
setInterval(retweetAllFollowers, 1000 * 60 * 30);
setInterval(getFollowers, 1000 * 60 * 29);
