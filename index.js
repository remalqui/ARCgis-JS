import ArcGISMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import config from '@arcgis/core/config';
import Graphic from '@arcgis/core/Graphic';
import {solve} from '@arcgis/core/rest/route';
import RouteParameters from '@arcgis/core/rest/support/RouteParameters';
import FeatureSet from '@arcgis/core/rest/support/FeatureSet';

config.apiKey = 'AAPK5e0a32880aae4a70a5dc38877ee2846e7o3jkkVClLIrbPdDakzoq7B3_SjkF9FedMbVnCjcS-ealECOVG9ReuAr9EeSmVEL';

const routeUrl = 'https://route-api.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World';

const map = new ArcGISMap ({
    basemap: 'osm-standard-relief'
});

const view = new MapView({
    map,
    container: 'viewDiv',
    center: [-77.04301962312141,-12.080953842541925],
    zoom: 18
});

view.on('click', ({mapPoint}) => {
    if (!view.graphics.length) {
        view.graphics.add(addGraphic('origin', mapPoint));
    } 
    else if (view.graphics.length == 1) {
        view.graphics.add(addGraphic('destination', mapPoint));
        const stops = new FeatureSet({
            features : view.graphics.toArray()
        });
        getRoute(stops);
    }
    else{
        view.graphics.removeAll();
        view.graphics.add(addGraphic('origin', mapPoint));
    }
});


function addGraphic(type, geometry) {
    const graphic = new Graphic({
        geometry,
        symbol:{
            type: 'simple-marker',
            color: (type == 'origin') ? 'blue' : 'red',
            size: '10px'
        }
    });
    return graphic;
}

async function getRoute(stops){
    const routeParams = new RouteParameters({stops});
    const {routeResults} = await solve(routeUrl, routeParams);
    routeResults.forEach((result) => {
        result.route.symbol = {
            type: 'simple-line',
            color: [5,150,255],
            width: 3
        };
        view.graphics.add(result.route);
    });
}

view.when(()=> {
    console.log('view ready');
});