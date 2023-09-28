let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

function markerSize(m) {
    return (m*5);
}

function markerColour (d) {
    return d > 80  ? '#0868ac' :
           d > 60  ? '#43a2ca' :
           d > 40  ? '#7bccc4' :
           d > 20  ? '#bae4bc' :
                     '#f0f9e8' ;
}

let legend_labels = ['<20','20-40','40-60','60-80','>80']

let myMap;

function createMap(earthquakes) {
    
    // map config
    let darkMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &amp; <a href="https://carto.com/attributions">CARTO</a>'
    });
    
    myMap = L.map("map", {
        center: [0, 0],
        zoom: 2,
        layers: [darkMap] 
    });

    //boundaries
    var plates = new L.LayerGroup();
    d3.json(
        "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
        ).then(function (tectonicPlateData) {
            L.geoJson(tectonicPlateData, {
                style: {
                    color: 'red',
                    weight: 1,  
                    opacity: 0.5 
                }
            }).addTo(plates);
    
            plates.addTo(myMap);

            // earthquakes added on top of plates
            earthquakes.addTo(myMap);
        });

    // legend
    let legend = L.control({position: "bottomright"});

    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        let labels = [];
        let colours = [];
        let depths = [0, 20, 40, 60, 80];

        div.innerHTML = "<h1>Earthquake depth</h1>";

        depths.forEach(function(depth, index) {
            let colour = markerColour(depth + 1);
            let text = legend_labels[index];
            colours.push("<li style=\"background-color: " + colour + "\"></li>");
            labels.push("<li>" + text + "</li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        div.innerHTML += "<ul>" + colours.join("") + "</ul>";
        return div;
    };

    legend.addTo(myMap);
 
}

function createFeatures(earthquakeData) {
    
    // tooltips
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<p><strong>${feature.properties.place}</strong></p>
            <p>${new Date(feature.properties.time)}</p>
            <p>Magnitude: ${feature.properties.mag}</p>
            <p>Depth: ${feature.geometry.coordinates['2']}</p>`);
    }

    // markers
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,

        pointToLayer: function(feature, latlng) {
            let geojsonMarkerOptions = {
              radius: feature.properties.mag*4,
              fillColor: markerColour(feature.geometry.coordinates['2']),
              weight: 1,
              opacity: 0.1,
              fillOpacity: 0.7
            };
            pointer = L.circleMarker(latlng, geojsonMarkerOptions);
            return pointer;
          }
    })
    
    createMap(earthquakes);
}

function createDashboard() {
    d3.json(url).then(function (data) {
        createFeatures(data.features);
    });
}

createDashboard();

