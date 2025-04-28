/////////////////////////////////////////////////////// intialize map ////////////////////////////////////////////////////////////////

// Initialize the Leaflet Map
let map = L.map('map').setView([31.642, 72.8247], 10);

map.zoomControl.setPosition('topright');
map.attributionControl.remove();
L.control.scale().addTo(map);

// esri map tile satellite view
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; <a href="http://www.esri.com/">Esri</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
}).addTo(map);

// GeoJSON  default Styles
var dstyle = {
    color: 'blue',
    weight: 1,
    fillOpacity: 0.3,
    fillColor: 'red'
};

// hover style
var hStyle = {
    color: 'red',
    weight: 2,
    fillOpacity: 0.2,
    fillColor: 'blue'
};


/////////////////////////////////////////////////////// get graph resoulution ////////////////////////////////////////////////////////////////


// Function to update the image source and reload the image
function updateImage(resolution) {
    const image = document.getElementById('graph-image');
    
    // Clear the current image by setting src to an empty string
    image.src = '';
    
    // Set the new source dynamically based on resolution
    image.src = `./images/correlation_${resolution}m.png`;

    // Optionally, trigger a "load" event to ensure the image is loaded (just in case)
    image.onload = function() {
        console.log(`Image for ${resolution}m loaded successfully.`);
    };
}


// Adding event listeners to the buttons
document.querySelectorAll('.btn-res').forEach(button => {
    button.addEventListener('click', () => {
        // Remove existing legend if present
        const resolution = button.getAttribute('data-res');
        updateImage(resolution);
    });
});


/////////////////////////////////////////////////////// remove layers ///////////////////////////////////////////////////////////////////


function removeAllLayersExceptBase() {
    map.eachLayer(layer => {
        if (!(layer instanceof L.TileLayer)) { 
            map.removeLayer(layer); // Remove everything except the base tile layer
        }
    });

    // Explicitly remove LST WMS Layer
    if (LSTLayer) {
        map.removeLayer(LSTLayer);
        LSTLayer = null; // Reset variable
    }

    // Explicitly remove NDVI WMS Layer
    if (NDVILayer) {
        map.removeLayer(NDVILayer);
        NDVILayer = null; // Reset variable
    }

    // rremove legend
    if (map.hasOwnProperty('_legendControl')) {
        map.removeControl(map._legendControl);
    }
}


/////////////////////////////////////////////////////// LST & NDVI ///////////////////////////////////////////////////////////////////


// NDVI Image Overlay (replace with your actual file paths)
let ndviBounds = [[32.148, 72.344], [31.189, 73.254]]; // Example coordinates (adjust based on your area)
let ndviLayer = L.imageOverlay('./lst_ndvi/NDVI100m.png', ndviBounds);
// ndviLayer.bindPopup("Chiniot_NDVI");

// LST Image Overlay (replace with your actual file paths)
let lstBounds = [[32.148, 72.344], [31.189, 73.254]]; // Example coordinates (adjust based on your area)
let lstLayer = L.imageOverlay('./lst_ndvi/LST100m.png', lstBounds);
// rasterLayer.bindPopup("<b>Land Surface Temperature</b><br>This is the LST raster image.");

// Function to switch between NDVI and LST layers
function toggleLayer(layerType) {
    map.setView([31.642, 72.8247], 10);
    if (layerType === 'ndvi') {
        removeAllLayersExceptBase();
        // Remove existing legend if present
        if (map.hasOwnProperty('_legendControl')) {
            map.removeControl(map._legendControl);
        }
        map.addLayer(ndviLayer);
    } else if (layerType === 'lst') {
        removeAllLayersExceptBase();
        // Remove existing legend if present
        if (map.hasOwnProperty('_legendControl')) {
            map.removeControl(map._legendControl);
        }
        map.addLayer(lstLayer);
    } 
}

let LSTLayer; // Declare globally
let NDVILayer; // Declare globally

document.querySelector('#btn-ndvi').addEventListener('click', () => {
    // toggleLayer('ndvi');
    map.setView([31.642, 72.8247], 10);
    removeAllLayersExceptBase();
    
    function addNDVILayer(){
        if (lstLayer) {
            map.removeLayer(lstLayer); // Ensure old layer is removed before adding a new one
        }
        LSTLayer = L.tileLayer.wms("http://localhost:8080/geoserver/wms", {
            layers: "ne:NDVI100m", // Replace with your workspace and layer name
            styles: "NDVI_styling", // The name of the style you created
            format: "image/png",
            transparent: true,
            attribution: "GeoServer"
        }).addTo(map);
    }

    addNDVILayer();

    // Create a Leaflet legend control
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "info legend");
        var grades = [-0.0845, 0.05, 0.15, 0.3, 0.4473]; // NDVI class breakpoints
        var colors = ["#D9F2D9", "#A8E6A8", "#70DB70", "#2E8B57", "#006400"]; // Corresponding colors

        // Add title
        div.innerHTML = "<h4>NDVI Legend</h4>";

        // Loop through breakpoints and add labels
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '; width: 20px; height: 20px; display: inline-block;"></i> ' +
                grades[i] + (grades[i + 1] ? " - " + grades[i + 1] + "<br>" : "+");
        }
        return div;
    };

    // Store legend reference to prevent duplication
    map._legendControl = legend;

    // Add legend to map
    legend.addTo(map);

});



document.querySelector('#btn-lst').addEventListener('click', () => {
    // toggleLayer('lst');
    map.setView([31.642, 72.8247], 10);
    removeAllLayersExceptBase();

    function addLSTLayer(){
        if (lstLayer) {
            map.removeLayer(lstLayer); // Ensure old layer is removed before adding a new one
        }
        LSTLayer = L.tileLayer.wms("http://localhost:8080/geoserver/wms", {
            layers: "ne:LST100m", // Replace with your workspace and layer name
            styles: "LST_styling", // The name of the style you created
            format: "image/png",
            transparent: true,
            attribution: "GeoServer"
        }).addTo(map);
    }

    addLSTLayer();



    var legend; // Global variable for LST legend

        legend = L.control({ position: "bottomright" });

        legend.onAdd = function (map) {
            var div = L.DomUtil.create("div", "info legend");
            var grades = [26, 32, 34, 37, 40, 48]; // LST value ranges
            var colors = ["#006400", "#00FF00", "#FFFF00", "#FFA500", "#FF0000"]; // LST color gradient

            div.innerHTML = "<h4>LST Legend</h4>";
            for (var i = 0; i < grades.length - 1; i++) {
                div.innerHTML +=
                    '<i style="background:' + colors[i] + '; width: 20px; height: 20px; display: inline-block;"></i> ' +
                    grades[i] + " ________ " + grades[i + 1] + "<br>";
            }
            return div;
        };

        // Store legend reference to prevent duplication
        map._legendControl = legend;

        legend.addTo(map);    
});


/////////////////////////////////////////////////////// AOI ///////////////////////////////////////////////////////////////////


// Example of a button to switch between NDVI and LST layers
document.querySelector('#btn-aoi').addEventListener('click', () => {
    removeAllLayersExceptBase();
    map.setView([31.642, 72.8247], 10);
    // Load GeoJSON Data
    fetch('chiniot_geoJson.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJson(data, {
            style: dstyle,
            onEachFeature: function (feature, layer) {
                layer.bindPopup("Chiniot");
                layer.on('mouseover', function () {
                    layer.setStyle(hStyle);
                });
                layer.on('mouseout', function () {
                    layer.setStyle(dstyle);
                });
            }
        }).addTo(map);
    });
});



/////////////////////////////////////////////////////// Hotspot ///////////////////////////////////////////////////////////////////


document.querySelector('#btn-hotspot').addEventListener('click', () => {
   
    // Change the view coordinates
    map.setView([40.7337, -73.9117], 11);

    // Load and Display the GeoJSON File
    fetch('hanan_geojson.geojson')  // Ensure the correct path to the file
    .then(response => response.json())
    .then(data => {
        L.geoJson(data, {
            pointToLayer: function(feature, latlng) {

                // Function to classify colors based on gizscore
                function getColor(gizscore) {
                    if (gizscore > 4) return "#8B0000";  // Dark Red (Strongest Hotspot)
                    if (gizscore > 3) return "#FF0000";  // Red
                    if (gizscore > 2) return "#FFA500";  // Orange
                    if (gizscore > 1) return "#FFFF00";  // Yellow
                    if (gizscore === 0) return "#000000B3"; // Gray (No significant value)
                    if (gizscore < -1) return "#ADD8E6"; // Light Blue
                    if (gizscore < -2) return "#0000FF"; // Blue
                    if (gizscore < -3) return "#00008B"; // Dark Blue (Strongest Coldspot)
                    return "#000000";  // Default (if undefined)
                }

                // Get the gizscore value from the feature properties
                let gizscore = feature.properties.GiZScore;
                // console.log('gizscore', gizscore);

                // Return a circle marker with classified colors
                return L.circleMarker(latlng, {
                    radius: 6,
                    fillColor: getColor(gizscore), // Color classification
                    color: "black",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                });
            },

            // Bind popup with attribute information
            onEachFeature: function(feature, layer) {
                let popupContent = `<b>ID:</b> ${feature.properties.SOURCE_ID}<br>
                                    <b>featue:</b> ${feature.geometry.type}<br>
                                    <b>Coordinates:</b> ${feature.geometry.coordinates}`;
                layer.bindPopup(popupContent);
            }
        }).addTo(map);
    })
    .catch(error => console.error('Error loading GeoJSON:', error));


    // Remove existing legend if present
    if (map.hasOwnProperty('_legendControl')) {
        map.removeControl(map._legendControl);
    }

    // Create and Add Legend
    let legend = L.control({ position: "topleft" });

    legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info-legend");
    div.innerHTML = `
        <strong>Hotspot Legend</strong><br>
        <div><span class="legend-box" style="background:#8B0000;"></span> <span style="color:#8B0000;">Strong Hotspot</span></div>
        <div><span class="legend-box" style="background:#FF0000;"></span> <span style="color:#FF0000;">Hotspot</span></div>
        <div><span class="legend-box" style="background:#FFA500;"></span> <span style="color:#FFA500;">Moderate Hotspot</span></div>
        <div><span class="legend-box" style="background:#FFFF00;"></span> <span style="color:#FFFF00;">Weak Hotspot</span></div>
        <div><span class="legend-box" style="background:#808080;"></span> <span style="color:#959999;">No Significant Value</span></div>
        <div><span class="legend-box" style="background:#ADD8E6;"></span> <span style="color:#ADD8E6;">Weak Coldspot</span></div>
        <div><span class="legend-box" style="background:#0000FF;"></span> <span style="color:#0000FF;">Moderate Coldspot</span></div>
        <div><span class="legend-box" style="background:#00008B;"></span> <span style="color:#00008B;">Strong Coldspot</span></div>
    `;
    return div;
};

// Add CSS dynamically
const style = document.createElement("style");
style.innerHTML = `
    .info-legend {
    background-color: rgba(255, 255, 255, 0.3);
    padding: 5px;
    border-radius: 10px;
    }
    .legend-box {
        display: inline-block;
        width: 15px;
        height: 15px;
        margin-right: 5px;
        border: 1px solid black;
        border-radius: 50%;
    }
`;

document.head.appendChild(style);

    // Store legend reference to prevent duplication
    map._legendControl = legend;

    legend.addTo(map);
});







