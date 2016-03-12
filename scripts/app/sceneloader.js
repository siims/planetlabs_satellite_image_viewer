define(function(require) {
	var planet = require("planet");
	var util = require("app/util");
	var ol = require("ol-debug");

	return {
		addApiKey: function(url) {
			if (url === null) {
				return "";
			}
			if (url.indexOf("?") === -1) {
				return url + "?api_key=" + planet.auth.getKey();
			}
			return url + "&api_key=" + planet.auth.getKey();
		},

		getSceneList: function(callback, fullUrl) {
			if (fullUrl !== undefined) {
				$.ajax({
					url: fullUrl,
					type: 'GET',
					beforeSend: function(xhr) {
						xhr.setRequestHeader('Authorization', 'api-key ' + planet.auth.getKey());
					},
					success: function(listOfScenes) {
						console.log("Loaded list of " + listOfScenes.features.length + " scenes.");
						console.log(listOfScenes)
						callback(listOfScenes);
					},
					error: function(XMLHttpRequest, textStatus, errorThrown) {
						alert("Couldn't reach api.");
					}
				});
				return;
			}
			planet.scenes.search({
					type: 'ortho',
					"count": 5
				})
				.then(function(listOfScenesPage) {
					var listOfScenes = listOfScenesPage.data;
					console.log("Loaded list of " + listOfScenes.features.length + " scenes.");
					console.log(listOfScenes);
					callback(listOfScenes);
				}).catch(function(err) {
					console.error('Failed to fetch list of scenes:', err.message);
				});
		},

		getSceneListFromMiddlePage: function(date, callback) { // currently middle defined by date
			planet.scenes.search({
					type: 'ortho',
					"count": 5,
					"_page.acquired.lt": date
				})
				.then(function(listOfScenesPage) {
					var listOfScenes = listOfScenesPage.data;
					console.log("Loaded list of " + listOfScenes.features.length + " scenes.");
					console.log(listOfScenes);
					callback(listOfScenes);
				}).catch(function(err) {
					console.error('Failed to fetch list of scenes:', err.message);
				});
		},

		getSceneImage: function(sceneId, callback) {
			planet.scenes.get(sceneId)
				.then(function(scene) {
					console.log("Loaded scene with id:", sceneid);
					console.log(scene);
					callback(scene);
				})
				.catch(function(err) {
					console.error('Failed to fetch scene:', err.message);
				});
		},

		loadFeatureImageUrl: function(feature) {

			var extent = feature.getGeometry().getExtent();

			var center = ol.extent.getCenter(extent);
			center = ol.proj.toLonLat([center[0], center[1]], 'EPSG:3857');
			var xyz = util.getTileCoordinates(center[0], center[1], 14); // option zoom level

			var url = this.addApiKey("https://tiles.planet.com/v0/scenes/ortho/" + feature.getId() + "/" + xyz[2] + "/" + xyz[0] + "/" + xyz[1] + ".png");
			return url;
		},

		sceneToGeoJsonFeature: function(scene) {
			var geoJSONFormat = new ol.format.GeoJSON();
			return geoJSONFormat.readFeature(scene, {
				featureProjection: 'EPSG:3857'
			});
		},

		addToFeatureList: function(sceneList, featureList) {
			var that = this;
			sceneList.features.forEach(function(scene) {
				var feature = that.sceneToGeoJsonFeature(scene);
				featureList.push(feature);
			});
		}
	};
});