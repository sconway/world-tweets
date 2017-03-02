import React, { Component } from 'react';

export default class BackButton extends Component {

  render() {
    return (
      <div 
        className={"back-btn" + (this.props.isCountryClicked ? " visible" : "")} 
        onClick  ={() => this.props.onButtonClick()}></div>
    );
  }

}