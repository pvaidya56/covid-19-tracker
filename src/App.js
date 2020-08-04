import React, { useState, useEffect } from 'react';
import {
  MenuItem, 
  FormControl,
  Select,
  Card,
  CardContent
} from '@material-ui/core';
import InfoBox from './InfoBox';
import { sortData, printStat } from './util'
import Map from './Map';
import Table from './Table';
import LineGraph from './LineGraph';
import 'leaflet/dist/leaflet.css';
import './App.css';

function App() {

  const [countries, setContries] = useState([])
  const [country, setCountry] = useState('worldwide');
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([])


  useEffect(() => {
    fetch('https://disease.sh/v3/covid-19/all')
    .then(res => res.json())
    .then(data => {
      setCountryInfo(data)
    })
    
  }, [])

  useEffect(() => {
    //async --> send a req, wait for it and do something with the info

    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((res) => res.json())
      .then((data) => {
        const countries = data.map((country) => (
          {
            name: country.country,
            value: country.countryInfo.iso2
          }));

          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setContries(countries);
      })
    }
    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode)

    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : 
    `https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url)
    .then((res) => res.json())
    .then((data) => {
      setCountry(countryCode);
      //all of the data from the country res
      setCountryInfo(data);
      setMapCenter( [data.countryInfo.lat, data.countryInfo.long] )
      setMapZoom(4)
    }) 
  };

  return (
    <div className="app">
      <div className="app_left">
        <div className="app_header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app_dropdown">
          <Select
            variant="outlined"
            onChange={onCountryChange}
            value={country}
          >
            <MenuItem value="worldwide">Worldwide</MenuItem>
            {countries.map((country) => (
              <MenuItem value={country.value}>{country.name}</MenuItem>
              ))} 
          </Select>
        </FormControl>
        </div>
        <div className="app_stats">
          <InfoBox
            isRed
            active={casesType === "cases"}
            onClick={(e) => {
              setCasesType('cases')
            console.log("set cases type")}}
            title="Coronavirus Cases" cases={printStat(countryInfo.todayCases)} total={printStat(countryInfo.cases)} />
          <InfoBox 
            active={casesType === "recovered"}
            onClick={(e) => setCasesType('recovered')}
            title="Recovered" cases={printStat(countryInfo.todayRecovered)} total={printStat(countryInfo.recovered)}/>
          <InfoBox 
            isRed
            active={casesType === "deaths"}
            onClick={(e) => setCasesType('deaths')}
            title="Death" cases={printStat(countryInfo.todayDeaths)} total={printStat(countryInfo.deaths)}/>
        </div>
        <Map
          casesType={casesType}
          countries={mapCountries} center={mapCenter} zoom={mapZoom} /> 
      </div>
      <div className="app_right">
        <Card>
          <CardContent>
            <h3>Live cases by country</h3>
            <Table countries={tableData}/>
            <h3 className="app_graphTitle">Worldwide New {casesType} </h3>
            <LineGraph className="app_graph" casesType={casesType} className="app__graph" casesType={casesType}/>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

export default App;
