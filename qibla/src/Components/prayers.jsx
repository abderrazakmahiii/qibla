import React, { useState } from "react";
import axios from "axios";

function Prayers() {
    //First we create new states to get the geo-coordinations of the use
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  //Second we need to initialize the variables that will store the prayers times 
  const [fajr, setFajr] = useState();
  const [dhuhr, setDhuhr] = useState();
  const [asr, setAsr] = useState();
  const [maghrib, setMaghrib] = useState();
  const [isha, setIsha] = useState();

  //Third we need the current year, month, day and the hidjri date
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentDate = new Date().getDate();
  const date = new Date();
  const options = { day: "numeric", month: "long", year: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);
  const [hidjriDate, setHidjriDate] = useState("");


  //Fourth we need to ask the user for his location 
  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  }

  //Fifth the getLocation() function will call showPosition to store the geo-coordinates
  function showPosition(position) {
    setLatitude(position.coords.latitude);
    setLongitude(position.coords.longitude);
  }

  //Sixth we need to execute the getLocation() function
  getLocation();

  //Seventh, using the axios function, we will fetch the data from the api using the variables that we initialized in the first step
  function todayPrayers() {
    const url = `https://api.aladhan.com/v1/calendar/${currentYear}/${currentMonth}?latitude=${latitude}&longitude=${longitude}&method=3`;

    axios.get(url).then((response) => {
      setFajr(response.data.data[currentDate].timings.Fajr);
      setDhuhr(response.data.data[currentDate].timings.Dhuhr);
      setAsr(response.data.data[currentDate].timings.Asr);
      setMaghrib(response.data.data[currentDate].timings.Maghrib);
      setIsha(response.data.data[currentDate].timings.Isha);
      setHidjriDate(
        response.data.data[currentDate].date.hijri.day +
          " " +
          response.data.data[currentDate].date.hijri.month.en +
          " " +
          response.data.data[currentDate].date.hijri.year
      );
    });
  }

  todayPrayers();

  return (
    <div className="Container">
      <div id='top'>
      <h2>Prayer Times in Porto</h2>
      <div id="dates">
        <p id="gregorian">{formattedDate}</p>
        <p id="hidjri">{hidjriDate}</p>
      </div>
      </div>
      <div id='main'>
        <div className="prayer">
          <h3>Fajr</h3>
          <h3>{fajr}</h3>
        </div>
        <div className="prayer">
          <h3>Dhuhr</h3>
          <h3>{dhuhr}</h3>
        </div>
        <div className="prayer">
          <h3>Asr</h3>
          <h3>{asr}</h3>
        </div>
        <div className="prayer">
          <h3>Maghrib</h3>
          <h3>{maghrib}</h3>
        </div>
        <div className="prayer">
          <h3>Isha</h3>
          <h3>{isha}</h3>
        </div>
      </div>
      <div id='bottom'>
          <h5>Muslim World League</h5>
        </div>
    </div>
  );
}

export default Prayers;
