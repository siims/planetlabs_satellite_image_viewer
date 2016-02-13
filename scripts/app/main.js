define(function(require) {

	require("jquery");
	var planet = require("planet");

	var util = require("app/util");
	var plApi = require("app/sceneloader");

	planet.auth.setKey("PL_API_KEY");

	var featureList = [];
	var currentElementIndex = 0;
	var nextScenelistLink;
	var prevScenelistLink;

	// options:
	// TODO: need to filter it myself
	var maxCloudCover = 10; //%


	$("#beautifulBtn").click(function() {
		$("#beautifulBtn").toggleClass("beautifulSelected");
	});

	function loadCurrentElement() {
		var currentFeature = featureList[currentElementIndex];
		var url = plApi.loadFeatureImageUrl(currentFeature);
		util.setViewportImage(url);
	}

	function updateNextPrevLinkValues(sceneList) {
		nextScenelistLink = plApi.addApiKey(sceneList.links.next);
		prevScenelistLink = plApi.addApiKey(sceneList.links.prev);
	}

	function nextImage() {
		currentElementIndex++;
		loadCurrentElement();
	}
	function prevImage() {
		currentElementIndex--;
		loadCurrentElement();
	}

	function preloadSceneList(sceneList) {
		console.log("Preloading list of scenes")
		sceneList.features.forEach(function(featureObj) {
			var feature = plApi.sceneToGeoJsonFeature(featureObj);
			var url = plApi.loadFeatureImageUrl(feature);
			preload(url);
		});
	}
	
	function preload(url) {
		var img = new Image();
		img.src = url;
	}

	$("#prevBtn").click(function() {
		if (currentElementIndex === 0) {
			return;
		} else if (currentElementIndex === 1) {
			$("#prevBtn").hide();
		}
		prevImage()
	});

	$("#nextBtn").click(function() {
		// TODO: what happens when there aren't any additional images available
		if ((currentElementIndex + 1) === (featureList.length - 10)) { // -10 to execute reload before user is on the last image
			// load more images
			plApi.getSceneList(undefined, nextScenelistLink, function (sceneList) {
				plApi.addToFeatureList(sceneList, featureList);
				updateNextPrevLinkValues(sceneList);
				setTimeout(function() {
					preloadSceneList(sceneList);
				}, 1000); // preload a bit later so we would not block showing next image
				console.log("Loaded more images.");
			});
		}
		$("#prevBtn").show();
		nextImage();
	});



	(function init() {
		$("#prevBtn").hide();
		$("#nextBtn").hide();
		var oldestAcquireDate = new Date(2015, 9, 21, 0, 0, 0, 0).toISOString();

		function populateFeatureListAndLoadFirstImage(sceneList) {
			currentElementIndex = 0;
			updateNextPrevLinkValues(sceneList);
			preloadSceneList(sceneList);
			plApi.addToFeatureList(sceneList, featureList);
			loadCurrentElement();
			$("#nextBtn").show();
		}
		plApi.getSceneList(oldestAcquireDate, undefined, populateFeatureListAndLoadFirstImage);
	})();
});