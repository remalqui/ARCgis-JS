import ArcGISMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';

const map = new ArcGISMap ({
    basemap: 'topo-vector'
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