import React, {Component} from 'react';

export default class CountryName extends Component {

  render() {
    return (
      <aside
        className={"country--name" + (this.props.countryName ? " visible" : "")}
        data-text={this.props.countryName ? this.props.countryName.toUpperCase() : ""} >
        {this.props.countryName}
      </aside>
    );
  }

}
