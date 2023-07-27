import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import config from '@arcgis/core/config';
import Graphic from '@arcgis/core/Graphic.js';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import Search from "@arcgis/core/widgets/Search.js";
import Point from "@arcgis/core/geometry/Point.js";

config.apiKey = 'AAPK5e0a32880aae4a70a5dc38877ee2846e7o3jkkVClLIrbPdDakzoq7B3_SjkF9FedMbVnCjcS-ealECOVG9ReuAr9EeSmVEL';
let infoPanel;  // Info panel for place information
let clickPoint;  // Clicked point on the map
let activeCategory = "10000";  // Landmarks and Outdoors category

// GraphicsLayer for places features
const placesLayer = new GraphicsLayer({
  id: "placesLayer"
});

// GraphicsLayer for map buffer
const bufferLayer = new GraphicsLayer({
  id: "bufferLayer"
});

// Info panel interactions
const categorySelect = document.getElementById("categorySelect");
const resultPanel = document.getElementById("results");
const flow = document.getElementById("flow");

const map = new Map ({
  basemap: 'streets-navigation-vector',
  layers : [bufferLayer, placesLayer]
});

const view = new MapView({
  map : map,
  container: 'viewDiv',
  center: [-77.033695, -12.065190],
  zoom: 13
});

    // Clear graphics and results from the previous place search
    function clearGraphics() {
      bufferLayer.removeAll();  // Remove graphics from GraphicsLayer of previous buffer
      placesLayer.removeAll();  // Remove graphics from GraphicsLayer of previous places search
      resultPanel.innerHTML = "";
      if (infoPanel) infoPanel.remove();
    }
    
    // Event listener for category changes
    categorySelect.addEventListener("calciteComboboxChange", () => {
      activeCategory = categorySelect.value;
      clearGraphics();
      // Pass point to the showPlaces() function with new category value
      activeCategory && showPlaces(activeCategory);
    });

    const polyline = {};
    const simpleLineSymbol = {};
    
        // Display map click search area and pass to places service
        async function showPlaces(placePoint) {
          
          switch (placePoint) {
            case "10000":
                polyline.type = "polyline";
                polyline.paths = [
                     [ -77.033695, -12.065190 ],
                     [ -77.035019, -12.066749 ],
                     [ -77.038007, -12.067325 ],
                     [ -77.038067, -12.067855 ],
                     [ -77.038942, -12.069893 ]
                ];
                
                simpleLineSymbol.type = "simple-line";
                simpleLineSymbol.color = [226, 119, 40]; // Orange
                simpleLineSymbol.width =  2;
              break;
              case "11000":
                polyline.type = "polyline";
                polyline.paths= [
                     [ -77.055816 , -12.091007 ],
                     [ -77.050850 , -12.088260 ],
                     [ -77.049648 , -12.088438 ],
                     [ -77.044544 , -12.087752 ],
                     [ -77.044225 , -12.089623 ]
                ];
                simpleLineSymbol.type = "simple-line";
                simpleLineSymbol.color = [47, 90, 226]; // blue
                simpleLineSymbol.width =  2;
              break;          
            default:
              polyline = {
                type: "polyline",
                paths: [
                   [ -77.033695, -12.065190 ],
                   [ -77.035019, -12.066749 ],
                   [ -77.038007, -12.067325 ],
                   [ -77.038067, -12.067855 ],
                   [ -77.038942, -12.069893 ]
              ]
              };
              simpleLineSymbol = {
                 type: "simple-line",
                 color: [226, 119, 40], // Orange
                 width: 2
              };
              break;
          }

          const polylineGraphic = new Graphic({
             geometry: polyline,
             symbol: simpleLineSymbol
          });
          // Add buffer graphic to the view
          bufferLayer.graphics.add(polylineGraphic);
        }

view.when(()=> {
    console.log('view ready');
});