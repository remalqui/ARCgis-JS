import ArcGISMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import config from '@arcgis/core/config';
import Graphic from '@arcgis/core/Graphic.js';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import Search from "@arcgis/core/widgets/Search.js";
import Point from "@arcgis/core/geometry/Point.js";

config.apiKey = 'AAPK5e0a32880aae4a70a5dc38877ee2846e7o3jkkVClLIrbPdDakzoq7B3_SjkF9FedMbVnCjcS-ealECOVG9ReuAr9EeSmVEL';

const map = new ArcGISMap ({
    basemap: 'arcgis-navigation'
});

const view = new MapView({
    map,
    container: 'viewDiv',
    center: [-77.033695, -12.065190],
    zoom: 15
});

 const search = new Search({  //Add Search widget
    container: 'searchDiv'
  });

 const punto = new Point({
    x : 0,
    y : 0,
    z : undefined
 });

 var paths = [];

  search.on('search-complete', function(result){
    if(result.results && result.results.length > 0 && result.results[0].results && result.results[0].results.length > 0){
      punto.copy(result.results[0].results[0].feature.geometry);
      //puntos.insertPoint(0,1,punto);

      if (paths.length == 0) {
         paths[0] = [
            punto.longitude, punto.latitude
         ];
     } else if (paths.length > 0) {
          paths[paths.length] = [
             punto.longitude, punto.latitude
          ];
       } ;

      console.info(paths);

      /**********************************************************/
      const graphicsLayer = new GraphicsLayer();
      map.add(graphicsLayer);

       const simpleMarkerSymbol = {
          type: "simple-marker",
          color: [226, 119, 40],  // Orange
          outline: {
          color: [255, 255, 255], // White
          width: 3
          }
       };

       const pointGraphic = new Graphic({
         geometry: punto,
         symbol: simpleMarkerSymbol
       });

        graphicsLayer.add(pointGraphic);

      if (paths.length > 1)
      {
       // Create a line geometry
       const polyline = {
          type: "polyline",
          paths: paths
       };
       const simpleLineSymbol = {
          type: "simple-line",
          color: [226, 119, 40], // Orange
          width: 3
       };
      
       const polylineGraphic = new Graphic({
          geometry: polyline,
          symbol: simpleLineSymbol
       });
       graphicsLayer.add(polylineGraphic);
      };
      /**********************************************************/

    };
  });

  view.ui.add(search, "top-right");

view.when(()=> {
    console.log('view ready');
});