
// Import the necessary libraries
import maplibregl from "maplibre-gl";
import MapLibreDirections from "./src/js/maplibre-gl-directions.js";

import MapDefaults from "./src/map.maplibre/map_defaults.js";
import Bounds from "./src/map.maplibre/bounds_helper";
import MapState from "./src/map.maplibre/map_state.js";
import BasemapControl from "./src/map.maplibre/basemap_control.js";



const mapCenter = Bounds.Center
const mapStyle = MapDefaults.style
const mapBounds = Bounds.initBounds
const VisibleMapState = new MapState()
VisibleMapState.controls.basemap = new BasemapControl()
const controlBasemap = VisibleMapState.controls.basemap

const nominate = "https://nominatim.openstreetmap.org/reverse.php?format=jsonv2";
const initBounds = [
	[41.428523678184234, -25.855015532118756],
	[52.75820791383018, -11.711066264154994],
];
const styleMap = "https://vector-tiles.tag-ip.xyz/styles/tag-ip-mu/style.json";
const informationDiv = document.getElementById("informations");
const summaryContainer = document.getElementById("summary");
const distanceContainer = document.getElementById("distance");
const durationContainer = document.getElementById("duration");
const menuBtn = document.getElementById("menu-btn");
const sideMenu = document.getElementById("side-menu");
const DefaultOptions = {
	container: 'map',
	attributionControl: false,
	style: mapStyle,
	center: mapCenter,
	maxZoom: 17,
	// bounds: DefaultBounds,
	fitBoundsOptions: {
		padding: 50,
	},
	fadeDuration: 0,
}

function displayDirections(locationName, dist, x, y) {
	const li = document.createElement("li");
	const spanDistance = document.createElement("span");
	const span = document.createElement("span");
	//add class
	li.setAttribute("class", "list-direction");
	span.setAttribute("class", "decor");
	spanDistance.setAttribute("class", "decor");
	span.textContent = locationName;
	spanDistance.textContent = `${dist} m`;
	li.appendChild(span);
	li.appendChild(spanDistance);

	li.addEventListener("click", () => {
		// Logic for centering map on (x, y)
	});
	informationDiv.appendChild(li);
}

async function getLocation(steps) {
	informationDiv.innerHTML = "";
	for (const step of steps) {
		const cord = step.maneuver.location;
		const dist = step.distance;
		const x = cord[0];
		const y = cord[1];
		const url = `${nominate}&lat=${y}&lon=${x}&zoom=18`;

		await fetch(url)
			.then((response) => response.json())
			.then((data) => {
				const locationName = `${data.display_name.split(",")[0]} ${data.display_name.split(",")[1]}`;
				displayDirections(locationName, dist, x, y);
			});
	}
	sideMenu.style.display = "block";
}

// Function to initialize the map
export default function myFunc() {
	// Initialize the map
	
	const map = new maplibregl.Map({
		container: "map",
		style: styleMap,
		center: [47.5303, -18.9006],
		zoom: 10,
		attributionControl: false,
	});

	//const map = new maplibregl.Map({ DefaultOptions });

	map.addControl(new maplibregl.AttributionControl(), "bottom-right");
	map.addControl(new maplibregl.ScaleControl());
	map.addControl(new maplibregl.FullscreenControl(), "top-right");
	map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
	map.addControl(controlBasemap, "bottom-right");
	map.fitBounds(initBounds);

	// Initialize directions
	const directions = new MapLibreDirections({
		map: map,
		unit: "metric",
		interactive: true,
		controls: {
			inputs: true,
			instructions: false,
			profileSwitcher: false,
		},
		profile: "driving",
	});

	// Event listener for route generation
	directions.on("route", (e) => {

		console.log(e.route)

		const route = e.route[0];
		if (route) {
			// Open the side menu when points A and B are connected
			if (!sideMenu.classList.contains("open")) {
				sideMenu.classList.add("open");
				menuBtn.innerHTML = "&lt;";
			}

			// Display summary, distance, and duration
			const summary = route.legs[0].summary;
			const distance = (route.legs[0].distance / 1000).toFixed(2);
			const duration = (route.legs[0].duration / 60).toFixed(2);

			summaryContainer.innerHTML = `<p>${summary}</p>`;
			distanceContainer.innerHTML = `<p><strong>Distance:</strong> ${distance} km</p>`;
			durationContainer.innerHTML = `<p><strong>Durée:</strong> ${duration} min</p>`;

			const steps = route.legs[0].steps;
			getLocation(steps);
		}
	});

	// Add the directions plugin and other controls to the map
	map.addControl(directions, "top-left");

	// Event listener for the menu button
	menuBtn.addEventListener("click", () => {
		if (sideMenu.classList.contains("open")) {
			menuBtn.innerHTML = "&gt;";
			sideMenu.classList.remove("open");
		} else {
			menuBtn.innerHTML = "&lt;";
			sideMenu.classList.add("open");
		}
	});

	return map;
}
