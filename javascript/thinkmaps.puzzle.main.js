// define the class namespace
var puzzle = puzzle || thinkmaps.namespace("thinkmaps.puzzle");

// This is a singleton
puzzle.main = (function () {


    // Globals
    var siteStructur = {
            "header":{ "id":"header", "height":125 },
            "sidebar":{ "id":"sidebar", "width":420, "position":"right" },
            "content":{ "id":"content" }
        },
        map,
        featureLayer,
        currentImage,
        successCount = 0,
        startTime = null,
        timeTimer,
        countryCount = 0,
        language = "en",
        timeString = "00:00";

    language = thinkmaps.localization.getCurrentLanguage();

    dojo.require("esri.map");
    dojo.require("esri.arcgis.utils");

    // Public methods
    return {

        onBodyLoad:function () {

            thinkmaps.htmltemplates.headerSidebar.initialize(siteStructur);
            var countries = new thinkmaps.puzzle.countries().getCountries();
            countryCount = countries.length;
            _initCountryTable(countries);

            esri.arcgis.utils.arcgisUrl = "http://www.arcgis.com/sharing/content/items";

            var mapDeferred = esri.arcgis.utils.createMap("0feb64231f274bc2b94022b699f9d798", "content");					       
		
            mapDeferred.addCallback(function (response) {
                map = response.map;
                dojo.connect(map, "onExtentChange", function (extent) {
                    if (map.getLevel() < 2) map.setLevel(2);
                    if (map.getLevel() > 6) map.setLevel(6);
                });
                
				var layers = response.itemInfo.itemData.operationalLayers;
				
                countryLayer = layers[1];												
                features = countryLayer.featureCollection.layers[0].featureSet.features;				
				
                featureLayer = countryLayer.featureCollection.layers[0].layerObject;
                thinkmaps.htmltemplates.headerSidebar.setMap(map);
            });

            mapDeferred.addErrback(function (error) {
                console.log("Map creation failed: ", dojo.toJson(error));
            });

            var node = dojo.byId("content");

            dojo.connect(node, "dragenter", function (evt) {
                evt.preventDefault();
            });
            dojo.connect(node, "dragover", function (evt) {
                evt.preventDefault();
            });
            dojo.connect(node, "drop", _handleDrop);


        },

        setImage:function (image) {
            currentImage = image;
        },
        getImage:function () {
            return currentImage;
        },
        updateTimer:function () {
            if (startTime === null) {
                startTime = new Date();
                timeTimer = setInterval(_updateTimer, 1000);
            }
            successCount++;
            if (successCount == countryCount) {
                clearInterval(timeTimer);
                var div = document.getElementById("time");
                div.style.color = "#FFFF00";
                document.getElementById("time").innerHTML = thinkmaps.puzzle.localization.get("CONGRATULATION", language) + timeString;
            }
        }
    };

    // Private methods
    function _updateTimer() {
        var nowTime = new Date();
        var difference = Math.ceil((nowTime.getTime() - startTime.getTime()) / 1000);
        var minutes = Math.ceil(difference / 60) - 1;
        var seconds = difference % 60;
        if (minutes <= 9) {
            minutes = "0" + String(minutes)
        }
        if (seconds <= 9) {
            seconds = "0" + String(seconds)
        }
        timeString = timeString = minutes + ":" + seconds;
        document.getElementById("time").innerHTML = thinkmaps.puzzle.localization.get("TIME", language) + timeString;
    }

    function _initCountryTable(countries) {
        var t = "";
        t = t + "<div><table>";
        var internalCounter = 0;

        for (var i = 0; i < countries.length; i++) {

            if (i % 4 == 0) {
                t = t + "<tr>";
            }
            var iso = countries[i].iso;
            var name;
            name = countries[i][language];

            t = t + "<td><img src='images/" + iso + ".png' id='" + iso + "' onmousedown='thinkmaps.puzzle.main.setImage(this)' title='" + name + "'></td>";
            internalCounter++;

            if (internalCounter == 4) {
                t = t + "</tr>";
                internalCounter = 0;
            }
        }
        t = t + "</table></div>";
        document.getElementById("sidebar").innerHTML = t;
    }

    function _handleDrop(evt) {
        if (evt.stopPropagation) {
            evt.stopPropagation(); // Stops some browsers from redirecting.
        }

        var point = map.toMap(new esri.geometry.Point(evt.clientX - map.position.x, evt.clientY - map.position.y));
        for (i = 0; i < features.length; i++) {
            var feature = features[i];
            var poly = feature.geometry;
            var polygon = new esri.geometry.Polygon();
            polygon.rings = poly.rings;

            if (polygon.contains(point)) {
                var isoCode = feature.attributes["ISO_A2"];
                if (isoCode.toLowerCase() == thinkmaps.puzzle.main.getImage().id.toLowerCase()) {
                    featureLayer.setEditable(true);
                    featureLayer.applyEdits(null, null, [feature]);
                    thinkmaps.puzzle.main.getImage().style.backgroundSize = "100%";
                    thinkmaps.puzzle.main.getImage().style.backgroundImage = "url(" + thinkmaps.puzzle.main.getImage().src + ")";
                    thinkmaps.puzzle.main.getImage().style.opacity = 0.6;
                    thinkmaps.puzzle.main.getImage().src = "images/right.png";
                    thinkmaps.puzzle.main.updateTimer();
                }
            }
        }
        evt.preventDefault();
        return false;
    }


})();