import React, {Component} from 'react';

export default class CountryDetails extends Component {
// <img className="country__details country_details--flag" 
        //      src      ={"src/svg/" + this.props.countryFlag + ".svg"} 
        //      alt      ="Country Flag" />
  render() {
    return (
      <div className="country__details">
        
      	<div className="country__detail country__detail--capital">
      	  <label>Capital:</label> 
          {this.props.countryCapital}
      	</div>
      	<div className="country__detail country__detail--population">
      	  <label>Population:</label> 
          {this.props.countryPopulation}
      	</div>
      	<div className="country__detail country__detail--size">
      	  <label>Size (Kilometers):</label> 
          {parseInt(this.props.countrySize, 10)}
      	</div>
        <div className="country__detail country__detail--languages">
          <label>Languages Used:</label> 
          {this.props.countryLanguages}
        </div>
      </div>
    );
  }

}
