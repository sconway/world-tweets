import React, {Component}    from 'react';
import CountryName           from './CountryName';
import CountryDetails        from './CountryDetails';

export default class CountryInformation extends Component {
  render() {
    return (
      <section className="country__information">
        <CountryName countryName={this.props.countryName} />
        <CountryDetails 
          countryFlag      ={this.props.countryFlag}
        	countryCapital   ={this.props.countryCapital}
        	countryPopulation={this.props.countryPopulation}
        	countrySize      ={this.props.countrySize}
        	countryLanguages ={this.props.countryLanguages}
          numCountryTweets ={this.props.numCountryTweets} />
      </section>
    );
  }
}