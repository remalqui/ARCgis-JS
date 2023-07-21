import ArcGISMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import config from "@arcgis/core/config";

config.apiKey = 'AAPK5e0a32880aae4a70a5dc38877ee2846e7o3jkkVClLIrbPdDakzoq7B3_SjkF9FedMbVnCjcS-ealECOVG9ReuAr9EeSmVEL';

const map = new ArcGISMap ({
    basemap: 'osm-standard-relief'
});

const view = new MapView({
    map,
    container: 'viewDiv',
    center: [-77.04301962312141,-12.080953842541925],
    zoom: 18
});

view.when(()=> {
    console.log('view ready');
});