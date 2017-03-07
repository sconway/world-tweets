import React, { Component } from 'react';

export default class TweetBox extends Component {

  /**
   * Uses the mouse coordinates to determine if the hovered point is
   * in the top-left, top-right, bottom-left, or bottom-right quadrant.
   * Returns classnames to determine the translate values.
   */
  getClassName(coordinates) {
    let x         = coordinates.x,
        y         = coordinates.y,
        winHeight = window.innerHeight,
        winWidth  = window.innerWidth,
        boxSize   = 320;

    // Don't add any classes until a point is hovered on.
    if (!this.props.isPointHovered) return "";

    // left half 
    if (x < winWidth/2) { 
      // top half
      if (y < winHeight/2) { 
        return " top-left";
      } else { 
        return " bottom-left";
      }
    } else {
      // top half
      if (y < winHeight/2) { 
        return " top-right";
      } else {
        return " bottom-right";
      }
    }
  }

  render() {
     let posn = this.props.mouseCoordinates,
         name = this.getClassName(posn);

    return (
      <aside id="tweetBox" 
        className={
          "tweet-box" + name +
          (this.props.isPointHovered ? " visible" : "")
        }
        style={{
          left: posn.x + 'px',
          top:  posn.y + 'px'
        }} >
        <span className="tweet-box--line top"></span>
        <span className="tweet-box--line side"></span>
        <img id="tweetAvatar" 
          className="tweet-box--avatar" 
          src={this.props.image} 
          alt="twitter avatar image" />
        <h2 id="tweetName" className="tweet-box--user-name">
          {this.props.name}
        </h2>
        <p id="tweetText" className="tweet-box--tweet-text">
         {this.props.text}
        </p>
      </aside> 
    );
  }

}
