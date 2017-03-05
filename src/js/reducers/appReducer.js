
const initialState = {
  countryName: "",
  countryFlag: "us",
  countryCapital: "",
  countryPopulation: "",
  countrySize: "",
  countryLanguages: "",
  numTweets: 0,
  numCountryTweets: 0,
  isPointHovered: false,
  isCountryClicked: false,
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
 * Used to set the name of the current country.
 */
const setCountryName = (state, action) => {
  return {
    ...state,
    countryName: action.name
  }
}


/**
 * Used to set the various information for each country(population,
 * capital, size, etc.).
 */
const setCountryData = (state, action) => {
  return {
    ...state,
    countryFlag: action.data.flag,
    countryCapital: action.data.capital,
    countryPopulation: action.data.population,
    countrySize: action.data.size,
    countryLanguages: action.data.languages
  }
}


/**
 * Sets the value representing whether or not a country was clicked.
 */
const setCountryClicked = (state, action) => {
  return {
    ...state,
    isCountryClicked: action.value
  }
}


/**
 * Sets the value representing whether or not a point was hovered on.
 */
const setPointHovered = (state, action) => {
  return {
    ...state,
    isPointHovered: action.value
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


const appReducer = (state = initialState, action) => {

  switch(action.type) {
    case "INCREMENT_TWEETS":         return incrementTweets(state, action);
    case "INCREMENT_COUNTRY_TWEETS": return incrementCountryTweets(state, action);
    case "RESET_COUNTRY_TWEETS":     return resetCountryTweets(state, action);
    case "SET_COUNTRY_NAME":         return setCountryName(state, action);
    case "SET_COUNTRY_DATA":         return setCountryData(state, action);
    case "SET_COUNTRY_CLICKED":      return setCountryClicked(state, action);
    case "SET_POINT_HOVERED":        return setPointHovered(state, action);
    case "SET_POINT_TWEET_DATA":     return setPointTweetData(state, action);
    default:                         return state;
  }

}


export default appReducer;
