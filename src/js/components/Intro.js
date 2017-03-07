import React, { Component } from 'react';

export default class Intro extends Component {

  render() {
    return (
      <section id="intro" className={"intro" + (this.props.isLoaded ? " hidden" : "") }>
        <article className="intro__details">
          <h1>Tweets From Around the World</h1>
          <p>This visualization shows tweets from around the globe, in real-time, as they are sent over from the server via a web socket.</p>
          <p>You can interact with the various countries and tweets, and click on a country to see more details.</p>
          <p>The tweets are represented by colored indicators that vary based on the sentiment of the tweet.</p>
          <ul className="intro__color-list">
            <li className="intro__color-list__color color-1">Very positive tweet</li>
            <li className="intro__color-list__color color-2">Positive tweet</li>
            <li className="intro__color-list__color color-3">Neutral tweet</li>
            <li className="intro__color-list__color color-4">Negative tweet</li>
            <li className="intro__color-list__color color-5">Very negative tweet</li>
          </ul>
          <div onClick={() => {this.props.handleClick()}} className="btn">Got it</div>
        </article>
      </section>
    );
  }

}