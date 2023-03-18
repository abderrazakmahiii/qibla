import React, { useState, useEffect } from "react";
import axios from "axios";

function Prayers() {
    //First, we create new states to get the geo-coordinations of the use
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDate = new Date().getDate();
  const date = new Date();
  const options = { day: "numeric", month: "long", year: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);

  //Second, we need to initialize the variables that will store the prayers times 
  const [prayers, setPrayers] = useState([ {prayerName:'Fajr', prayerTime:''}, {prayerName:'Sunrise', prayerTime:''}, {prayerName:'Dhuhr', prayerTime:''}, 
  {prayerName:'Asr', prayerTime:''}, {prayerName:'Maghrib', prayerTime:''}, {prayerName:'Isha', prayerTime:''}])

  //Third, we set the Hidjri date and the current city states
  const [hidjriDate, setHidjriDate] = useState("");
  const [currentCity, setCurrentCity] = useState();

  //Fourth, we need to ask the user for his location 
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      console.log("Geolocation is not supported by this browser.");
    }

  function showPosition(position) {
    setLatitude(position.coords.latitude);
    setLongitude(position.coords.longitude);
  }

  //Fifth, using the axios function, we will fetch the data from the api using the variables that we initialized in the first step
  useEffect(() => {
    if (latitude && longitude) {

      const url = `https://api.aladhan.com/v1/calendar/${currentYear}/${currentMonth}?latitude=${latitude}&longitude=${longitude}&method=3`;

      axios.get(url).then((response) => {
        const updatedPrayers = [...prayers];
        updatedPrayers[0].prayerTime = response.data.data[currentDate].timings.Fajr.replace(' (WET)', '');
        updatedPrayers[1].prayerTime = response.data.data[currentDate].timings.Sunrise.replace(' (WET)', '');
        updatedPrayers[2].prayerTime = response.data.data[currentDate].timings.Dhuhr.replace(' (WET)', '');
        updatedPrayers[3].prayerTime = response.data.data[currentDate].timings.Asr.replace(' (WET)', '');
        updatedPrayers[4].prayerTime = response.data.data[currentDate].timings.Maghrib.replace(' (WET)', '');
        updatedPrayers[5].prayerTime = response.data.data[currentDate].timings.Isha.replace(' (WET)', '');
        setPrayers(updatedPrayers);
        nextPrayer(prayers)
        setHidjriDate(
          response.data.data[currentDate].date.hijri.day +
            " " +
            response.data.data[currentDate].date.hijri.month.en +
            " " +
            response.data.data[currentDate].date.hijri.year
        );
      });

      //Sixth, now, we are going to use the user's geocoordinates and another api to get the name of his current city
      const url2 = `https://api.opencagedata.com/geocode/v1/json?key=093d474da6624e9a84d74236f69f6c2a&q=${latitude}%2C${longitude}&pretty=1`;
      axios.get(url2).then((response) => {
        setCurrentCity(response.data.results[0].components.city);
      });
    }
  }, [latitude, longitude]);
  const currentTime = new Date();
const formattedTime = currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});

//function to see what is the next prayer
function nextPrayer(prayers) {
    const now = new Date();
    const prayerTimes = prayers.map(prayer => {
      const timeParts = prayer.prayerTime.split(':');
      const prayerTime = new Date();
      prayerTime.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);
      return { name: prayer.prayerName, time: prayerTime };
    });
    prayerTimes.sort((a, b) => a.time - b.time);
    const nextPrayerTime = prayerTimes.find(prayer => prayer.time > now);
    if (nextPrayerTime) {
      return nextPrayerTime.name;
    } else {
      return prayers[0].prayerName
    }
  }
  
  
  return (
    <div className="Container">
      <div id='top'>
      <h2>Prayers Times in {currentCity}</h2>
      <div id="dates">
        <p id="gregorian">{formattedDate}</p>
        <b id="hidjri">{hidjriDate}</b>
      </div>
      </div>
      <div id='main'>
        {prayers.map((prayer, index)=>(
            <div className="prayer" key={index} id={nextPrayer(prayers)===prayer.prayerName? 'nextPrayer': null}>
                <div id={nextPrayer(prayers)===prayer.prayerName? 'nextPrayer': null}>
                {document.getElementById("nextPrayer").style.backgroundImage = "url(" + nextPrayer(prayers) + ".png)"}
                <h3>{prayer.prayerName}</h3>
                <p>{prayer.prayerTime}</p>
                {nextPrayer(prayers)===prayer.prayerName? <h5>UPCOMING PRAYER</h5>: null}
            </div>
            </div>
        ))}
      </div>
      <div id='bottom'>
          <h5>Muslim World League</h5>
        </div>
    </div>
  );
}

export default Prayers;

