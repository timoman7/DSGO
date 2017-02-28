// Provide your access token
var myMap;
var mapImg;
var theMap;
var curCoords;
var player;
var mode = "tracking";
// 0 = mine
// 1 = mapbox
var tokens = ["pk.eyJ1Ijoic3NqM2JhbmUiLCJhIjoiY2l6b2FpMTdqMDJ5cTMydGo0amF1dXRzYyJ9.GABQWcrBBn3RJiwczospsQ", "pk.eyJ1IjoiY29kaW5ndHJhaW4iLCJhIjoiY2l6MGl4bXhsMDRpNzJxcDh0a2NhNDExbCJ9.awIfnl6ngyHoB3Xztkzarw"];
var accessToken = tokens[1];
var url;
var modeBtn;
var zoomLevel = 5;
var can;
var testReq;
var actualWidth = 1;
var actualHeight = 1;
var userCoords = {
  latitude: 0,
  longitude: 0
};

function objLength(obj) {
  var count = -1;
  for (var i in obj) {
    count++;
  }
  return count
}

function updatePos() {
  navigator.geolocation.getCurrentPosition(function(position) {
    curCoords = position.coords;
  });
}

function updateMap(clatlon, zoom) {
  url = "https://api.mapbox.com/styles/v1/mapbox/dark-v9/static/" + clatlon.longitude + ',' + clatlon.latitude + ',' + zoom + '/' + actualWidth + 'x' + actualHeight + '?access_token=' + accessToken;
  mapImg = loadImage(url);
}

function MouseWheelHandler(e) {

	// cross-browser wheel delta
	e = window.event || e; // old IE support
	var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
	zoomLevel=constrain(zoomLevel+(delta/10),0,20);
	return false;
}
function preload() {
  actualWidth = constrain(window.windowWidth,1,1280);
  actualHeight = constrain(window.windowHeight,1,1640);
  testReq = new XMLHttpRequest();
  updateMap(userCoords, zoomLevel);
  modeBtn = createButton(mode);
  modeBtn.id("modeBtn");
  modeBtn.mousePressed(swapMode);
  modeBtn.position(0, 0);
  modeBtn.show();
  navigator.geolocation.getCurrentPosition(function(position) {
    curCoords = position.coords;
  });
  myMap = createDiv();
  myMap.elt.style.position = "absolute";
  myMap.elt.style.zIndex = "-1";
  myMap.elt.style.top = "0";
  myMap.elt.style.width = actualWidth + "px";
  myMap.elt.style.height = actualHeight + "px";
  myMap.id('map');
  testReq.open("GET", "https://a.tiles.mapbox.com/v4/mapbox.streets.json?access_token=" + accessToken);
  testReq.onreadystatechange = function() {
    if (this.readyState === 4 && this.status !== 0 && this.responseURL === "") {
      L.mapbox.accessToken = accessToken;
      theMap = L.mapbox.map('map', 'mapbox.streets');
    }
  }
  testReq.send();
}

function setup() {
  can = createCanvas(actualWidth, actualHeight);
  if (curCoords) {
    //theMap.setView([curCoords.latitude,curCoords.longitude],2);
  }
  if (can.elt.addEventListener) {
    // IE9, Chrome, Safari, Opera
    can.elt.addEventListener("mousewheel", MouseWheelHandler, false);
    // Firefox
    can.elt.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
  }else{
    can.elt.attachEvent("onmousewheel", MouseWheelHandler);
  }
}

function swapMode() {
  if (mode === "tracking") {
    mode = "manual";
  } else if (mode === "manual") {
    mode = "tracking";
  }
  modeBtn.html(mode);
}
var onMap = false;
var drawType = "normal";

function mouseDragged() {
  if(mode === "manual" && drawType === "img"){
    var latLimit = 85.0511 * 2;
    var maxLat = 90;
    var minLat = -90;
    var maxLong = 180;
    var minLong = -180;
    var yChange = pmouseY - mouseY;
    var xChange = pmouseX - mouseX;
    userCoords.latitude -= yChange / (zoomLevel * (can.height));
    userCoords.longitude += xChange / (zoomLevel * (can.width));
    console.log(xChange,yChange);
    if (userCoords.longitude < minLong) {
      userCoords.longitude += 180;
    }
    if (userCoords.longitude > maxLong) {
      userCoords.longitude -= 180;
    }
    if (userCoords.latitude < -85.0511) {
      userCoords.latitude += latLimit;
    }
    if (userCoords.latitude > 85.0511) {
      userCoords.latitude -= latLimit;
    }
  }
}

function draw() {
  if (drawType === "img") {
    //background(255);
  }
  updatePos();
  if (theMap) {
    if (objLength(theMap.getTileJSON()) > 0) {
      drawType = "normal";
    } else {
      drawType = "img";
    }
  } else {
    drawType = "img";
  }
  if (mode === "tracking") {
    if (curCoords) {
      if (drawType === "normal") {
        theMap.setZoom(zoomLevel);
        theMap.setView([curCoords.latitude, curCoords.longitude], theMap.getZoom());
      } else {
        //Draw with img

      }
    }
  } else {
    if (drawType === "normal") {
      theMap = L.mapbox.map('map', 'mapbox.streets');
    } else {
      //Draw with img

    }
  }
  if (curCoords) {
    if (drawType === "normal") {
      if (!player && !onMap) {
        player = L.circle([curCoords.latitude, curCoords.longitude], 10);
        player.addTo(theMap);
        onMap = true;
      }
      if (player) {
        player.setLatLng([curCoords.latitude, curCoords.longitude]);
      }
    } else {
      //Draw with img

    }
  }
  if (drawType === "img") {
    image(mapImg, 0, 0);
    if (mapImg.pixels.length < 1) {
      mapImg.loadPixels();
    }
    if (mapImg.pixels.length > 0) {
      if (curCoords) {
        updateMap(curCoords, zoomLevel);
      }
      if (mode === "tracking") {
        if (curCoords) {
          var tempLat = curCoords.latitude;
          var tempLng = curCoords.longitude;
          userCoords.latitude = tempLat;
          userCoords.longitude = tempLng;
          updateMap(curCoords, zoomLevel);
        }
      } else {
        updateMap(userCoords, zoomLevel);
      }
    }
    if (mode === "tracking") {
      if (curCoords) {
        ellipse(width / 2, height / 2, 10, 10);
      }
    } else {
      if (curCoords) {
        ellipse(width / 2, height / 2, 10, 10);
      }
    }
  }
}