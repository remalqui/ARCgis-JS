import MapView from '@arcgis/core/views/MapView';
import configKey from '@arcgis/core/config';
import Graphic from '@arcgis/core/Graphic.js';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import Chart from 'chart.js/auto';
import BasemapGallery from "@arcgis/core/widgets/BasemapGallery.js";
import LayerList from "@arcgis/core/widgets/LayerList.js";
import WebMap from "@arcgis/core/WebMap.js";
import Expand from "@arcgis/core/widgets/Expand.js";
import SceneView from "@arcgis/core/views/SceneView.js";
import WebScene from "@arcgis/core/WebScene.js";
//borrar lo de abajo
import * as locator from "@arcgis/core/rest/locator.js";
import Measurement from "@arcgis/core/widgets/Measurement.js";
import Point from "@arcgis/core/geometry/Point.js";
import * as webMercatorUtils from "@arcgis/core/geometry/support/webMercatorUtils.js";


//############ Inicio ################# Variables #############################//
//#############################################################################//
configKey.apiKey = 'AAPK5e0a32880aae4a70a5dc38877ee2846e7o3jkkVClLIrbPdDakzoq7B3_SjkF9FedMbVnCjcS-ealECOVG9ReuAr9EeSmVEL';
let infoPanel;
let activeCategory = "0";  // categoria del vendor
let activeCategory1 = "0"; // categoria de la fecha
let activeCategory2 = "0"; // Categoria para mostrar las rutas
const serviceUrl = "http://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

let parametros = {
      location:{
      spatialReference: {
        wkid: 102100
      },
      x: -8575565.214488855,
      y: -1354558.2905600208
     }
    };

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
const flow = document.getElementById("flow");
var acquisitions = document.getElementById('acquisitions');


//############## Inicio ############### Configuracion para 3D #############################//
const switchButton = document.getElementById("switch-btn");

const appConfig = {
  mapView: null,
  sceneView: null,
  activeView: null,
  container: "viewDiv" // use same container for views
};



const initialViewParams = {
  zoom: 14,
  center: [-77.043025 , -12.0809538],
  container: appConfig.container
};

const map = new WebMap({
  basemap: 'streets-navigation-vector',
  layers : [bufferLayer, placesLayer]
});

const scene = new WebScene({
  portalItem: {
    // autocasts as new PortalItem()
    id: "fa4dd90d0bfd470fb0dc9e32eab0bfef"
  }
});
// create 2D view and and set active
appConfig.mapView = createView(initialViewParams, "2d");
appConfig.mapView.map = map;
appConfig.activeView = appConfig.mapView;

// create 3D view, won't initialize until container is set
initialViewParams.container = null;
initialViewParams.map = scene;
appConfig.sceneView = createView(initialViewParams, "3d");

// switch the view between 2D and 3D each time the button is clicked
switchButton.addEventListener("click", () => {
  switchView();
});

function switchView() {
  const is3D = appConfig.activeView.type === "3d";
  const activeViewpoint = appConfig.activeView.viewpoint.clone();

  // remove the reference to the container for the previous view
  appConfig.activeView.container = null;
  
  // Clear any measurements that had been drawn
  clearMeasurements();

  if (is3D) {
    // if the input view is a SceneView, set the viewpoint on the
    // mapView instance. Set the container on the mapView and flag
    // it as the active view
    appConfig.mapView.viewpoint = activeViewpoint;
    appConfig.mapView.container = appConfig.container;
    appConfig.mapView.map.layers.push(bufferLayer, placesLayer);
    appConfig.activeView = appConfig.mapView;

    appConfig.activeView.ui.add(measurement, "bottom-right");
    measurement.view = appConfig.activeView;

    appConfig.activeView.ui.add(layerListExpand,"bottom-left");
    layerList.view = appConfig.activeView;
    layerListExpand.view = appConfig.activeView;

    switchButton.value = "3D";
  } else {
    appConfig.sceneView.viewpoint = activeViewpoint;
    appConfig.sceneView.container = appConfig.container;
    appConfig.sceneView.map.layers.push(bufferLayer, placesLayer);
    appConfig.activeView = appConfig.sceneView;

    appConfig.activeView.ui.add(measurement, "bottom-right");
    measurement.view = appConfig.activeView;

    appConfig.activeView.ui.add(layerListExpand,"bottom-left");
    layerList.view = appConfig.activeView;
    layerListExpand.view = appConfig.activeView;

    switchButton.value = "2D";
  }
}

// convenience function for creating either a 2D or 3D view dependant on the type parameter
function createView(params, type) {
  let view;
  if (type === "2d") {
    view = new MapView(params);
    return view;
  } else {
    view = new SceneView(params);
  }
  return view;
}

//############## Final ############### Configuracion para 3D #############################//

const basemaps = new BasemapGallery({
  view : appConfig.activeView,
  container: document.createElement("div")
});

const layerList = new LayerList({
  view : appConfig.activeView,
  selectionEnabled: true,
  container: document.createElement("div")
});

const layerListExpand = new Expand({
  expandIcon: "layers",
  expandTooltip: "Lista de capas",
  view: appConfig.activeView,
  content: layerList
});

const basemapsExpand = new Expand({
  expandIcon: "basemap",
  expandTooltip: "Lista de mapas",
  view: appConfig.activeView,
  content: basemaps
});

appConfig.activeView.ui.add([layerListExpand,basemapsExpand],"bottom-left");

//############## Inicio ############### Configuracion para las mediciones #############################//

// Create new instance of the Measurement widget
const measurement = new Measurement();

// Set-up event handlers for buttons and click events
const distanceButton = document.getElementById("distance");
const areaButton = document.getElementById("area");
const clearButton = document.getElementById("clear");

distanceButton.addEventListener("click", () => {
  distanceMeasurement();
});
areaButton.addEventListener("click", () => {
  areaMeasurement();
});
clearButton.addEventListener("click", () => {
  clearMeasurements();
});

// Add the appropriate measurement UI to the bottom-right when activated
appConfig.activeView.ui.add(measurement, "bottom-right");
measurement.view = appConfig.activeView;

// Call the appropriate DistanceMeasurement2D or DirectLineMeasurement3D
function distanceMeasurement() {
  const type = appConfig.activeView.type;
  measurement.activeTool =
    type.toUpperCase() === "2D" ? "distance" : "direct-line";
  distanceButton.classList.add("active");
  areaButton.classList.remove("active");
}
// Call the appropriate AreaMeasurement2D or AreaMeasurement3D
function areaMeasurement() {
  measurement.activeTool = "area";
  distanceButton.classList.remove("active");
  areaButton.classList.add("active");
}
// Clears all measurements
function clearMeasurements() {
  distanceButton.classList.remove("active");
  areaButton.classList.remove("active");
  measurement.clear();
}

//############## Final ############### Configuracion para las mediciones #############################//


// Variables para los graficos
var polyline = {
  type : "polyline",
  paths : []
};
var simpleLineSymbol = {
   color: [0, 176, 255],
   type : "simple-line",
   width : 3/* ,
   join : "round",
   style : "solid" */
   };

var points = [];
var data = {
  labels: ['CT'],
  datasets: [
    {
    label : 'Si',
    data: [0],
    backgroundColor: ['rgba(0, 150, 255, 0.2)'],
    borderColor: ['rgb(0, 150, 255)',]
    },
    {
    label : 'No',
    data: [0],
    backgroundColor: ['rgba(122, 129, 255, 0.2)'],
    borderColor: ['rgb(122, 129, 255)',]
    },
    {
    label : 'Otra',
    data: [0],
    backgroundColor: ['rgba(98, 95, 95, 0.2)'],
    borderColor: ['rgb(98, 95, 95)']
    }
  ]
};


const customBar = {
id: 'customBar',
beforeDatasetsDraw(chart,args,pluginOptions){
   const {ctx, config, data, chartArea : {top, bottom, left, right, width, height}, scales : {x,y} } = chart;
   ctx.save();
 
   const datapointArray = data.datasets.map((dataset, index) => {
     return dataset.data[0];
   })


   const accumulate = array => array.map((sum => value => sum+= value)(0));
   const cumulativeSumArray = accumulate(datapointArray);
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
  if (infoPanel) infoPanel.remove();
  clearCanvas();
  polyline.paths.length = 0;
}

// limpia el grafico estadistico
function clearCanvas(){
  //myChart.clear();
  var cty = acquisitions.getContext("2d");
  cty.clearRect(0, 0, acquisitions.width, acquisitions.height);
  //myChart.update();
  //cty.beginPath();  
}

function randomNumbers (numberInput){
 var resultNumber = 0 ;
 resultNumber = Math.floor((Math.random() * 100000000) + 1);
 switch (numberInput) {
  case 8:
    resultNumber = padNumber(resultNumber);
    break;
  case 9:
    resultNumber = 900000000 + resultNumber;
  default:
    break;
 }
 return resultNumber;
}

function padNumber(resultNumber){
  var padResult = resultNumber.toString().padStart(8,'0');
  return padResult;
}

// Listener para el cambio de vendedor
categorySelect.addEventListener("calciteComboboxChange", () => {
  activeCategory = categorySelect.value;
  clearGraphics();
  actualizarCategoria ();
  appConfig.activeView.closePopup();
})

// Listener para el cambio de fecha
categorySelectDate.addEventListener("calciteComboboxChange", () => {
  activeCategory1 = categorySelectDate.value;
  clearGraphics();
  actualizarCategoria ();
  appConfig.activeView.closePopup();
})

// Se setea un valor a un variable de acuerdo a la seleccion de vendedor y fecha
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
          activeCategory2 = "0";
          showPlaces(activeCategory2)
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
          activeCategory2 = "0";
          showPlaces(activeCategory2)
          break;
      }  
      break;
  
    default:
      activeCategory2 = "0";
      showPlaces(activeCategory2)
      break;
}
}

// Sirve para agregarle un icono a los puntos venta
function createWebStyle(color) {
  let textSymbol = {
    type : "text",
    color: color,
    text: "\ue61d",
    font: {
      // autocasts as new Font()
      size: 20,
      family: "CalciteWebCoreIcons"
    }
  }
  return textSymbol;
}

// Get place details and display in the info panel
async function getDetails(elemento2) {

  // Set-up panel on the info for more place information
  infoPanel = document.createElement("calcite-flow-item");
  flow.appendChild(infoPanel);
  infoPanel.heading = elemento2.name;
  infoPanel.description = "Cambio de tecnología : "+elemento2.tecnologia;
  // Pass attributes from each place to the setAttribute() function
  setAttribute("Cliente", "information", elemento2.cliente);
  setAttribute("N. Documento", "license", elemento2.documento);
  setAttribute("Telefono", "mobile", elemento2.telefono);
  setAttribute("Direccion","map-pin",elemento2.direccion);
  setAttribute("Hora Visita", "clock", elemento2.hora);
  // If another place is clicked in the info panel, then close
  // the popup and remove the highlight of the previous feature
  infoPanel.addEventListener("calciteFlowItemBack", async () => {
    appConfig.activeView.closePopup();
  });
}
// Take each place attribute and display on info panel
function setAttribute(heading, icon, validValue) {
  if (validValue) {
    const element = document.createElement("calcite-block");
    element.heading = heading;
    element.description = validValue;
    const attributeIcon = document.createElement("calcite-icon");
    attributeIcon.icon = icon;
    attributeIcon.slot = "icon";
    attributeIcon.scale = "m";
    element.appendChild(attributeIcon);
    infoPanel.appendChild(element);
  }
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
                longitude: -77.03369500000004,
                latitude: -12.065189836065104,
                name : "",
                tecnologia : "Si",
                hora: "08:30 AM",
                cliente: "Allisson Rojas",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[1] = { //Create a point
                type: "point",
                longitude: -77.035019,
                latitude: -12.066749,
                name : "",
                tecnologia : "No",
                hora: "08:42 AM",
                cliente: "David Valle",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[2] = { //Create a point
                type: "point",
                longitude: -77.038007,
                latitude: -12.067325,
                name : "",
                tecnologia : "Si",
                hora: "08:50 AM",
                cliente: "Ricardo Malqui",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[3] = { //Create a point
                type: "point",
                longitude: -77.038067,
                latitude: -12.067855,
                name : "",
                tecnologia : "No-Aplica",
                hora: "08:55 AM",
                cliente: "Francisco Calderon",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[4] = { //Create a point
                type: "point",
                longitude: -77.038942,
                latitude: -12.069893,
                name : "",
                tecnologia : "No-Aplica",
                hora: "09:10 AM",
                cliente: "Aaron Flores",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[5] = { //Create a point
                type: "point",
                longitude: -77.039325,
                latitude: -12.070402,
                name : "",
                tecnologia : "Otra",
                hora: "09:30 AM",
                cliente: "Carlos Salinas",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[6] = { //Create a point
                type: "point",
                longitude: -77.039720,
                latitude: -12.072351,
                name : "",
                tecnologia : "No",
                hora: "09:50 AM",
                cliente: "Flavio Salinas",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[7] = { //Create a point
                type: "point",
                longitude: -77.041058,
                latitude: -12.072144,
                name : "",
                tecnologia : "Otra",
                hora: "10:15 AM",
                cliente: "Isabel Torres",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[8] = { //Create a point
                type: "point",
                longitude: -77.041396,
                latitude: -12.072810,
                name : "",
                tecnologia : "No-Aplica",
                hora: "10:30 AM",
                cliente: "Daniel Suarez",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[9] = { //Create a point
                type: "point",
                longitude: -77.042018,
                latitude: -12.072774,
                name : "",
                tecnologia : "No-Aplica",
                hora: "10:40 AM",
                cliente: "Matías Catalán",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[10] = { //Create a point
                type: "point",
                longitude: -77.044664,
                latitude: -12.072745,
                name : "",
                tecnologia : "Si",
                hora: "11:00 AM",
                cliente: "Antonio Díaz",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[11] = { //Create a point
                type: "point",
                longitude: -77.044822,
                latitude: -12.073002,
                name : "",
                tecnologia : "Si",
                hora: "11:30 AM",
                cliente: "Juan Delgado",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[12] = { //Create a point
                type: "point",
                longitude: -77.045010,
                latitude: -12.073049,
                name : "",
                tecnologia : "No",
                hora: "12:00 PM",
                cliente: "Rodrigo Echeverría",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[13] = { //Create a point
                type: "point",
                longitude: -77.044997,
                latitude: -12.073836,
                name : "",
                tecnologia : "Si",
                hora: "01:30 PM",
                cliente: "Thomas Galdames",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[14] = { //Create a point
                type: "point",
                longitude: -77.045028,
                latitude: -12.075090,
                name : "",
                tecnologia : "Otra",
                hora: "01:40 PM",
                cliente: "Moisés González",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[15] = { //Create a point
                type: "point",
                longitude: -77.045020,
                latitude: -12.075858,
                name : "",
                tecnologia : "No",
                hora: "01:55 PM",
                cliente: "Daniel Gutiérrez",
                documento: "",
                telefono: "",
                direccion: ""
              }
            ];
             break;

    case "31000":

            points = [
              points[0] = { //Create a point
                type: "point",
                longitude: -77.047588,
                latitude: -12.075061,
                name : "",
                tecnologia : "No",
                hora: "08:31 AM",
                cliente: "Benjamín Kuscevic",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[1] = { //Create a point
                type: "point",
                longitude: -77.046033,
                latitude: -12.075140,
                name : "",
                tecnologia : "Otra",
                hora: "08:39 AM",
                cliente: "Felipe Loyola",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[2] = { //Create a point
                type: "point",
                longitude: -77.044316,
                latitude: -12.075162,
                name : "",
                tecnologia : "Si",
                hora: "08:55 AM",
                cliente: "Guillermo Maripán",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[3] = { //Create a point
                type: "point",
                longitude: -77.043947,
                latitude: -12.074847,
                name : "",
                tecnologia : "Si",
                hora: "09:10 AM",
                cliente: "Nayel Sepúlveda",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[4] = { //Create a point
                type: "point",
                longitude: -77.04292,
                latitude: -12.07486,
                name : "",
                tecnologia : "No-Aplica",
                hora: "09:30 AM",
                cliente: "Eugenio Mena",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[5] = { //Create a point
                type: "point",
                longitude: -77.04272,
                latitude: -12.07526,
                name : "",
                tecnologia : "No-Aplica",
                hora: "09:50 AM",
                cliente: "Guillermo Soto",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[6] = { //Create a point
                type: "point",
                longitude: -77.04225,
                latitude: -12.07526,
                name : "",
                tecnologia : "No-Aplica",
                hora: "10:30 AM",
                cliente: "Gabriel Suazo",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[7] = { //Create a point
                type: "point",
                longitude: -77.0417,
                latitude: -12.07524,
                name : "",
                tecnologia : "No",
                hora: "10:42 AM",
                cliente: "Jonathan Villagra",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[8] = { //Create a point
                type: "point",
                longitude: -77.04152,
                latitude: -12.07645,
                name : "",
                tecnologia : "No",
                hora: "10:57 AM",
                cliente: "Williams Alarcón",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[9] = { //Create a point
                type: "point",
                longitude: -77.03982,
                latitude: -12.07619,
                name : "",
                tecnologia : "Si",
                hora: "11:21 AM",
                cliente: "Javier Altamirano",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[10] = { //Create a point
                type: "point",
                longitude: -77.0382,
                latitude: -12.07594,
                name : "",
                tecnologia : "Otra",
                hora: "11:30 AM",
                cliente: "Charles Aránguiz",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[11] = { //Create a point
                type: "point",
                longitude: -77.03805,
                latitude: -12.07697,
                name : "",
                tecnologia : "No-Aplica",
                hora: "11:53 AM",
                cliente: "Lucas Assadi",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[12] = { //Create a point
                type: "point",
                longitude: -77.03678,
                latitude: -12.07683,
                name : "",
                tecnologia : "No-Aplica",
                hora: "12:10 PM",
                cliente: "Alfred Canales",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[13] = { //Create a point
                type: "point",
                longitude: -77.03667,
                latitude: -12.07791,
                name : "",
                tecnologia : "Otra",
                hora: "01:30 PM",
                cliente: "Felipe Chamorro",
                documento: "",
                telefono: "",
                direccion: ""
              }
            ];                       
            break;
    case "32000":

            points = [
              points[0] = { //Create a point
                type: "point",
                longitude: -77.055816,
                latitude: -12.091007,
                name : "",
                tecnologia : "No",
                hora: "08:35 AM",
                cliente: "Jeison Fuentealba",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[1] = { //Create a point
                type: "point",
                longitude: -77.050850,
                latitude: -12.088260,
                name : "",
                tecnologia : "No",
                hora: "08:57 AM",
                cliente: "Arturo Vidal",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[2] = { //Create a point
                type: "point",
                longitude: -77.049648,
                latitude: -12.088438,
                name : "",
                tecnologia : "No-Aplica",
                hora: "09:16 AM",
                cliente: "Maximiliano Guerrero",
                documento: "",
                telefono: "",
                direccion: ""
              },       
              points[3] = { //Create a point
                type: "point",
                longitude: -77.044544,
                latitude: -12.087752,
                name : "",
                tecnologia : "Otra",
                hora: "09:37 AM",
                cliente: "Felipe Méndez",
                documento: "",
                telefono: "",
                direccion: ""
              },       
              points[4] = { //Create a point
                type: "point",
                longitude: -77.044225,
                latitude: -12.089623,
                name : "",
                tecnologia : "No-Aplica",
                hora: "09:52 AM",
                cliente: "Marcelino Núñez",
                documento: "",
                telefono: "",
                direccion: ""
              },       
              points[5] = { //Create a point
                type: "point",
                longitude: -77.04449,
                latitude: -12.08965,
                name : "",
                tecnologia : "Otra",
                hora: "10:06 AM",
                cliente: "Darío Osorio",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[6] = { //Create a point
                type: "point",
                longitude: -77.04438,
                latitude: -12.09058,
                name : "",
                tecnologia : "Si",
                hora: "10:23 AM",
                cliente: "César Pérez",
                documento: "",
                telefono: "",
                direccion: ""
              },       
              points[7] = { //Create a point
                type: "point",
                longitude: -77.04548,
                latitude: -12.09075,
                name : "",
                tecnologia : "No",
                hora: "10:39 AM",
                cliente: "Vicente Pizarro",
                documento: "",
                telefono: "",
                direccion: ""
              },       
              points[8] = { //Create a point
                type: "point",
                longitude: -77.04539,
                latitude: -12.09153,
                name : "",
                tecnologia : "Si",
                hora: "11:30 AM",
                cliente: "Erick Pulgar",
                documento: "",
                telefono: "",
                direccion: ""
              },       
              points[9] = { //Create a point
                type: "point",
                longitude: -77.04528,
                latitude: -12.09227,
                name : "",
                tecnologia : "Si",
                hora: "12:00 PM",
                cliente: "Diego Valdés",
                documento: "",
                telefono: "",
                direccion: ""
              },       
              points[10] = { //Create a point
                type: "point",
                longitude: -77.04639,
                latitude: -12.09244,
                name : "",
                tecnologia : "No-Aplica",
                hora: "01:30 PM",
                cliente: "Julián Alfaro",
                documento: "",
                telefono: "",
                direccion: ""
              },       
              points[11] = { //Create a point
                type: "point",
                longitude: -77.04616,
                latitude: -12.09398,
                name : "",
                tecnologia : "No",
                hora: "01:47 PM",
                cliente: "Alexander Aravena",
                documento: "",
                telefono: "",
                direccion: ""
              },       
              points[12] = { //Create a point
                type: "point",
                longitude: -77.04841,
                latitude: -12.09433,
                name : "",
                tecnologia : "Otra",
                hora: "01:59 PM",
                cliente: "Bruno Barticciotto",
                documento: "",
                telefono: "",
                direccion: ""
              },       
              points[13] = { //Create a point
                type: "point",
                longitude: -77.04815,
                latitude: -12.09632,
                name : "",
                tecnologia : "No-Aplica",
                hora: "02:23 PM",
                cliente: "Ben Diaz",
                documento: "",
                telefono: "",
                direccion: ""
              },       
              points[14] = { //Create a point
                type: "point",
                longitude: -77.04806,
                latitude: -12.09714,
                name : "",
                tecnologia : "No-Aplica",
                hora: "02:37 PM",
                cliente: "Marcos Bolados",
                documento: "",
                telefono: "",
                direccion: ""
              },       
              points[15] = { //Create a point
                type: "point",
                longitude: -77.04799,
                latitude: -12.09753,
                name : "",
                tecnologia : "No",
                hora: "02:49 PM",
                cliente: "Clemente Montes",
                documento: "",
                telefono: "",
                direccion: ""
              },       
              points[16] = { //Create a point
                type: "point",
                longitude: -77.04858,
                latitude: -12.09832,
                name : "",
                tecnologia : "Si",
                hora: "03:00 PM",
                cliente: "Damián Pizarro",
                documento: "",
                telefono: "",
                direccion: ""
              }
            ];                    
            break;
    case "33000":
            
            points = [
              points[0] = { //Create a point
                type: "point",
                longitude: -77.042431,
                latitude: -12.084649,
                name : "",
                tecnologia : "Otra",
                hora: "08:29 AM",
                cliente: "Alexis Sánchez",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[1] = { //Create a point
                type: "point",
                longitude: -77.041985,
                latitude: -12.087816,
                name : "",
                tecnologia : "Si",
                hora: "08:47 AM",
                cliente: "Barry Allen",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[2] = { //Create a point
                type: "point",
                longitude: -77.042510,
                latitude: -12.087948,
                name : "",
                tecnologia : "Otra",
                hora: "09:05 AM",
                cliente: "Iris West-Allen",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[3] = { //Create a point
                type: "point",
                longitude: -77.04265,
                latitude: -12.08811,
                name : "",
                tecnologia : "No-Aplica",
                hora: "09:27 AM",
                cliente: "Catilin Snow",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[4] = { //Create a point
                type: "point",
                longitude: -77.04217,
                latitude: -12.08831,
                name : "",
                tecnologia : "No-Aplica",
                hora: "09:38 AM",
                cliente: "Eddie Thawne",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[5] = { //Create a point
                type: "point",
                longitude: -77.04201,
                latitude: -12.08956,
                name : "",
                tecnologia : "No",
                hora: "09:59 AM",
                cliente: "Cisco Ramon",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[6] = { //Create a point
                type: "point",
                longitude: -77.0417,
                latitude: -12.08953,
                name : "",
                tecnologia : "No",
                hora: "10:16 AM",
                cliente: "Harrison Wells",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[7] = { //Create a point
                type: "point",
                longitude: -77.04163,
                latitude: -12.0902,
                name : "",
                tecnologia : "No",
                hora: "10:30 AM",
                cliente: "Joe West",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[8] = { //Create a point
                type: "point",
                longitude: -77.04082,
                latitude: -12.09009,
                name : "",
                tecnologia : "No-Aplica",
                hora: "10:48 AM",
                cliente: "Wally West",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[9] = { //Create a point
                type: "point",
                longitude: -77.04056,
                latitude: -12.09163,
                name : "",
                tecnologia : "No",
                hora: "11:00 AM",
                cliente: "Clifford DeVoe",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[10] = { //Create a point
                type: "point",
                longitude: -77.03976,
                latitude: -12.0915,
                name : "",
                tecnologia : "No-Aplica",
                hora: "11:23 AM",
                cliente: "Ralph Dibny",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[11] = { //Create a point
                type: "point",
                longitude: -77.03954,
                latitude: -12.09306,
                name : "",
                tecnologia : "Otra",
                hora: "11:37 AM",
                cliente: "Cecile Horton",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[12] = { //Create a point
                type: "point",
                longitude: -77.03863,
                latitude: -12.09293,
                name : "",
                tecnologia : "Otra",
                hora: "11:55 AM",
                cliente: "Nora West-Allen",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[13] = { //Create a point
                type: "point",
                longitude: -77.0386,
                latitude: -12.09315,
                name : "",
                tecnologia : "No-Aplica",
                hora: "12:14 PM",
                cliente: "Orlin Dwyer",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[14] = { //Create a point
                type: "point",
                longitude: -77.03834,
                latitude: -12.09495,
                name : "",
                tecnologia : "No-Aplica",
                hora: "01:33 PM",
                cliente: "Nora Allen",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[15] = { //Create a point
                type: "point",
                longitude: -77.03824,
                latitude: -12.0958,
                name : "",
                tecnologia : "Si",
                hora: "01:51 PM",
                cliente: "Henry Allen",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[16] = { //Create a point
                type: "point",
                longitude: -77.03687,
                latitude: -12.0961,
                name : "",
                tecnologia : "Si",
                hora: "02:14 PM",
                cliente: "Jay Garrick",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[17] = { //Create a point
                type: "point",
                longitude: -77.03572,
                latitude: -12.09644,
                name : "",
                tecnologia : "Si",
                hora: "02:30 PM",
                cliente: "Oliver Queen",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[18] = { //Create a point
                type: "point",
                longitude: -77.03542,
                latitude: -12.09646,
                name : "",
                tecnologia : "No-Aplica",
                hora: "02:45 PM",
                cliente: "Leonard Snart",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[19] = { //Create a point
                type: "point",
                longitude: -77.03495,
                latitude: -12.09578,
                name : "",
                tecnologia : "Si",
                hora: "03:00 PM",
                cliente: "Linda Park",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[20] = { //Create a point
                type: "point",
                longitude: -77.03451,
                latitude: -12.09611,
                name : "",
                tecnologia : "No-Aplica",
                hora: "03:11 PM",
                cliente: "Patty Spivot",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[21] = { //Create a point
                type: "point",
                longitude: -77.03385,
                latitude: -12.0963,
                name : "",
                tecnologia : "Si",
                hora: "03:30 PM",
                cliente: "Jesse Wells",
                documento: "",
                telefono: "",
                direccion: ""
              },
              points[22] = { //Create a point
                type: "point",
                longitude: -77.03394,
                latitude: -12.09703,
                name : "",
                tecnologia : "Si",
                hora: "03:38 PM",
                cliente: "Kamilla Hwang",
                documento: "",
                telefono: "",
                direccion: ""
              }
            ];  
            break;  
    default:
      points.length = 0;
      break;
  }


  //Agregamos los paths a la variable polyline para que pueda graficarse
  for (let j = 0; j < points.length; j++) {
    polyline.paths.push([points[j].longitude, points[j].latitude]);
    
    //Asignamos el numero de cliente
    points[j].name = "PV15072-"+(j+1);
    
    //Asignamos el numero aleatorio de documento
    points[j].documento = randomNumbers(8);

    //Asignamos el numero aleatorio de documento
    points[j].telefono = randomNumbers(9);

    //Asignamos la direccion
    let conversion = webMercatorUtils.lngLatToXY(points[j].longitude, points[j].latitude);

    parametros.location.x = conversion[0];
    parametros.location.y = conversion[1];
  
    locator.locationToAddress(serviceUrl, parametros).then(
      function (response) {
        // Show the address found
        points[j].direccion = response.address;
      },
      function (err) {
        // Show no address found
        points[j].direccion = "No se encontró la dirección.";
      }
    );

 }

    //inicializamos las variables de los totales por categoria
    let ctsi = 0;
    let ctno = 0;
    let ctotra = 0;
  
    //Seleccionamos los puntos que vamos a graficar y actualizamos los valores totales de las categorias
    // de cambio de tecnologia
    let points2= [];
    points.forEach(elemento => {
      switch (elemento.tecnologia) {
        case "Si":
          ctsi = ctsi+1;
          points2.push(elemento);
          break;
  
        case "No":
          ctno = ctno+1;
          points2.push(elemento);
          break;
  
        case "Otra":
          ctotra = ctotra+1;
          points2.push(elemento);
          break;        
        default:
          break;
      }
    });
  
    //Actualizamos las cantidades totales por cambio de tecnologia
    data.datasets[0].data = [ctsi];
    data.datasets[1].data = [ctno];
    data.datasets[2].data = [ctotra];
    config.options.scales.x.max = ctsi +ctno + ctotra;
    myChart.update('active');

  const polylineGraphic = new Graphic({
     geometry: polyline,
     symbol: simpleLineSymbol
  });
  // Agrega el trazo recorrido por las personas
  bufferLayer.graphics.add(polylineGraphic);

  //Aplicando el color del marcador de punto de venta de acuerdo con el cambio de tecnología
  let colorIcon = "#000000";

  points2.forEach(elemento2 => {

    //agregamos lo valores aleatorios para el documento,telefono, idcliente
    switch (elemento2.tecnologia) {
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
        break;
    }

    const pointGraphic = new Graphic({
      geometry: elemento2,
      symbol: createWebStyle(colorIcon)
   });
   // Agrega los puntos de venta
  placesLayer.graphics.add(pointGraphic);

   // Se agrega los nombres de los puntos a una lista
  var infoDiv = document.createElement("calcite-list-item");
  infoDiv.label = elemento2.name;

   // Se agrega un pop-up cuando se presione cada punto de venta.
  infoDiv.addEventListener("click", async () => {
    
    appConfig.activeView.openPopup({
      location: {longitude: elemento2.longitude, latitude: elemento2.latitude},
      title: elemento2.name,
      content: "Hora de visita " +elemento2.hora
    });
    appConfig.activeView.goTo(pointGraphic);
    getDetails(elemento2);
  });
  resultPanel.appendChild(infoDiv);
 }); //aqui termina el for
}

appConfig.activeView.when(()=> {
    console.log('view ready');
});