import { Card, CardContent, FormControl, MenuItem, Select } from '@material-ui/core';
import React, {useEffect, useState} from 'react';
import InfoBox from './InfoBox';
import Table from './Table';
import './App.css';
import {sortData, prettyPrintStat} from './util';
import LineGraph from './LineGraph';
import Map from './Map';
import "leaflet/dist/leaflet.css";
import numeral from "numeral";

function App() {

const [countries, setCountries] = useState([]);
const [country, setCountry] = useState(['worldwide']);
const [countryInfo, setCountryInfo] =useState({});
const [tableData, setTableData] = useState([]);
const [casesType, setCasesType] = useState("cases");
const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
const [mapZoom, setMapZoom] = useState(3);
const [mapCountries, setMapCountries] = useState([]);

useEffect(() => {
  fetch("https://disease.sh/v3/covid-19/all")
  .then((response)=>response.json())
  .then((data)=>{
    setCountryInfo(data);
  });
},[])

useEffect(()=>{
  //async -> send req,, wait for resp , then do someting
  const getCountriesData = async () => {
    await fetch("https://disease.sh/v3/covid-19/countries")
    .then((response) =>response.json())
    .then((data)=>{
      const countries = data.map((country)=>(
        {
          name:country.country,
          value:country.countryInfo.iso2  
        }
      ));
      
      const sortedData = sortData(data);
      setTableData(sortedData);
      setCountries(countries);
      setMapCountries(data);
    });
  };

  getCountriesData();
},[]);

const onCountryChange = async (event) =>{
  const countryCode = event.target.value;
  setCountry(countryCode);

  const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`
  
  await fetch(url)
  .then(response => response.json())
  .then(data => {
    setCountry(countryCode);
    setCountryInfo(data);
    setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
    setMapZoom(4);
  });

  //https://disease.sh/v3/covid-19/all
  //https://disease.sh/v3/covid-19/countries/{COUNTRY_CODE}
};


  return (
    <div className="app">
      <div className="app__left">
      <div className="app__header">
      <h1>COVID-19 TRACKER</h1>
      <FormControl className="app__dropdown">
        <Select variant="outlined" onChange={onCountryChange} value={country}>
          <MenuItem value="worldwide">WorldWide</MenuItem>
          {countries.map((country) =>( 
            <MenuItem value={country.value}>{country.name}</MenuItem>
          ))}
        </Select>
      </FormControl>
      </div>
      {/* Header */ }    
      {/* Title  + select input dropdown fiels*/}
      
      <div className="app__stats">
        <InfoBox 
        active = {casesType === "cases"}
        onClick={(e)=>setCasesType("cases")}
        title="Coronavirus Cases" 
        isRed
        cases={prettyPrintStat(countryInfo.todayCases)} 
        total={numeral(countryInfo.cases).format("0.0a")}
        />        
        
        <InfoBox
        active = {casesType === "recovered"}
        onClick={(e)=>setCasesType("recovered")}
        title="Recovered" 
        cases={prettyPrintStat(countryInfo.todayRecovered)} 
        total={numeral(countryInfo.recovered).format("0.0a")}
        />

        <InfoBox
        active = {casesType === "deaths"}
        onClick={(e)=>setCasesType("deaths")}
        title="Deaths" 
        isRed
        cases={prettyPrintStat(countryInfo.todayDeaths)} 
        total={numeral(countryInfo.deaths).format("0.0a")}
        />        
      </div>
      {/* infobox1 */}
      {/* infobox2 */}
      {/* infobox3 */}

     <Map
     casesType={casesType}
     countries={mapCountries}
     center={mapCenter}
     zoom={mapZoom}
     />
     
      {/* Map */}
      </div>
      
      <Card className="app__right">
      <CardContent>
       <h3>Live Cases by country</h3>
       <Table countries={tableData}/>
      {/* Table */}
          <h3 className="app__graphTitle">WorldWide new {casesType} cases</h3> 
        <LineGraph className="app__graph" casesType={casesType}/>
      {/* Graph */}
      </CardContent>
    </Card>
    </div>
  );
}

export default App;
