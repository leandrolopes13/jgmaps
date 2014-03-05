(function($){

    var settings;
    var map;
    var markers = [];
    var polylineMarkers = [];
    var polylineList = false;
    var geocoder = false;
    var methods = {
        init: function(options){
            settings = $.extend({}, $.fn.jgmaps.defaults, options);
            settings.UI = $.extend({}, $.fn.jgmaps.defaults.UI, options);
            settings.markers.polyline = $.extend({}, $.fn.jgmaps.defaults.markers.polyline, options);
            google.maps.event.addDomListener(window, 'load', initMap.apply(this));
        },
        hidePolyline: function(){
            if(polylineList){
                polylineList.setMap(null);
                return true;
            }else{
                return false;
            }
        },
        showPolyline: function(){
            if(polylineList){
                polylineList.setMap(map);
                return true;
            }else{
                return false;
            }
        },
        deletePolyline: function(){
            methods.hidePolyline();
            polylineList = false;
            if(markers.length == 0){
                return true;
            }else{
                return false;
            }
        },
        hideMarkers: function(){
            if(markers.length > 0){
                for(var i=0;i<markers.length;i++){
                    markers[i].setMap(null);
                }
                if(polylineMarkers){
                    polylineMarkers.setMap(null);
                }
                return true;
            }else{
                return false;
            }
        },
        showMarkers: function(){
            for(var i=0;i<markers.length;i++){
                markers[i].setMap(map);
            }
            if(polylineMarkers){
                polylineMarkers.setMap(map);
            }
            return true;
        },
        deleteMarkers: function(){
            methods.hideMarkers();
            markers = [];
            polylineMarkers = false;
            if(markers.length == 0){
                return true;
            }else{
                return false;
            }
        },
        doGeocode: function(value){
            if(value.constructor == String){
                value = {'address': value};
                geocoding(value);
            }else if(value.constructor == Object){
                if(value.lat && value.lon){
                    value = {'latLng': new google.maps.LatLng(value.lat, value.lon)};
                    geocoding(value);    
                }
            }
        }
    };

    function geocoding(forcedValue){
        geocoder = new google.maps.Geocoder();
        var query;
        if(forcedValue != undefined){
            query = forcedValue;
        }else if(settings.geocoder.address){
            query = {'address': settings.geocoder.address};
        }else{
            query = {'latLng': new google.maps.LatLng(settings.geocoder.point.lat, settings.geocoder.point.lon)};
        }
        geocoder.geocode(query, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                map.setCenter(results[0].geometry.location);
                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    }

    function geolocationHtml5(){
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(position) {
                var point = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                if(settings.geolocationHtml5.infowindow){
                    var infowindow = new google.maps.InfoWindow({
                        map: map,
                        position: point,
                        content: settings.geolocationHtml5.infowindow.text
                    });
                }
                map.setCenter(point);
            }, function() {
              $.error("The Geolocation service failed.");
          });
        }else{
            $.error("Your browser don't support Geolocation HTML5.");
        }
    }

    function setMarkers(marker){
        if(marker.points instanceof Array){
            var latlngbounds = new google.maps.LatLngBounds();
            var markerObj;
            var infowindow = new google.maps.InfoWindow();
            if(marker.polyline || marker.polyline.enabled){
                polylineMarkers = [];
            }
            for(var i=0;i<marker.points.length;i++){
                var latlon = new google.maps.LatLng(marker.points[i].lat, marker.points[i].lon)
                markerObj = new google.maps.Marker({
                    position: latlon,
                    title: (marker.points[i].title)?marker.points[i].title:'',
                    html: html
                });
                if(marker.polyline || marker.polyline.enabled){
                    polylineMarkers[i] = latlon;
                }
                markers[i] = markerObj;
                var html = marker.points[i].html;
                if(marker.addTimeout){
                    setTimeout(markers[i].setMap(map),marker.addTimeout);
                }else{
                    markers[i].setMap(map);
                }
                if(marker.points[i].html){
                    google.maps.event.addListener(markerObj, 'click', (function(markerObj, i) {
                        return function() {
                          infowindow.setContent(marker.points[i].html);
                          infowindow.open(map, markerObj);
                        }
                    })(markerObj, i));
                }
                if(marker.animation){
                    markers[i].setAnimation(marker.animation);
                }
                if(marker.draggable){
                    markers[i].setDraggable(true);
                }
                if(marker.points[i].image){
                    markers[i].setIcon(marker.points[i].image);
                }
                latlngbounds.extend(latlon);
            }
            if(markers.length > 0){
                map.fitBounds(latlngbounds);
            }
            if(polylineMarkers.length > 0){
                polylineMarkers = new google.maps.Polyline({
                    path: polylineMarkers,
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });

                polylineMarkers.setMap(map);
            }
        }
    }

    function getControlPosition(control){
        switch(control.position){
            case 'TOP LEFT': return google.maps.ControlPosition.TOP_LEFT;break;
            case 'LEFT TOP': return google.maps.ControlPosition.LEFT_TOP;break;
            case 'TOP CENTER': return google.maps.ControlPosition.TOP_CENTER;break;
            case 'TOP RIGHT': return google.maps.ControlPosition.TOP_RIGHT;break;
            case 'RIGHT TOP': return google.maps.ControlPosition.RIGHT_TOP;break;
            case 'RIGHT CENTER': return google.maps.ControlPosition.RIGHT_CENTER;break;
            case 'LEFT CENTER': return google.maps.ControlPosition.LEFT_CENTER;break;
            case 'BOTTOM LEFT': return google.maps.ControlPosition.BOTTOM_LEFT;break;
            case 'LEFT BOTTOM': return google.maps.ControlPosition.LEFT_BOTTOM;break;
            case 'BOTTOM CENTER': return google.maps.ControlPosition.BOTTOM_CENTER;break;
            case 'BOTTOM RIGHT': return google.maps.ControlPosition.BOTTOM_RIGHT;break;
            case 'RIGHT BOTTOM': return google.maps.ControlPosition.RIGHT_BOTTOM;break;
            default: return google.maps.ControlPosition.TOP_LEFT;break;
        }
    }

    function initMap(){
        var mapOptions = {
            zoom: settings.zoom,
            center: new google.maps.LatLng(settings.center.lat, settings.center.lon),
            panControl: settings.UI.panControl.enabled,
            panControlOptions: {
                position: getControlPosition(settings.UI.panControl)
            },
            zoomControl: settings.UI.zoomControl.enabled,
            zoomControlOptions: {
                style: settings.UI.zoomControl.style,
                position: getControlPosition(settings.UI.zoomControl)
            },
            scaleControl: settings.UI.scaleControl.enabled,
            scaleControlOptions: {
                position: getControlPosition(settings.UI.scaleControl)
            },
            mapTypeControl: settings.UI.mapTypeControl.enabled,
            mapTypeControlOptions: {
                style: settings.UI.mapTypeControl.style,
                position: getControlPosition(settings.UI.mapTypeControl)
            },
            streetViewControl: settings.UI.streetViewControl.enabled,
            streetViewControlOptions: {
                position: getControlPosition(settings.UI.streetViewControl)
            },
            overviewMapControl: settings.UI.overviewMapControl.enabled,
            overviewMapControlOptions: {
                opened: settings.UI.overviewMapControl.opened
            },
            rotateControl: settings.UI.rotateControl.enabled,
            rotateControlOptions: {
                position: getControlPosition(settings.UI.rotateControl)
            }
        };
        if(this.length > 0){
            map = new google.maps.Map(this[0], mapOptions);
            this.width(settings.container.width);
            this.height(settings.container.height);

            if(settings.geolocationHtml5.enabled){
                geolocationHtml5.apply(this);
            }

            if(settings.markers.points){
                setMarkers(settings.markers)
            }

            if(settings.polyline.points){
                setPolyline(settings.polyline)
            }

            if(settings.geocoder.point || settings.geocoder.address){
                geocoding();
            }
        }
    }
        
    function setPolyline(polyline){
        if(polyline.points.length > 0){
            polylineList = [];
            var latlngbounds = new google.maps.LatLngBounds();
        }
        for(var i=0;i<polyline.points.length;i++){
            var latlon = new google.maps.LatLng(polyline.points[i].lat, polyline.points[i].lon)
            polylineList[i] = latlon;
            latlngbounds.extend(latlon);
        }
        if(polylineList.length > 0){
            polylineList = new google.maps.Polyline({
                path: polylineList,
                geodesic: polyline.geodesic,
                strokeColor: polyline.strokeColor,
                strokeOpacity: polyline.strokeOpacity,
                strokeWeight: polyline.strokeWeight
            });

            polylineList.setMap(map);
            map.fitBounds(latlngbounds);
        }
    }

    $.fn.jgmaps = function(methodOrOptions) {
        if (methods[methodOrOptions]){
            return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
        }else if(typeof methodOrOptions === 'object' || !methodOrOptions){
            return methods.init.apply(this, arguments);
        }else{
            $.error('Method ' +  methodOrOptions + ' does not exist on jQuery.jgmaps.');
        }    
    };

    $.fn.jgmaps.defaults = {
        container: {
            width: 500,
            height: 500
        },
        zoom: 8,
        center: {
            lat: -34.397,
            lon: 150.644
        },
        geolocationHtml5: {
            enabled: false,
            infowindow: {
                text: 'Você está aqui.'
            }
        },
        UI: {
            panControl: {
                enabled: true,
                position: 'TOP LEFT'
            },
            zoomControl: {
                enabled: true,
                style: google.maps.ZoomControlStyle.DEFAULT,
                position: 'LEFT TOP'
            },
            mapTypeControl: {
                enabled: true,
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: 'TOP RIGHT'
            },
            scaleControl: {
                enabled: true,
                position: 'BOTTOM RIGHT'
            },
            streetViewControl: {
                enabled: true,
                position: 'LEFT TOP'
            },
            overviewMapControl: {
                enabled: false,
                opened: false
            },
            rotateControl: {
                enabled: false,
                position: 'BOTTOM LEFT'
            }
        },
        markers: {
            addTimeout: false,
            animation: false,
            draggable: false,
            points: [],
            polyline: {
                enabled: false,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2
            }
        },
        polyline: {
            points: [],
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2
        },
        geocoder: {
            point: false,
            address: false
        }
    };

})(jQuery);