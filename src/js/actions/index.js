/*
 * Action Types
 */
const INCREMENT_TWEETS         = 'INCREMENT_TWEETS';
const INCREMENT_COUNTRY_TWEETS = 'INCREMENT_COUNTRY_TWEETS';
const RESET_COUNTRY_TWEETS     = 'RESET_COUNTRY_TWEETS';
const SET_SCENE_LOADED         = 'SET_SCENE_LOADED';
const SET_COUNTRY_NAME         = 'SET_COUNTRY_NAME';
const SET_COUNTRY_DATA         = 'SET_COUNTRY_DATA';
const SET_COUNTRY_CLICKED      = 'SET_COUNTRY_CLICKED';
const SET_POINT_HOVERED        = 'SET_POINT_HOVERED';
const SET_POINT_TWEET_DATA     = 'SET_POINT_TWEET_DATA';


/**
 * Used to increase the total number of tweets.
 */
export const incrementTweets = () => {
	return {
		type: INCREMENT_TWEETS
	}
}

/**
 * Used to increase the number of tweets for a given country.
 */
export const incrementCountryTweets = () => {
	return {
		type: INCREMENT_COUNTRY_TWEETS
	}
}

/**
 * Used to reset the number of tweets for a country.
 */
export const resetCountryTweets = () => {
	return {
		type: RESET_COUNTRY_TWEETS
	}
}

/**
 * Used to set the loaded state to true
 */
export const setSceneLoaded = (name) => {
	return {
		type: SET_SCENE_LOADED,
		name
	}
}

/**
 * Used to set the name of the current country.
 */
export const setCountryName = (name) => {
	return {
		type: SET_COUNTRY_NAME,
		name
	}
}

/**
 * Used to set the various information for each country(population,
 * capital, size, etc.).
 */
export const setCountryData = (data) => {
	return {
		type: SET_COUNTRY_DATA,
		data
	}
}

/**
 * Sets the value representing whether or not a country was clicked.
 */
export const setCountryClicked = (value) => {
	return {
		type: SET_COUNTRY_CLICKED,
		value
	}
}

/**
 * Sets the value representing whether or not a point was hovered on.
 */
export const setPointHovered = (value) => {
	return {
		type: SET_POINT_HOVERED,
		value
	}
}

/**
 * Sets the various data corresponding to a tweet (author, 
 * avatar image, tweet text, etc.).
 */
export const setPointTweetData = (data) => {
	return {
		type: SET_POINT_TWEET_DATA,
		data
	}
}

