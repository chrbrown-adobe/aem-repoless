// var long = document.getElementById("49131").innerHTML
// var lat = document.getElementById("-123091").innerHTML

const directions = document.getElementsByClassName("map")[0].innerHTML;
// var longandlat = directions.match(/(\d+(?:\.\d+)?)/g);
const longandlat = directions.match(/(-?\d+(?:\.\d+)?)/g);

const long = longandlat[0];
const lat = longandlat[1];

// alert (long + "" + lat)
// document.getElementById('google-map-location').innerHTML = long + " " + lat;
const map = document.createElement("p");
map.id = "google-map-location";
const location = document.getElementsByClassName("map")[0];
location.appendChild(map);

// document.getElementById('google-map-location').innerHTML = "<object type=\"text/html\" data=\"https://google.com/maps?q=" + long + "," + lat + "\"" + "style=\"width:1400px; height:400px\"></object>";
document.getElementById("google-map-location").innerHTML =
  '<object type="text/html" data="https://www.google.com/maps/embed/v1/place?key=AIzaSyDXzFn5v3nI8tvmgI9lDk17bVYszO0ThsI&zoom=12&maptype=roadmap&q=' +
  long +
  "," +
  lat +
  '"' +
  'style="width:1200px; height:600px"></object>';

class locationInfo {
  constructor(method, input) {
    this.method = method,
      this.input = input,
      this.getLocationInfo = function (callback) {
        var callback = callback;
        var getLocObj = this.getLonLatObject;
        if (this.method == "address" && this.input != null && this.input != "") {
          var geocoder = new google.maps.Geocoder();
          geocoder.geocode({
            'address': this.input
          }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              lat = (results[0].geometry.location.lat());
              lng = (results[0].geometry.location.lng());
              if (results[0].address_components[7]) {
                zip = (results[0].address_components[0].short_name);
                city = (results[0].address_components[1].short_name);
                state = (results[0].address_components[4].short_name);
                address = city + ", " + state + " " + zip;
                callback(true, lat, lng, city, state, zip, address, callback);
              }
              else {
                var loc = getLocObj(lat, lng);
                locationSuccess(loc);
              }
            } else {
              callback(false);
            }
          });
        }
        else {
          if (navigator.geolocation != null) {
            navigator.geolocation.getCurrentPosition(locationSuccess, locationFail);
          }
          else {
            if (typeof pos != 'undefined') {
              var lat = pos.coords.latitude;
              var lng = pos.coords.longitude;
            }
            else {
              var lat = 42.800808;
              var lng = -71.562538;
            }
            var loc = getLocObj(lat, lng);
            locationSuccess(loc);
          }

        }
        function locationSuccess(loc) {
          var good = false;
          var city;
          var zip;
          var state;
          var address;
          if (loc.coords) {
            var lat = loc.coords.latitude;
            var lng = loc.coords.longitude;
          }
          else {
            var lat = loc.lat();
            var lng = loc.lng();
          }
          $.ajax({
            url: "http://api.geonames.org/findNearbyPostalCodesJSON",
            dataType: "json",
            async: false,
            data: {
              username: "ektronse",
              lat: lat,
              lng: lng
            },
            success: function (data) {
              if (data.postalCodes[0]) {
                zip = data.postalCodes[0].postalCode;
                city = data.postalCodes[0].placeName;
                state = data.postalCodes[0].adminCode1;
                address = city + ", " + state + " " + zip;
                good = true;
              }
              else {
                city = "";
                state = "";
                zip = "";
                address = "";
              }
            }
          }).done(callback(good, lat, lng, city, state, zip, address));
        };
        function locationFail(error) {
          callback(false);
        }
      }
      ,
      this.getLonLatObject = function (lat, lng) {
        return new google.maps.LatLng(parseFloat(lat), parseFloat(lng));
      }
      ,
      this.getAddress = function (which) {
        switch (which) {
          case "a":
            return "239 Main Street, " + this.city + ". " + this.state + " " + this.zip;
            break;

          case "b":
            return "42 Haverill Road, " + this.city + ". " + this.state + " " + this.zip;
            break;

          case "c":
            return "939 South Gate Road, " + this.city + ". " + this.state + " " + this.zip;
            break;
        }
      };
  }
}


class locationMap {
  constructor(mapid, location) {
    this.location = location,
      this.mapid = mapid,
      this.createMarkers = function () {
        this.markers = [{
          title: "<p class='storeTitle'>TimberTech Dealer</p><p class='storeAddress'>" + location.getAddress("a") + "</p>",
          lat: this.location.lat,
          lng: this.location.lng,
          name: "EkoVision Store"
        }, {
          title: "<p class='storeTitle'>TimberTech Dealer</p><p class='storeAddress'>" + location.getAddress("b") + "</p>",
          lat: this.location.lat + 0.03,
          lng: this.location.lng + 0.001,
          name: "EkoVision Store"
        }, {
          title: "<p class='storeTitle'>TimberTech Dealer</p><p class='storeAddress'>" + location.getAddress("c") + "</p>",
          lat: this.location.lat + 0.01,
          lng: this.location.lng + 0.03,
          name: "AZEK Dealer"
        }
        ];
        // Create the markers
        for (index in this.markers) {
          this.addMarker(this.markers[index], this.map);
        }
      }
      ,
      this.addMarker = function (data, map) {
        var storeLocation = new google.maps.LatLng(parseFloat(data.lat), parseFloat(data.lng));
        var marker = new google.maps.Marker({
          position: storeLocation,
          map: map,
          title: data.name,
          content: data.title
        });

        var pin = new google.maps.MVCObject();
        google.maps.event.addListener(marker, "click", function () {
          infowindow.content = marker.content;
          pin.set("position", marker.getPosition());
          infowindow.open(map, marker);
          var t = 1;
        });
      }
      ,
      this.createBounds = function () {
        // Zoom and center the map to fit the markers
        // This logic could be conbined with the marker creation.
        // Just keeping it separate for code clarity.
        var bounds = new google.maps.LatLngBounds();
        for (index in this.markers) {
          var data = this.markers[index];
          bounds.extend(new google.maps.LatLng(data.lat, data.lng));
        }
        this.map.fitBounds(bounds);
      }
      ,
      this.createInfoWindow = function () {
        var content = document.createElement("DIV");
        var title = document.createElement("DIV");
        content.appendChild(title);
        var address = document.createElement("DIV");
        address.style.width = "100px";
        address.style.height = "80px";
        content.appendChild(address);
        infowindow = new google.maps.InfoWindow({
          content: content
        });
      }
      ,
      this.createMap = function () {
        // Zoom in on user's location on map
        this.map = new google.maps.Map(document.getElementById(this.mapid), {
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          streetViewControl: false
        });
        this.zip = this.location.zip;
        this.state = this.location.state;
        this.city = this.location.city;
        this.createMarkers();
        this.createBounds();
        this.displayAddresses();
      }
      ,
      this.displayAddresses = function () {
        this.storeMarkup = "";
        for (index in this.markers) {
          this.storeMarkup += this.markers[index].title;
        }
        return this.storeMarkup;
      };
  }
}

function findStores(input, callback) {
  var locInfo = new locationInfo("address", input);
  locInfo.getLocationInfo(saveLocation);
  function saveLocation(success, nlat, nlng, ncity, nstate, nzip, naddress) {
    if (success) {
      locInfo.lat = nlat;
      locInfo.lng = nlng;
      locInfo.city = ncity;
      locInfo.state = nstate;
      locInfo.zip = nzip;
      locInfo.address = naddress;
    }
    else {
      locInfo.lat = "42.796";
      locInfo.lng = "-71.530";
      locInfo.city = "Nashua";
      locInfo.state = "NH";
      locInfo.zip = "03063";
      locInfo.address = naddress;
    }
    callback(locInfo);
  }
}
function displayLocation(location) {
  $("._EKSC_zip").text(location.zip);
  $(".addressa, select#store>option:nth-child(1)").text((location.getAddress("a")));
  $(".addressb, select#store>option:nth-child(2)").text((location.getAddress("b")));
  $(".addressc, select#store>option:nth-child(3)").text((location.getAddress("c")));
  lineUpMenus();
}
function locateStore(what) {
  var findWhat = $("#" + what).val();
  createCookie("findwhat", findWhat, 0);
  window.location = "/StoreLocator.aspx?findwhat=1";
}
function createCookie(name, value, days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    var expires = "; expires=" + date.toGMTString();
  }
  else var expires = "";
  document.cookie = name + "=" + value + expires + "; path=/";
};

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

function eraseCookie(name) {
  createCookie(name, "", -1);
};
(function ($) {
  $.QueryString = (function (a) {
    if (a == "") return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
      var p = a[i].split('=');
      if (p.length != 2) continue;
      b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
  })(window.location.search.substr(1).split('&'))
})(jQuery);

function trim(s) {
  s = s.replace(/(^\s*)|(\s*$)/gi, "");
  s = s.replace(/[ ]{2,}/gi, " ");
  s = s.replace(/\n /, "\n");
  return s;
}
function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value;
  });
  return vars;
}

function GetCookie(name) {
  var arg = name + "=";
  var alen = arg.length;
  var clen = document.cookie.length;
  var i = 0;
  while (i < clen) {
    var j = i + alen;
    if (document.cookie.substring(i, j) == arg) {
      return getCookieVal(j);
    }
    i = document.cookie.indexOf(" ", i) + 1;
    if (i == 0) break;
  }
  return null;
}

function getCookieVal(offset) {
  var endstr = document.cookie.indexOf(";", offset);
  if (endstr == -1) {
    endstr = document.cookie.length;
  }

  return unescape(document.cookie.substring(offset, endstr));
}