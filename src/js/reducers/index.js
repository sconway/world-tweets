import { combineReducers } from 'redux';
import globeReducer          from './globeReducer';
import tweetReducer          from './tweetReducer';

const rootReducer = combineReducers({
  globe: globeReducer,
  tweet: tweetReducer
});

export default rootReducer;
