
const initialState = {
  countryName: "",
  countryFlag: "us",
  countryCapital: "",
  countryPopulation: "",
  countrySize: "",
  countryLanguages: "",
  isLoaded: false,
  isPointHovered: false,
  isCountryClicked: false
}


/**
 * Used to set the loaded state to true.
 */
const setSceneLoaded = (state, action) => {
  return {
    ...state,
    isLoaded: true
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


const globeReducer = (state = initialState, action) => {

  switch(action.type) {
    case "SET_SCENE_LOADED":         return setSceneLoaded(state, action);
    case "SET_COUNTRY_NAME":         return setCountryName(state, action);
    case "SET_COUNTRY_DATA":         return setCountryData(state, action);
    case "SET_COUNTRY_CLICKED":      return setCountryClicked(state, action);
    case "SET_POINT_HOVERED":        return setPointHovered(state, action);
    default:                         return state;
  }

}


export default globeReducer;
