// Assign USGS API url (All Earthquakes from the Past 7 Days) to a variable
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Create a function to set up marker color based on depth of earthquake
function color(depth) {
  if (depth > -10 && depth <= 10){
    return "#51991e"} 

  else if (depth > 10 && depth <= 30) {
    return "#97e808"}

  else if (depth > 30 && depth <= 50) {
    return "#f7db11"}

  else if (depth > 50 && depth <= 70) {
    return "#fdb72a"}

  else if (depth > 70 && depth <= 90) {
    return "#fca35d"}

  else {
    return "#ff5f65"}
}

// Create a function to set up marker size based on magnitude of earthquake
function size(mag) {
  return mag * 4;
}

// Create a function to set up options/styling for circle markers
function earthquakeMarker(feature, location) {
  var options = {
    color: "black",
    weight: 1,
    fillOpacity: 1,
    fillColor: color(feature.geometry.coordinates[2]),
    radius: size(feature.properties.mag)
  }
  return L.circleMarker(location, options);
};

// Create function to create map with legend
function createMap(earthquakes) {

  // Create the tile layer that will be the background of our map
  var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: `Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>`,
    minZoom: 0,
    maxZoom: 20,
    id: "light-v10",
      accessToken: API_KEY
  });
  
  // Create a baseMaps object to hold the baseMaps layer
  var baseMaps = {
    "Light Map": lightMap
  };
  
  // Create overlay object to hold our overlayMaps layer
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Create the map object, use center of continental US as starting point
  var myMap = L.map("map", {
    center: [39.8283, -98.5795],
    zoom: 4,
    layers: [lightMap, earthquakes]
  });
  
  /* Create layer control with baseMaps and overlayMaps, then add the 
  layer control element to the map */
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create the legend
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (myMap) {
  
      var div = L.DomUtil.create('div', 'info legend')
          grades = [-10, 10, 30, 50, 70, 90]
          //labels = [];
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + color(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }
  
      return div;
  };
  // Add legend to the map
  legend.addTo(myMap);
};

// Create function to set up pop-up/tooltip for circle markers
function popUp(feature, layer) {
  return layer.bindPopup(`<hr> <h1>Magnitude: ${feature.properties.mag} </h1><h3>Location: ${feature.properties.place} </h3><h3>Depth: ${feature.geometry.coordinates[2]} km</h3> `);
}

// Call the API to pull data for map elements
d3.json(url).then(function(data) {
  // Set up GeoJSON layer with options
  var earthquake = L.geoJSON(data.features, {
    onEachFeature: popUp,
    pointToLayer: earthquakeMarker
  });
  // Call function to create the map
  createMap(earthquake)
});