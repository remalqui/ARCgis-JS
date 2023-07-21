import ArcGISMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Config from "@arcgis/core/config";
import Graphic from "@arcgis/core/Graphic";
import * as locator from "@arcgis/core/rest/locator.js";
import WebStyleSymbol from "@arcgis/core/symbols/WebStyleSymbol";

Config.apiKey = 'AAPK5e0a32880aae4a70a5dc38877ee2846e7o3jkkVClLIrbPdDakzoq7B3_SjkF9FedMbVnCjcS-ealECOVG9ReuAr9EeSmVEL';

const map = new ArcGISMap ({
    basemap: 'arcgis-streets-relief'
});

const view = new MapView({
    map,
    container: 'viewDiv',
    center: [-77.04301962312141,-12.080953842541925],
    zoom: 18
});

const serviceUrl = "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer";

const params = {
    address : {
        "address": "Jirón Dante 724, Surquillo"
    }
}

locator.addressToLocations(serviceUrl, params).then((results) => {
    view.when(()=> {
        showResult(results);
    });
});

 function showResult(results) {
    if (results.length) {
        const result = results[0];
        const resultSymbol = new WebStyleSymbol({
            name: "star-1",
            styleName : "Esri2DPointSymbolsStyle"
        });
        const resultGraphic = new Graphic({
            symbol : resultSymbol,
            geometry : result.location,
            attributes : {
                title: "Address",
                address: result.address
            },
            popupTemplate: {
                title : "{title}",
                content: result.address + "<br><br>" + result.location.longitude.toFixed(5) + "," + result.location.latitude.toFixed(5)
            }
        });
        view.graphics.add(resultGraphic);
        view.goTo({
            target: resultGraphic,
            zoom:18
        }).then(function(){
            view.popup.open({
                features: [resultGraphic],
                location: resultGraphic.geometry
            });
        });
    }
 };

/* view.when(()=> {
    console.log('view ready');
}); */