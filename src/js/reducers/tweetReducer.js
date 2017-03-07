
const initialState = {
  numTweets: 0,
  numCountryTweets: 0,
  tweetImage: "src/images/clouds.png",
  tweetName: "",
  tweetText: ""
}


/**
 * Used to increase the total number of tweets.
 */
const incrementTweets = (state, action) => {
  return {
    ...state,
    numTweets: state.numTweets + 1
  }
}


/**
 * Used to increase the number of tweets for a given country.
 */
const incrementCountryTweets = (state, action) => {
  return {
    ...state,
    numCountryTweets: state.numCountryTweets + 1
  }
}


/**
 * Used to reset the number of tweets for a given country.
 */
const resetCountryTweets = (state, action) => {
  return {
    ...state,
    numCountryTweets: 0
  }
}


/**
 * Sets the various data corresponding to a tweet (author, 
 * avatar image, tweet text, etc.).
 */
const setPointTweetData = (state, action) => {
  return {
    ...state,
    tweetImage: action.data.image,
    tweetName: action.data.name,
    tweetText: action.data.text
  }
}


const tweetReducer = (state = initialState, action) => {

  switch(action.type) {
    case "INCREMENT_TWEETS":         return incrementTweets(state, action);
    case "INCREMENT_COUNTRY_TWEETS": return incrementCountryTweets(state, action);
    case "RESET_COUNTRY_TWEETS":     return resetCountryTweets(state, action);
    case "SET_POINT_TWEET_DATA":     return setPointTweetData(state, action);
    default:                         return state;
  }

}


export default tweetReducer;
