var unit = 'celsius'
var temp;
var fivedays;
var hourly = [];
var fivedayshtml = [];
var weather;
var weatherIcons = { "clear-day" : "wi-day-sunny" ,
                   "clear-night" : "wi-night-clear" ,
                   "rain" : "wi-rain",
                   "snow" : "wi-snow",
                   "sleet" : "wi-sleet" ,
                   "wind" : "wi-windy" ,
                   "fog" : "wi-fog",
                   "cloudy" : "wi-cloud",
                   "partly-cloudy-day" : "wi-cloud" ,
                   "partly-cloudy-night" : "wi-cloud"
}

var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var now = new Date();
var today = [];
var dayIndexes = []; // start index of hourly array for the next five days
var fiveDaysHourlyHTML = [];
var fiveDayHourly = []; // stores the 5 day forecasts Hourly forecasts
var currentDayHours;

var timeZoneDiff = 0;
  
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
    $("#data").html("latitude: " + position.coords.latitude + "<br>longitude: " + position.coords.longitude);
    getWeather("https://api.forecast.io/forecast/ded538b1a8782c194aee5d645961af0f/" + position.coords.latitude + "," + position.coords.longitude + "?callback=?&extend=hourly");
  });
}
    





function getWeather(url) {
  $.getJSON(url, function(data) {
    weather = data;
    temp = Math.round((data.currently.apparentTemperature - 32) / 1.8);
    document.querySelector('.top.first h3').textContent = weather.currently.summary
    document.querySelector(".top.first i").classList.add(weatherIcons[data.currently.icon]);
    document.querySelector(".top .temp").innerHTML = temp  + '<i class="icon wi wi-' + unit + '"></i>';
    document.querySelector(".rain").innerHTML = data.currently.precipProbability.toFixed(0)*100 + '% <i class="icon wi wi-rain"></i>';
    fivedays = make5day();
    displayFive();
    make24hour();

    $.getJSON("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + data.latitude+ "," + data.longitude + "&sensor=true", function(location) {
      console.log(location);
      var searchLoc = $('.loc-search').val();
      if (searchLoc ==  ""){
        $('.loc-search').val(location.results[4].formatted_address);
      }
  })
  })
}

var searchbox = document.querySelector(".loc-search");

// search new location 

var searchform = document.querySelector(".search");
searchform.addEventListener("submit", function(e){
  console.log("yes");
  e.preventDefault();
  getLocation(searchbox.value);
  
})

searchbox.addEventListener("focus", function(){
  this.value = "";
})


  
document.querySelector('.temp').addEventListener('click', changeUnit);



function changeUnit() {
  if (unit === 'celsius') {
    temp = Math.round((temp *1.8) + 32).toFixed(0); // convert c to f
    unit = 'fahrenheit';
  }
  else {
    temp = Math.round((temp - 32) / 1.8); // convert f to c
    unit = 'celsius';
  }
  document.querySelector(".top .temp").innerHTML = temp  + '<i class="icon wi wi-' + unit + '"></i>';
  changeUnit5day();
  changeUnit24Today();
}

  
function changeUnit5day() {
  fivedays.forEach(function(day){
    if (unit === 'fahrenheit') {
      day[1] =  Math.round((day[1]* 1.8) + 32) // convert c to f
    }
    else {
      day[1] = Math.round((day[1] - 32) / 1.8); // convert f to c
    }
    displayFive();
    })
}



function changeUnit24Today(){

  today.forEach(function(hour){
    if (unit === "fahrenheit"){
      hour[1] = Math.round((hour[1]* 1.8) + 32); // convert c to f
    }
    else {
      hour[1] = Math.round((hour[1] -32)/ 1.8);
    }
    
  })
  displayTodaysHourly(today);
}


// get location from search field, update weather using new url search field

function getLocation(loc){
  $.getJSON("https://maps.googleapis.com/maps/api/geocode/json?address=" + loc + "&key=AIzaSyBIE6YEyHJhBzfLM6WJvaeqcWkYQxsfJoA", function(location) {
      var latLong = location.results[0]['geometry']['location'];
      var lat = latLong.lat;
      var long = latLong.lng;
      $.getJSON("https://maps.googleapis.com/maps/api/timezone/json?location=" + lat + "," + long + "&timestamp=1458000000&key=AIzaSyBZ28KYNSL1GxA2WUD1X-5rRrzjm1pQ5EI", function(tz) {
        timeZoneDiff = tz.rawOffset / 3600;
      })
      getWeather("https://api.forecast.io/forecast/ded538b1a8782c194aee5d645961af0f/" + lat + "," + long + "?callback=?&extend=hourly");
      
      })
}





var bottomSections = document.querySelectorAll('.bottom');



bottomSections.forEach(function(section){
  section.addEventListener("click", function(){
    if (document.querySelector('.bottom-expand') === null){ // check if any section expanded
      clearContent();
      this.classList.toggle('bottom-expand');
    }
    else if (this.classList.contains('bottom-expand')){
      clearContent();
      this.classList.remove('bottom-expand');
    }
    else {
      return;
    }
})
})

function clearContent(){
  bottomSections.forEach(function(section, i){
    section.innerHTML = "";
});
}


bottomSections.forEach(function(section, i){
  section.addEventListener("transitionend", function(){
    if (!this.classList.contains('bottom-expand')){
      resetContent();
    }
    else {
      section.innerHTML = fiveDaysHourlyHTML[i];
    }
  });
});





function displayFive(){
  bottomSections.forEach(function(section, i){
    section.querySelector('.day').textContent = fivedays[i][0];  
    section.querySelector('.daytemp').innerHTML = fivedays[i][1] + '<i class="icon wi wi-' + unit + '"></i>';
    section.querySelector('.type').innerHTML = '<i class="icon wi ' + weatherIcons[fivedays[i][2]] + '"></i>';
    fivedayshtml.push(section.innerHTML);
});
}



function resetContent(){
  bottomSections.forEach(function(section, i){
    section.innerHTML = fivedayshtml[i];
  })
}


function make5day(){
  var forecast = [];
  for (var i = 0; i < 5; i++){
    var date = new Date(weather.daily.data[i+1].time * 1000);
    var day = days[date.getDay()];
    var daytemp = Math.round(5/9 * (weather.daily.data[i+1].temperatureMax - 32));
    var dayicon = weather.daily.data[i+1].icon;
    forecast.push([day,daytemp, dayicon]);

  }

  return forecast;

}

function make24hour(){
  hourly = [];
  var i = 0;
  while (weather.hourly.data[i] != null){
    var time = new Date(weather.hourly.data[i].time * 1000);
    time = new Date(time.getTime() + timeZoneDiff*60*60000);
    var hours = time.getHours();
    var minutes = time.getMinutes();
    var hourtemp = Math.round(5/9 * (weather.hourly.data[i].apparentTemperature - 32));
    var icon = weather.hourly.data[i].icon;
    hourly.push([hours, minutes,hourtemp,icon]);
    i++;
  }
  displayTodaysHourly(makeTodaysHourly(hourly));
  findDays();
  makeFiveDayHourly();
  makeFiveDayHourlyHTML();
}

function findDays(){
  var i = 0;
  for (i; i < hourly.length; i++){
    if (hourly[i][0] == 0){
      dayIndexes.push(i);
    }
  }
}

function make24Hour5Days(){
  var dayNum = 0;
  for (dayNum; dayNum < 5; dayNum++){
    var daysHourly = [];
    for (var j = 0; j < 24 ; j++){
      daysHourly.push(hourly[dayIndexes[dayNum] + j]);
    }
    fiveDayHourly.push(daysHourly);
  }
}

function makeTodaysHourly(hourly){
  today = [];
  var i = 0;
  if (hourly[0][0] % 2 != 0){ // if showing limited, ensure starts on an even hour
    var i = 1;
  } 
  for (var j = 0; j < 12; j++){
    today.push(hourly[i + (j*2)]);
  }
  return today;
  }
  

var currentDayHourly = document.querySelector('.hourly');

function displayTodaysHourly(today){
  var html = '';
    today.forEach(function(hour){
      var hoursHtml = '<div class="today-hour">';
      hoursHtml += '<div>' + zeroPadTime(hour[0]) + ":" +  zeroPadTime(hour[1]) +'</div>';
      hoursHtml += '<div>' + hour[2] + '<i class="icon wi wi-' + unit + '"></i></div>';
      hoursHtml += '<i class="icon wi ' + weatherIcons[hour[3]] + '"></i>'
      hoursHtml += '</div>';
      html += hoursHtml;
    })
    currentDayHourly.innerHTML = html;
}

function makeFiveDayHourly(){
  fiveDayHourly = [];
  for (var i = 0; i < 5; i++){
    var daysWeather = [];
    var firstDay = dayIndexes[i];
    for (var j = 0; j < 12; j++){
      daysWeather.push(hourly[firstDay + j*2])
    }
    fiveDayHourly.push(daysWeather);
  }
  // make html for the 5 day forecast hourly, store in an array

}

function makeFiveDayHourlyHTML(){
  fiveDaysHourlyHTML = [];
  fiveDayHourly.forEach(function(day, i){
    var daysWeather = fiveDayHourly[i];
    var daysHtml = '<div class="five-hourly">';
    daysWeather.forEach(function(hour){
        daysHtml += '<div>';
        daysHtml += '<div>' + zeroPadTime(hour[0]) + ':' + zeroPadTime(hour[1]) + '</div>';
        daysHtml += '<div>' + hour[2] + '<i class="icon wi wi-' + unit + '"></i></div>';
        daysHtml += '<i class="icon wi ' + weatherIcons[hour[3]] + '"></i>'
        daysHtml += '</div>'
    })
    daysHtml += '</div>';
    fiveDaysHourlyHTML.push(daysHtml);
  })
}



String.prototype.lpad = function(padString, length) {
    var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
}


function zeroPadTime(hour){
  return String(hour).length === 1 ? 0 + String(hour): hour;
}