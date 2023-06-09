import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from 'moment';
import logo from '../logo.png';
import {ImLocation2} from 'react-icons/im';

function Prayers() {

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [prayers, setPrayers] = useState([
    {name:'Fajr', time:''},
    {name:'Sunrise', time:''},
    {name:'Dhuhr', time:''},
    {name:'Asr', time:''},
    {name:'Maghrib', time:''},
    {name:'Isha', time:''}
  ])
  const [nextPrayer, setNextPrayer] = useState({name:'Fajr', time:''});

  const [hidjriDate, setHidjriDate] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [currentCountry, setCurrentCountry] = useState("");
  const [timeRemaining, setTimeRemaining] = useState('');

  const date = new Date();
  const options = { day: "numeric", month: "long", year: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDate = new Date().getDate() -1;
  
  function getLocationData() {
    navigator.geolocation ? navigator.geolocation.getCurrentPosition(showPosition): console.log("Geolocation is not supported by this browser.");
  }
  
  function showPosition(position) {
    setLatitude(position.coords.latitude);
    setLongitude(position.coords.longitude);
  }

  useEffect(() => {
    getLocationData();
  }, []);
  

  function getPrayersData() {
    if (latitude && longitude) {
      const url = `https://api.aladhan.com/v1/calendar/${currentYear}/${currentMonth}?latitude=${latitude}&longitude=${longitude}&method=3`;
      axios.get(url).then((response) => {
        const updatedPrayers = [...prayers];
        updatedPrayers[0].time = response.data.data[currentDate].timings.Fajr.slice(0,5);
        updatedPrayers[1].time = response.data.data[currentDate].timings.Sunrise.slice(0,5);
        updatedPrayers[2].time = response.data.data[currentDate].timings.Dhuhr.slice(0,5);
        updatedPrayers[3].time = response.data.data[currentDate].timings.Asr.slice(0,5);
        updatedPrayers[4].time = response.data.data[currentDate].timings.Maghrib.slice(0,5);
        updatedPrayers[5].time = response.data.data[currentDate].timings.Isha.slice(0,5);
        setPrayers(updatedPrayers);
        setNextPrayer(updatedPrayers[0]);
        setHidjriDate(
          response.data.data[currentDate].date.hijri.day +
          " " +
          response.data.data[currentDate].date.hijri.month.en +
          " " +
          response.data.data[currentDate].date.hijri.year
        );
      });
  
      const url2 = `https://api.opencagedata.com/geocode/v1/json?key=093d474da6624e9a84d74236f69f6c2a&q=${latitude}%2C${longitude}&pretty=1`;
      axios.get(url2).then((response) => {
        setCurrentCity(response.data.results[0].components.city);
        setCurrentCountry(response.data.results[0].components.country);
      });
    }
  }
  

 useEffect(() => {
  getPrayersData()
  }, [longitude, latitude] );

  function getNextPrayer(prayers) {
    const updatedPrayers = prayers;
    const now = new Date();
  
    const prayerTimes = updatedPrayers.map(prayer => {
      const timeParts = prayer.time.split(':');
      const time = new Date();
      time.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);
      return { name: prayer.name, time: time };
    });
  
    prayerTimes.sort((a, b) => a.time.getTime() - b.time.getTime());
    const nextPrayerTime = prayerTimes.find(prayer => prayer.time > now);
  
    if (nextPrayerTime) {
      const updatedNextPrayer = {name: nextPrayerTime.name, time: nextPrayerTime.time.toLocaleTimeString()};
      setNextPrayer(updatedNextPrayer);
    } else {
      const updatedNextPrayer = {name: prayers[0].name, time: prayers[0].time};
      setNextPrayer(updatedNextPrayer);
    }
  }
  
  
  useEffect(() => {
    getNextPrayer(prayers)
  }, [prayers]);

  function NextPrayerCountdown(nextPrayer) {
    const today = moment().format('YYYY-MM-DD');
    const targetTime = moment(`${today} ${nextPrayer.time}`);
    const intervalId = setInterval(() => {
      const currentTime = moment();
      const diff = Math.max(0, targetTime.diff(currentTime));
      const duration = moment.duration(diff);
      if (duration.asMilliseconds() <= 0) {
        clearInterval(intervalId);
        return;
      }
      const hours = Math.floor(duration.asHours()).toString().padStart(2, '0');
      const minutes = duration.minutes().toString().padStart(2, '0');
      const seconds = duration.seconds().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}:${seconds}`;
      setTimeRemaining(timeString);
    }, 1000);
  
    return () => clearInterval(intervalId);
  }

  useEffect(() => {
    NextPrayerCountdown(nextPrayer)
  }, [nextPrayer]);
  
  if(latitude, longitude) {
    return (
      <>
      <div id='home'>
        <div className="up">
          <img src={logo} />
          <h4><ImLocation2 />{currentCity}, {currentCountry}</h4>
        </div>
      </div>
      <div className="Container">
        <div id='top'>
        <h2>Prayers Times in <span>{currentCity}</span></h2>
        <div id="dates">
          <p id="gregorian">{formattedDate}</p>
          <b id="hidjri">{hidjriDate}</b>
        </div>
        </div>
        <div id='main'>
        {prayers.map((prayer, index)=>(
  <div className="prayer" key={index} id={nextPrayer.name===prayer.name? 'nextPrayer': null} style={{ backgroundImage:nextPrayer.name===prayer.name && `url("./img/${prayer.name}.png")`}}>
    <div className="left" style={{ width: (nextPrayer.name !== prayer.name && window.innerWidth <= 900) ? '100%' : 'auto', display: (nextPrayer.name !== prayer.name && window.innerWidth <= 900) ? 'flex' : 'block', justifyContent: (nextPrayer.name !== prayer.name && window.innerWidth <= 900) ? 'space-between' : 'inherit', alignItems: (nextPrayer.name !== prayer.name && window.innerWidth <= 900) ? 'center' : 'inherit', textAlign: (nextPrayer.name !== prayer.name && window.innerWidth <= 900) ? 'center' : 'inherit' }}>
      <h3>{prayer.name}</h3>
      <p style={{ fontSize: (nextPrayer.name !== prayer.name) ? '18px' : 'inherit', fontWeight: (nextPrayer.name !== prayer.name) ? '600' : 'inherit' }}>{prayer.time}</p>
    </div>
    <div className="right" style={{ textAlign: (window.innerWidth <= 900)? 'right' : 'center'}}>
      {nextPrayer.name===prayer.name? <h5>UPCOMING PRAYER</h5>: null}
      {nextPrayer.name===prayer.name?  <h3>{timeRemaining}</h3>: null}
    </div>
  </div>
))}


        </div>
        <div id='bottom'>
            <h5>Muslim World League</h5>
          </div>
      </div>
      website developed by <a href='https://abderrazakmahiii.github.io/myportfolio'>Abderrazak Mahi</a></>
    );
}
else {
  return(
    <div id="location-prompt">
      <img className='noloclogo' src={logo} />
        <p>Please activate and allow location so we can get you the prayers times according to your location.</p>
    </div>
  )
}
}

export default Prayers;