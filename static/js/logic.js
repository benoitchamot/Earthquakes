// URL of GeoJSON file (all earthquakes)
let queryURL_7days = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
let queryURL_30days = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"

// Global variables
let colours = ['#3B123B', '#846B8A', '#C98BB9', '#CFA5B4', '#F7D4BC', '#FAE3E3'];
let buckets = [10, 30, 50, 70, 90];
let myMap;
let boundaries;

// A function to determine the marker size based on the magnitude
function markerSize(magnitude) {
    return (magnitude*5);
}

function markerColour(depth) {
    if (depth < buckets[0]) {return colours[0];}
    else if (depth < buckets[1]) {return colours[1];}
    else if (depth < buckets[2]) {return colours[2];}
    else if (depth < buckets[3]) {return colours[3];}
    else if (depth < buckets[4]) {return colours[4];}
    else {return colours[5];};
};

// createMap() takes the earthquake data and incorporates it into the visualization:
function createMap(earthquakes, boundaries) {
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };
  
    // Creat an overlays object.
    let overlayMaps = {
      "Earthquakes": earthquakes,
      "Plates": boundaries
    }
    
    // Create a new map.
    // Edit the code to add the earthquake data to the layers.
    myMap = L.map("map", {
        center: [0, 0],
        zoom: 3,
        layers: [street, earthquakes]
    });

    // Create a layer control that contains our baseMaps.
    // Be sure to add an overlay Layer that contains the earthquake GeoJSON.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(myMap);

    // Create a legend
    let legend = L.control({position: "bottomright"});
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let labels = [];
        let texts = [];

        let legendInfo = "<h1>Earthquakes depth</h1>";

        div.innerHTML = legendInfo;

        colours.forEach(function(colour, index) {
            let text = '--'
            if (index == 0) {text = "<" + buckets[index];}
            else if (index == colours.length-1) {text = ">" + buckets[index-1];}
            else {text = buckets[index-1] + "-" + buckets[index];}

            // Add labels colours and texts to the lists
            labels.push("<li style=\"background-color: " + colour + "\"></li>");
            texts.push("<li>" + text + "</li>");
        });

        // Create lists to display the labels (texts) and the colours of the legend
        div.innerHTML += "<ul>" + texts.join("") + "</ul>";
        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    }

    // Add legend to map
    legend.addTo(myMap);
  }

// Create features for the map
function createFeatures(earthquakeData) {
    // Create a layer and a popup 
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>
            <p>${new Date(feature.properties.time)}</p>
            <p>Magnitude: ${feature.properties.mag}</p>
            <p>Depth: ${feature.geometry.coordinates['2']}</p>`);
    }

    // Save the earthquake data in a variable.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,

        pointToLayer: function(feature, latlng) {
            let color = markerColour(feature.geometry.coordinates['2']);
            
            let geojsonMarkerOptions = {
              radius: markerSize(feature.properties.mag),
              fillColor: color,
              color: 'black',
              weight: 1,
              opacity: 1,
              fillOpacity: 0.8
            };
            pointer = L.circleMarker(latlng, geojsonMarkerOptions);
            return pointer;
          }
    })
    
    // Pass the earthquake data to a createMap() function.
    createMap(earthquakes, boundaries);
}

function createDashboard(value) {

    let queryURL = queryURL_7days;

    // Save the tectonic plates data in variables
    boundaries = L.geoJson(boundaries_geojson);

    // Perform a GET request to the query URL.
    d3.json(queryURL).then(function (data) {
        // Pass all the features to a createFeatures() function:
        createFeatures(data.features);
    });
}

function updateDashboard(value) {
    // Turn off and remove the map before updated
    myMap.off();
    myMap.remove();

    // Get new query URL
    let queryURL = ''
    if (value == 'data_7days') {queryURL = queryURL_7days}
    else if (value == 'data_30days') {queryURL = queryURL_30days}

    // Perform a GET request to the query URL.
    d3.json(queryURL).then(function (data) {
        // Pass all the features to a createFeatures() function:
        createFeatures(data.features);
    });
}

let value = 'data_30days';
createDashboard(value);

