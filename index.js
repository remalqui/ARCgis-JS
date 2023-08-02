import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import config from '@arcgis/core/config';
import Graphic from '@arcgis/core/Graphic.js';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import WebStyleSymbol from "@arcgis/core/symbols/WebStyleSymbol.js";


config.apiKey = 'AAPK5e0a32880aae4a70a5dc38877ee2846e7o3jkkVClLIrbPdDakzoq7B3_SjkF9FedMbVnCjcS-ealECOVG9ReuAr9EeSmVEL';
let infoPanel;  // Info panel for place information
let activeCategory = "0";  // categoria del vendor
let activeCategory1 = "0"; // categoria de la fecha
let activeCategory2 = "0"; // Categoria para mostrar las rutas

// GraphicsLayer para las rutas de los vendedores
const bufferLayer = new GraphicsLayer({
  id: "bufferLayer"
});

// GraphicsLayer para los puntos de venta
const placesLayer = new GraphicsLayer({
  id: "placesLayer"
});

// Info panel interactions
const categorySelect = document.getElementById("categorySelect");
const categorySelectDate = document.getElementById("categorySelectDate");
const resultPanel = document.getElementById("results");
const flow = document.getElementById("flow");

const map = new Map ({
  basemap: 'streets-navigation-vector',
  layers : [bufferLayer, placesLayer]
});

const view = new MapView({
  map : map,
  container: 'viewDiv',
  center: [-77.043025 , -12.0809538],
  zoom: 14
});

    // Clear graphics and results from the previous place search
    function clearGraphics() {
      bufferLayer.removeAll(); 
      placesLayer.removeAll();  // Remove graphics from GraphicsLayer of previous buffer
      resultPanel.innerHTML = "";
      if (infoPanel) infoPanel.remove();
    }
    
    // Event listener for category changes
    categorySelect.addEventListener("calciteComboboxChange", () => {
      activeCategory = categorySelect.value;
      clearGraphics();
      actualizarCategoria ();
    });

    categorySelectDate.addEventListener("calciteComboboxChange", () => {
      activeCategory1 = categorySelectDate.value;
      clearGraphics();
      actualizarCategoria ();
    });

function actualizarCategoria (){
switch (activeCategory) {
  case "10000":
    switch (activeCategory1) {
      case "20000":
        activeCategory2 = "30000";
        showPlaces(activeCategory2);
        break;
      
      case "21000":
        activeCategory2 = "31000";
        showPlaces(activeCategory2);   
        break;

      default:
        break;
    }
    break;

  case "11000":
    switch (activeCategory1) {
      case "20000":
        activeCategory2 = "32000";
        showPlaces(activeCategory2);         
        break;
      
      case "21000":
        activeCategory2 = "33000";
        showPlaces(activeCategory2);           
        break;
  
      default:
        break;
    }  
    break;

  default:
    break;
}}

function createWebStyle(symbolName) {
  return new WebStyleSymbol({
    name: symbolName,
    styleName: "Esri2DPointSymbolsStyle"
  });
}
    // Variables para los graficos
    var polyline = {};
    var simpleLineSymbol = {};
    var points = [];            
    
        // Display map click search area and pass to places service
        async function showPlaces(placepoint) {
          
          switch (placepoint) {
            case "30000":
                    polyline.type = "polyline";
                    polyline.paths = [
                         [ -77.033695, -12.065190 ],
                         [ -77.035019, -12.066749 ],
                         [ -77.038007, -12.067325 ],
                         [ -77.038067, -12.067855 ],
                         [ -77.038942, -12.069893 ]
                    ];

                    simpleLineSymbol.type = "simple-line";
                    simpleLineSymbol.color = [255, 0, 0]; // red
                    simpleLineSymbol.width =  2;
                    
                    points = [
                      points[0] = { //Create a point
                        type: "point",
                        longitude: -77.033695,
                        latitude: -12.065190,
                        name : "Punto A"
                      },
 
                      points[1] = { //Create a point
                        type: "point",
                        longitude: -77.038007,
                        latitude: -12.067325,
                        name : "Punto B"                        
                      },
 
                      points[2] = { //Create a point
                        type: "point",
                        longitude: -77.038942,
                        latitude: -12.069893,
                        name : "Punto C"                      
                      }
                    ];

                    break;
            case "31000":
                    polyline.type = "polyline";
                    polyline.paths = [
                         [ -77.047588 , -12.075061 ],
                         [ -77.046033 , -12.075140 ],
                         [ -77.044316 , -12.075162 ],
                         [ -77.043947 , -12.074847 ],
                         [ -77.044831 , -12.072980 ]
                    ];

                    simpleLineSymbol.type = "simple-line";
                    simpleLineSymbol.color = [0, 0, 255]; // blue
                    simpleLineSymbol.width =  2;

                    points = [
                      points[0] = { //Create a point
                        type: "point",
                        longitude: -77.046033,
                        latitude: -12.075140,
                        name : "Punto D"                        
                      },
 
                      points[1] = { //Create a point
                        type: "point",
                        longitude: -77.043947,
                        latitude: -12.074847,
                        name : "Punto E"                        
                      }
                    ];                       

                    break;
            case "32000":
                    polyline.type = "polyline";
                    polyline.paths = [
                         [ -77.055816 , -12.091007 ],
                         [ -77.050850 , -12.088260 ],
                         [ -77.049648 , -12.088438 ],
                         [ -77.044544 , -12.087752 ],
                         [ -77.044225 , -12.089623 ]
                    ];

                    simpleLineSymbol.type = "simple-line";
                    simpleLineSymbol.color = [0,128,0]; // verde
                    simpleLineSymbol.width =  2;

                    points = [
                      points[0] = { //Create a point
                        type: "point",
                        longitude: -77.055816,
                        latitude: -12.091007,
                        name : "Punto F"                        
                      },
 
                      points[1] = { //Create a point
                        type: "point",
                        longitude: -77.049648,
                        latitude: -12.088438,
                        name : "Punto G"                        
                      },

                      points[2] = { //Create a point
                        type: "point",
                        longitude: -77.044544,
                        latitude: -12.087752,
                        name : "Punto H"                        
                      },       
                      
                      points[3] = { //Create a point
                        type: "point",
                        longitude: -77.044225,
                        latitude: -12.089623,
                        name : "Punto I"                        
                      }                        
                    ];                    

                    break;
            case "33000":
                    polyline.type = "polyline";
                    polyline.paths = [
                         [ -77.042431 , -12.084649 ],
                         [ -77.041985 , -12.087816 ],
                         [ -77.042510 , -12.087948 ],
                         [ -77.043677 , -12.087692 ],
                         [ -77.045893 , -12.087860 ]
                    ];
  
                    simpleLineSymbol.type = "simple-line";
                    simpleLineSymbol.color = [0, 0, 0]; // negro
                    simpleLineSymbol.width =  2;

                    points = [
                      points[0] = { //Create a point
                        type: "point",
                        longitude: -77.043677,
                        latitude: -12.087692,
                        name : "Punto J"                        
                      }
                    ];  
                    
                    break;  
            default:
              break;
          }

          const polylineGraphic = new Graphic({
             geometry: polyline,
             symbol: simpleLineSymbol
          });
          // Add buffer graphic to the view
          bufferLayer.graphics.add(polylineGraphic);

          for (let index = 0; index <= points.length; index++) {

            const pointGraphic = new Graphic({
              geometry: points[index],
              symbol: createWebStyle("museum")
           });
          placesLayer.graphics.add(pointGraphic);

          var infoDiv = document.createElement("calcite-list-item");
          infoDiv.label = points[index].name;
          resultPanel.appendChild(infoDiv);


          };

        }

view.when(()=> {
    console.log('view ready');

});