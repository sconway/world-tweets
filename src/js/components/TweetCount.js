import React, {Component} from 'react';

export default class TweetCount extends Component {
  
  render() {
    return (
      <div className="tweet-count">
        {this.props.numTweets} Tweets
      </div>
    );
  }

}