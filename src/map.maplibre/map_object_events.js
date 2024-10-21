import MapObject from "./map_object";

function hideLegend() {
	document.getElementsByClassName("maplibregl-legend-list")[0].style.display =
		"none";
	document.getElementsByClassName(
		"maplibregl-legend-switcher",
	)[0].style.display = "none";
}

function switcherLegend(property) {
	document.getElementsByClassName(
		"maplibregl-legend-switcher",
	)[0].style.display = property;
}

function switcherLegendList(property) {
	document.getElementsByClassName("maplibregl-legend-list")[0].style.display =
		property;
}

function showLayers(map, style) {
	if (style === "tag-ip") {
		// biome-ignore lint/complexity/noForEach: <explanation>
		Object.entries(MapObject.layerId).forEach(([key, value]) => {
			if (map.getLayer(key)) {
				map.setLayoutProperty(key, "visibility", value["tag-ip"]);
			}
		});
	}

	if (style === "maritime") {
		// biome-ignore lint/complexity/noForEach: <explanation>
		Object.entries(MapObject.layerId).forEach(([key, value]) => {
			if (map.getLayer(key)) {
				map.setLayoutProperty(key, "visibility", value.maritime);
			}
		});
	}

	if (style === "none") {
		// biome-ignore lint/complexity/noForEach: <explanation>
		Object.entries(MapObject.layerId).forEach(([key, _value]) => {
			if (map.getLayer(key)) {
				map.setLayoutProperty(key, "visibility", "none");
			}
		});
	}
}

export default {
	hideLegend,
	showLayers,
	switcherLegend,
	switcherLegendList,
};
