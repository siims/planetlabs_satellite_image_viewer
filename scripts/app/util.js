define(function(require) {
	return {
		truncate_lnglat: function(lng, lat) {
			if (lng > 180.0) {
				lng = 180.0;
			} else if (lng < -180.0) {
				lng = -180.0;
			}
			if (lat > 90.0) {
				lat = 90.0;
			} else if (lat < -90.0) {
				lat = -90.0;
			}
			return [lng, lat]
		},

		degToRad: function(degrees) {
			return degrees * (Math.PI / 180);
		},

		// math obtained from here: http://gis.stackexchange.com/questions/180152/how-to-determine-scene-tiles-x-y-and-z-on-tile-server
		getTileCoordinates: function(lng, lat, zoom, truncate) {
			// Returns the (x, y, z) tile
			if (truncate !== undefined && truncate === true) {
				lng, lat = this.truncate_lnglat(lng, lat);
			}
			lat = this.degToRad(lat);
			n = Math.pow(2.0, zoom);
			try {
				xtile = Math.round(Math.floor((lng + 180.0) / 360.0 * n));
				ytile = Math.round(Math.floor((1.0 - Math.log(Math.tan(lat) + (1.0 / Math.cos(lat))) / Math.PI) / 2.0 * n));
			} catch (err) {
				console.log("Tile conversion had an error: '" + err + "'");
				xtile = 0;
				ytile = 0;
			}
			return [xtile, ytile, zoom];
		},

		getSceneIds: function(sceneList) {
			var sceneIds = [];
			sceneList.data.features.forEach(function(scene) {
				sceneIds.push(scene.id);
			});
			return sceneIds;
		},

		setViewportImage: function(url) {
			$("#image")[0].style.backgroundImage = "url(" + url + ")";
		},

		preload: function(url) {
			var img = new Image();
			img.src = url;
		}
	}
});