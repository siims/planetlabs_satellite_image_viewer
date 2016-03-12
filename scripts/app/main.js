define(function(require) {

	require("jquery");
	var planet = require("planet");

	var util = require("app/util");
	var plApi = require("app/sceneloader");

	planet.auth.setKey("PL_API_KEY");

	var nextScenelistLink;
	var prevScenelistLink;

	// hide for initialization time
	$("#preButton").hide();
	$("#nextButton").hide();

	// options:
	// TODO: need to filter scenes
	var maxCloudCover = 10; //%

	function updateNextPrevLinkValues(sceneList, onlyPrev, onlyNext) {
		if (onlyNext) {
			nextScenelistLink = plApi.addApiKey(sceneList.links.prev); // api prev is actually forward in time
		} else if (onlyPrev) {
			prevScenelistLink = plApi.addApiKey(sceneList.links.next); // api next is actually further in the past
		} else {
			nextScenelistLink = plApi.addApiKey(sceneList.links.prev); // api prev is actually forward in time
			prevScenelistLink = plApi.addApiKey(sceneList.links.next); // api next is actually further in the past
		}
	}

	function loadScene(sceneList, prev) {
		if (prev) {
			updateNextPrevLinkValues(sceneList, true);
		} else {
			updateNextPrevLinkValues(sceneList, false, true);
		}

		sceneList.features.forEach(function(featureObj) {

			var feature = plApi.sceneToGeoJsonFeature(featureObj);
			var url = plApi.loadFeatureImageUrl(feature);

			var image = new Image();
			image.src = url;

			image.onload = function() {
				if (prev) {
					addFeatureImageToFlow(feature, true);
				} else {
					addFeatureImageToFlow(feature);
				}
			};
		});
	}

	function loadNextImages(prev) {
		var currentUrl;
		if (prev) {
			currentUrl = prevScenelistLink;
		} else {
			currentUrl = nextScenelistLink;
		}
		plApi.getSceneList(function(sceneList) {
			loadScene(sceneList, prev);
		}, currentUrl);
	}

	function loadPrevImages() {
		loadNextImages(true);
	}

	function addImageToFlow(url, toFirst, title) {
		var image;
		if (title !== undefined) {
			image = $("<img class='content' src='" + url + "' title='" + title + "'/>")[0];
		} else {
			image = $("<img class='content' src='" + url + "'/>")[0];
		}
		if (toFirst) {
			sceneFlow.addItem(image, 'first');
		} else {
			sceneFlow.addItem(image, 'last');
		}
	}

	function addFeatureImageToFlow(feature, toFirst) {
		addImageToFlow(plApi.loadFeatureImageUrl(feature), toFirst, feature.id_);
	}

	var imagePreloadingThreshold = 10;

	function loadNewScenesIfNeeded(targetPosition, numOfItems) {
		if (targetPosition < imagePreloadingThreshold) {
			loadPrevImages();
		}
		if (numOfItems !== undefined && targetPosition > numOfItems - (1 + imagePreloadingThreshold)) {
			loadNextImages();
		}
	}

	var sceneFlow = new ContentFlow("sceneImageFlow", {
		reflectionHeight: 0,
		circularFlow: false,
		verticalFlow: false,
		scaleFactor: 5,
		scaleFactorLandscape: 0.33,
		startItem: 'first',
		visibleItems: -1, // doesn't seems to work normally if value isn't -1
		endOpacity: 1.0,
		biggestItemPos: "last",
		maxItemHeight: window.innerHeight,
		fixItemSize: true,
		flowDragFriction: 0.0, // drag switched off
		scrollWheelSpeed: 0.0, // scroll switched off
		flowSpeedFactor: 0.6,

		onclickActiveItem: function(item) {},

		onclickInactiveItem: function(item) {
			loadNewScenesIfNeeded(this._targetPosition, this.getNumberOfItems());

			if (this._targetPosition < 1) {
				$(".preButton").hide();
			} else if (this._targetPosition > this.getNumberOfItems() - 1) {
				$(".nextButton").hide();
			} else {
				$(".nextButton").show();
				$(".preButton").show();
			}

		},

		onclickPreButton: function(event) {

			loadNewScenesIfNeeded(this._targetPosition, this.getNumberOfItems());
			$(".nextButton").show();

			if (this._targetPosition === 0) {
				$(".preButton").hide();
				return;
			} else if (this._targetPosition === 1) {
				$(".preButton").hide();
			}

			this.moveToIndex('pre');
			return Event.stop(event);
		},

		onclickNextButton: function(event) {

			loadNewScenesIfNeeded(this._targetPosition, this.getNumberOfItems());
			$(".preButton").show();

			if (this._targetPosition === this.getNumberOfItems() - 1) {
				$(".nextButton").hide();
				return;
			} else if (this._targetPosition === this.getNumberOfItems() - 2) {
				$(".nextButton").hide();
			}

			this.moveToIndex('next');
			return Event.stop(event);
		}
	});
	sceneFlow.init();


	(function init() {
		var oldestAcquireDate = new Date(2015, 9, 21, 0, 0, 0, 0).toISOString();

		function populateFeatureListAndLoadFirstImage(sceneList) {
			updateNextPrevLinkValues(sceneList);

			// load images so flow's active element will be on the center
			loadScene(sceneList);
			loadPrevImages();

			setTimeout(function() { // preload some additionally
				loadNextImages();
				loadPrevImages();
			}, 500);
		}
		plApi.getSceneListFromMiddlePage(oldestAcquireDate, populateFeatureListAndLoadFirstImage);
	})();
});