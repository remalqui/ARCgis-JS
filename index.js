import MapView from '@arcgis/core/views/MapView';
import configKey from '@arcgis/core/config';
import Graphic from '@arcgis/core/Graphic.js';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import Chart from 'chart.js/auto';
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery.js";
import LayerList from "@arcgis/core/widgets/LayerList.js";
import WebMap from "@arcgis/core/WebMap.js";

//############ Inicio ################# Variables #############################//
//#############################################################################//

configKey.apiKey = 'AAPK5e0a32880aae4a70a5dc38877ee2846e7o3jkkVClLIrbPdDakzoq7B3_SjkF9FedMbVnCjcS-ealECOVG9ReuAr9EeSmVEL';
let activeCategory = "0";  // categoria del vendor
let activeCategory1 = "0"; // categoria de la fecha
let activeCategory2 = "0"; // Categoria para mostrar las rutas

// GraphicsLayer para las rutas de los vendedores
const bufferLayer = new GraphicsLayer({
  id: "bufferLayer",
  title : 'Recorrido'
});

// GraphicsLayer para los puntos de venta
const placesLayer = new GraphicsLayer({
  id: "placesLayer",
  title : 'Puntos de venta'
});

// Info panel interactions
const categorySelect = document.getElementById('categorySelect');
const categorySelectDate = document.getElementById('categorySelectDate');
const resultPanel = document.getElementById('results');
var acquisitions = document.getElementById('acquisitions');


const map = new WebMap({
  basemap: 'streets-navigation-vector',
  layers : [bufferLayer, placesLayer]
});

const view = new MapView({
  map : map,
  container: 'viewDiv',
  center: [-77.043025 , -12.0809538],
  zoom: 14
});

view.ui.move("zoom", "above-left");

const basemaps = new BasemapGallery({
  view : view,
  container: "basemaps-container"
});

const layerList = new LayerList({
  view : view,
  selectionEnabled: true,
  container: "layers-container"
});


// configuracion de los widgets de layers y basemap
 map.when(() => {

  let activeWidget;

  const handleActionBarClick = ({ target }) => {
    if (target.tagName !== "CALCITE-ACTION") {
      return;
    }

    if (activeWidget) {
      document.querySelector(`[data-action-id=${activeWidget}]`).active = false;
      document.querySelector(`[data-panel-id=${activeWidget}]`).hidden = true;
    }

    const nextWidget = target.dataset.actionId;
    if (nextWidget !== activeWidget) {
      document.querySelector(`[data-action-id=${nextWidget}]`).active = true;
      document.querySelector(`[data-panel-id=${nextWidget}]`).hidden = false;
      activeWidget = nextWidget;
    } else {
      activeWidget = null;
    }
  };

  document.querySelector("calcite-action-bar").addEventListener("click", handleActionBarClick);

  let actionBarExpanded = false;

  document.addEventListener("calciteActionBarToggle", event => {
    actionBarExpanded = !actionBarExpanded;
    view.padding = {
      left: actionBarExpanded ? 10 : 10
    };
  });

   document.querySelector("calcite-shell").hidden = false;
   document.querySelector("calcite-loader").hidden = true; 
});

// Variables para los graficos
var polyline = {
  type : "polyline",
  paths : []
};
var simpleLineSymbol = {
   color: [0, 176, 255],
   type : "simple-line",
   width : 3,
   join : "round",
   style : "solid"
   };

var points = [];
var data = {};

const customBar = {
id: 'customBar',
beforeDatasetsDraw(chart,args,pluginOptions){
   const {ctx, config, data, chartArea : {top, bottom, left, right, width, height}, scales : {x,y} } = chart;
   ctx.save();
 
   const datapointArray = data.datasets.map((dataset, index) => {
     return dataset.data[0];
   })
   console.log(datapointArray)

   const accumulate = array => array.map((sum => value => sum+= value)(0));
   const cumulativeSumArray = accumulate(datapointArray);
   console.log(cumulativeSumArray);
   cumulativeSumArray.unshift(0);

   for (let i = 0; i < datapointArray.length; i++) {
    ctx.font = 'bolder 20px sans-serif';
    ctx.fillStyle = 'black';
    ctx.fillText(`${datapointArray[i]}`, x.getPixelForValue(cumulativeSumArray[i])+20, 20);
    
    ctx.font = 'bolder 15px sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText(data.datasets[i].label, x.getPixelForValue(cumulativeSumArray[i])+20, 35);
   }

 }
};

//configuracion del grafico estadistico
const config = {
  type: 'bar',
  data: data,
  options: {
    responsive: true,
    aspectRatio : 3,
    indexAxis: 'y',
    borderSkipped:false,
    borderWidth:1,
    barPercentage:1,
    categoryPercentage:1,
    scales: {
      x: {
        stacked: true,
        grid: {
         display:false,
         drawBorder:false,
         drawTicks:false
        },
        ticks:{
         display:false
        }
      },
      y: {
        beginAtZero: true,
        stacked: true,
        grid: {
         display:false,
         drawBorder:false,
         drawTicks:false
        },
        ticks:{
         display:false
        }
      }
    },
   plugins: {
    legend:{
      display:false
    }
   }
  },
  plugins: [customBar]
};

//seteo de parametros del grafico
var myChart = new Chart(
  acquisitions,
  config
  );


//##########################################################################//
//############ Fin ################# Variables #############################//


//############ Inicio ################# Funciones #############################//
//#############################################################################//

    // Clear graphics and results from the previous place search
function clearGraphics() {
  bufferLayer.removeAll(); 
  placesLayer.removeAll();  // Remove graphics from GraphicsLayer of previous buffer
  resultPanel.innerHTML = "";
  clearCanvas();
  polyline.paths = [];
}

function clearCanvas(){
  var ctx = acquisitions.getContext("2d");
  ctx.clearRect(0, 0, acquisitions.width, acquisitions.height);
  //ctx.beginPath();  
}


// Listener para el cambio de vendedor
categorySelect.addEventListener("calciteComboboxChange", () => {
  activeCategory = categorySelect.value;
  clearGraphics();
  actualizarCategoria ();
  view.closePopup();
})

// Listener para el cambio de fecha
categorySelectDate.addEventListener("calciteComboboxChange", () => {
  activeCategory1 = categorySelectDate.value;
  clearGraphics();
  actualizarCategoria ();
  view.closePopup();
})

// Se setea un valor a un variable de acuerdo a la seleccion de vendedor y fecha
function actualizarCategoria (){
  console.log(activeCategory, activeCategory1);
  switch (activeCategory) {
    case "10000":
      switch (activeCategory1) {
        case "20000":
          activeCategory2 = "30000";
          showPlaces(activeCategory2);
          estadistica(activeCategory2);
          break;
        
        case "21000":
          activeCategory2 = "31000";
          showPlaces(activeCategory2);
          estadistica(activeCategory2);          
          break;
  
        default:
          activeCategory2 = "0";
          estadistica(activeCategory2);
          break;
      }
      break;
  
    case "11000":
      switch (activeCategory1) {
        case "20000":
          activeCategory2 = "32000";
          showPlaces(activeCategory2);
          estadistica(activeCategory2);          
          break;
        
        case "21000":
          activeCategory2 = "33000";
          showPlaces(activeCategory2);
          estadistica(activeCategory2);          
          break;
    
        default:
          activeCategory2 = "0";
          estadistica(activeCategory2);
          break;
      }  
      break;
  
    default:
      activeCategory2 = "0";
      estadistica(activeCategory2);
      break;
}
console.log(activeCategory2);
}

// Sirve para agregarle un icono a los puntos venta
function createWebStyle(color) {
  let textSymbol = {
    type : "text",
    color: color,
    text: "\ue613",
    font: {
      // autocasts as new Font()
      size: 20,
      family: "CalciteWebCoreIcons"
    }
  }

  return textSymbol;
}

//##########################################################################//
//############ Fin ################# Funciones #############################//
        
    
        // Display map click search area and pass to places service
async function showPlaces(placepoint) {
  
  switch (placepoint) {
    case "30000":
            
            points = [
              points[0] = { //Create a point
                type: "point",
                longitude: -77.033695,
                latitude: -12.065190,
                name : "PV 01",
                tecnologia : "Si"
              },
              points[1] = { //Create a point
                type: "point",
                longitude: -77.035019,
                latitude: -12.066749,
                name : "PV 02",
                tecnologia : "No"
              },
              points[2] = { //Create a point
                type: "point",
                longitude: -77.038007,
                latitude: -12.067325,
                name : "PV 03",
                tecnologia : "No"
              },
              points[3] = { //Create a point
                type: "point",
                longitude: -77.038067,
                latitude: -12.067855,
                name : "PV 04",
                tecnologia : "No"
              },
              points[4] = { //Create a point
                type: "point",
                longitude: -77.038942,
                latitude: -12.069893,
                name : "PV 05",
                tecnologia : "Si"
              },
              points[5] = { //Create a point
                type: "point",
                longitude: -77.039325,
                latitude: -12.070402,
                name : "PV 06",
                tecnologia : "No"
              },
              points[6] = { //Create a point
                type: "point",
                longitude: -77.039720,
                latitude: -12.072351,
                name : "PV 07",
                tecnologia : "No"
              },
              points[7] = { //Create a point
                type: "point",
                longitude: -77.041058,
                latitude: -12.072144,
                name : "PV 08",
                tecnologia : "No"
              },
              points[8] = { //Create a point
                type: "point",
                longitude: -77.041396,
                latitude: -12.072810,
                name : "PV 09",
                tecnologia : "Otra"                    
              },
              points[9] = { //Create a point
                type: "point",
                longitude: -77.042018,
                latitude: -12.072774,
                name : "PV 10",
                tecnologia : "Si"
              },
              points[10] = { //Create a point
                type: "point",
                longitude: -77.044664,
                latitude: -12.072745,
                name : "PV 11",
                tecnologia : "No"
              },
              points[11] = { //Create a point
                type: "point",
                longitude: -77.044822,
                latitude: -12.073002,
                name : "PV 12",
                tecnologia : "No"
              },
              points[12] = { //Create a point
                type: "point",
                longitude: -77.045010,
                latitude: -12.073049,
                name : "PV 13",
                tecnologia : "No"
              },
              points[13] = { //Create a point
                type: "point",
                longitude: -77.044997,
                latitude: -12.073836,
                name : "PV 14",
                tecnologia : "Si"
              },
              points[14] = { //Create a point
                type: "point",
                longitude: -77.045028,
                latitude: -12.075090,
                name : "PV 15",
                tecnologia : "No"
              },
              points[15] = { //Create a point
                type: "point",
                longitude: -77.045020,
                latitude: -12.075858,
                name : "PV 16",
                tecnologia : "No"
              }
            ];

            for (let j = 0; j < points.length; j++) {
                polyline.paths.push([points[j].longitude, points[j].latitude]) 
            }
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

            points = [
              points[0] = { //Create a point
                type: "point",
                longitude: -77.046033,
                latitude: -12.075140,
                name : "Punto D",
                tecnologia : "No"
              },
              points[1] = { //Create a point
                type: "point",
                longitude: -77.043947,
                latitude: -12.074847,
                name : "Punto E",
                tecnologia : "Otra"
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

            points = [
              points[0] = { //Create a point
                type: "point",
                longitude: -77.055816,
                latitude: -12.091007,
                name : "Punto F",
                tecnologia : "Si"
              },
              points[1] = { //Create a point
                type: "point",
                longitude: -77.049648,
                latitude: -12.088438,
                name : "Punto G",
                tecnologia : "Si"
              },
              points[2] = { //Create a point
                type: "point",
                longitude: -77.044544,
                latitude: -12.087752,
                name : "Punto H",
                tecnologia : "Si"
              },       
              points[3] = { //Create a point
                type: "point",
                longitude: -77.044225,
                latitude: -12.089623,
                name : "Punto I",
                tecnologia : "Otra"
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
            
            points = [
              points[0] = { //Create a point
                type: "point",
                longitude: -77.043677,
                latitude: -12.087692,
                name : "Punto J",
                tecnologia : "Si"
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
  let colorIcon = "#000000";
  for (let index = 0; index <= points.length; index++) {

    switch (points[index].tecnologia) {
      case "Si":
        colorIcon = "#0000FF";
        break;

      case "No":
        colorIcon = "#800080";
        break;
      
      case "Otra":
        colorIcon = "#000000";
        break;

      default:
        colorIcon = "#000000";
        break;
    }
    const pointGraphic = new Graphic({
      geometry: points[index],
      symbol: createWebStyle(colorIcon)
   });
  placesLayer.graphics.add(pointGraphic);
  var infoDiv = document.createElement("calcite-list-item");
  infoDiv.label = points[index].name;

  infoDiv.addEventListener("click", async () => {
    view.openPopup({
      location: {longitude: points[index].longitude, latitude: points[index].latitude},
      title: points[index].name
    });

    view.goTo(pointGraphic);

  });

  resultPanel.appendChild(infoDiv);
  };
}

async function estadistica(placepoint) {
  
  switch (placepoint) {
    case "30000":

    data = {
      labels: ['Si'],
      datasets: [
        {
        label : 'Si',
        data: [1],
        backgroundColor: ['rgba(0, 150, 255, 0.2)'],
        borderColor: ['rgb(0, 150, 255)',]
        },
        {
        label : 'No',
        data: [1],
        backgroundColor: ['rgba(122, 129, 255, 0.2)'],
        borderColor: ['rgb(122, 129, 255)',]
        },
        {
        label : 'Otra',
        data: [1],
        backgroundColor: ['rgba(98, 95, 95, 0.2)'],
        borderColor: ['rgb(98, 95, 95)']
        }
      ]
    };

            break;
    case "31000":
            
            data = {
              labels: "V",
              datasets: [
                {
                  label: 'No',
                  data: [1],
                  backgroundColor: ['rgba(122, 129, 255, 0.2)'],
                  borderColor: ['rgb(122, 129, 255)',]
                },
                {
                  label: 'Otra',
                  data: [1],
                  backgroundColor: ['rgba(98, 95, 95, 0.2)'],
                  borderColor: ['rgb(98, 95, 95)']
                },
              ]
            };
            
            break;
    case "32000":

            data = {
              labels: "V",
              datasets: [
                {
                  label: 'Si',
                  data: [3],
                  backgroundColor: ['rgba(0, 150, 255, 0.2)'],
                  borderColor: ['rgb(0, 150, 255)',]
                },
                {
                  label: 'Otra',
                  data: [1],
                  backgroundColor: ['rgba(98, 95, 95, 0.2)'],
                  borderColor: ['rgb(98, 95, 95)']
                },
              ]
            };

            break;
    case "33000":
            
            data = {
              labels: "V",
              datasets: [
                {
                  label: 'Si',
                  data: [1],
                  backgroundColor: ['rgba(0, 150, 255, 0.2)'],
                  borderColor: ['rgb(0, 150, 255)',]
                }
              ]
            };

            break;  
    default:

      data = {
        labels: "",
        datasets: []
      };
      break;
  }

  myChart.data = data;
  myChart.update();
}

view.when(()=> {
    console.log('view ready');
});