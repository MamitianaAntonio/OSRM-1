// Import the necessary libraries
import maplibregl from "maplibre-gl";
import MapLibreDirections from "./src/js/maplibre-gl-directions.js";
import MapDefaults from "./src/map.maplibre/map_defaults.js";
import Bounds from "./src/map.maplibre/bounds_helper";
import MapState from "./src/map.maplibre/map_state.js";
import BasemapControl from "./src/map.maplibre/basemap_control.js";
import '@fortawesome/fontawesome-free/css/all.min.css';



const mapCenter = Bounds.Center;
const mapStyle = MapDefaults.style;
const mapBounds = Bounds.initBounds;
const VisibleMapState = new MapState();
VisibleMapState.controls.basemap = new BasemapControl();
const controlBasemap = VisibleMapState.controls.basemap;

const nominate =
	"https://nominatim.openstreetmap.org/reverse.php?format=jsonv2";
const initBounds = [
	[41.428523678184234, -25.855015532118756],
	[52.75820791383018, -11.711066264154994],
];

/*const iDirections = {
	north: 'fa-turn-up',
	northeast: 'fa-square-up-right',
	east: 'fa-arrow-right',
	southeast: 'fa-arrow-down-right',
	south: 'fa-turn-down',
	southwest: 'fa-arrow-down-left',
	west: 'fa-arrow-left',
	northwest: 'fa-arrow-up-left',
};*/
//si angle <45 ==> "fa-".concat(iDirections[0]) == "fa-lef"

const iDirections = {
  north: 'fa-turn-up',
  northeast: 'fa-rotate-right',
  east: 'fa-right-long',
  southeast: 'fa-circle-dot',
  south: 'fa-turn-down',
  southwest: 'fa-circle-dot',
  west: 'fa-left-long',
  northwest: 'fa-rotate-left',
};

const styleMap = "https://vector-tiles.tag-ip.xyz/styles/tag-ip-mu/style.json";
const informationDiv = document.getElementById("informations");
const summaryContainer = document.getElementById("summary");
const distanceContainer = document.getElementById("distance");
const durationContainer = document.getElementById("duration");
const menuBtn = document.getElementById("menu-btn");
const sideMenu = document.getElementById("side-menu");
const DefaultOptions = {
	container: "map",
	attributionControl: false,
	style: mapStyle,
	center: mapCenter,
	maxZoom: 17,
	// bounds: DefaultBounds,
	fitBoundsOptions: {
		padding: 50,
	},
	fadeDuration: 0,
};


function getArrow(bearings) {
	const [bearing_before, bearing_after] = bearings;
	const bearingDiff = (bearing_after - bearing_before + 360) % 360;

	if (bearingDiff >= 337.5 || bearingDiff < 22.5) {
		return iDirections.north;
	} else if (bearingDiff >= 22.5 && bearingDiff < 67.5) {
		return iDirections.northeast;
	} else if (bearingDiff >= 67.5 && bearingDiff < 112.5) {
		return iDirections.east;
	} else if (bearingDiff >= 112.5 && bearingDiff < 157.5) {
		return iDirections.southeast;
	} else if (bearingDiff >= 157.5 && bearingDiff < 202.5) {
		return iDirections.south;
	} else if (bearingDiff >= 202.5 && bearingDiff < 247.5) {
		return iDirections.southwest;
	} else if (bearingDiff >= 247.5 && bearingDiff < 292.5) {
		return iDirections.west;
	} else if (bearingDiff >= 292.5 && bearingDiff < 337.5) {
		return iDirections.northwest;
	} else {
		return iDirections.north;
	}
}


function displayDirections(bearingArrow, locationName, dist, x, y) {
	const li = document.createElement("li");
	const spanDistance = document.createElement("span");
	const span = document.createElement("span");

	// Add class for list item
	li.setAttribute("class", "list-direction");

	span.setAttribute("class", "decor");
	spanDistance.setAttribute("class", "decor");

	// Create dynamic arrow with FontAwesome class
	const faArrow = `<i class="fa-solid ${bearingArrow}" aria-hidden="true"></i>`;
	span.innerHTML = faArrow + '  ' + locationName;
	spanDistance.innerHTML = `${dist} m`;

	// Append elements to list item
	li.appendChild(span);
	li.appendChild(spanDistance);

	informationDiv.appendChild(li);
}

async function getLocation(steps) {
	informationDiv.innerHTML = ""; // Clear previous directions

	for (const step of steps) {
		const cord = step.maneuver.location;
		const dist = step.distance;
		const x = cord[0];
		const y = cord[1];
		const url = `${nominate}&lat=${y}&lon=${x}&zoom=18`;

		// Extract bearings from step
		const bearings = [step.maneuver.bearing_before, step.maneuver.bearing_after];

		// Get the arrow direction based on bearings
		const bearingArrow = getArrow(bearings);

		// Fetch location details and display the direction
		await fetch(url)
			.then((response) => response.json())
			.then((data) => {
				const locationName = `${data.display_name.split(",")[0]} ${data.display_name.split(",")[1]}`;
				displayDirections(bearingArrow, locationName, dist, x, y);
			});
	}
	sideMenu.style.display = "block"; // Display side menu with directions
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

	// const map = new maplibregl.Map({ DefaultOptions });

	map.addControl(new maplibregl.AttributionControl(), "bottom-right");
	map.addControl(new maplibregl.ScaleControl());
	map.addControl(new maplibregl.FullscreenControl(), "top-right");
	map.addControl(
		new maplibregl.NavigationControl({ visualizePitch: true }),
		"top-right",
	);
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
		//console.log(e.route);
		const route = e.route[0];
		if (route) {
			// Open the side menu when points A and B are connected
			if (!sideMenu.classList.contains("open")) {
				sideMenu.classList.add("open");
				menuBtn.innerHTML = "&lt;";
			}
			// Display summary, distance, and duration
			const steps = route.legs[0].steps;
			const validSteps = steps.filter((step) => step.name);
			let summary = "";

			if (validSteps.length > 0) {
				const startName = validSteps[0].name;
				const endName = validSteps[validSteps.length - 1].name;
				summary = `${startName} <i class="fa-solid fa-arrow-right"></i> ${endName}`;
			}

			const distance = (route.legs[0].distance / 1000).toFixed(2);
			const duration = (route.legs[0].duration / 60).toFixed(2);

			summaryContainer.innerHTML = `<p>${summary}</p>`;
			distanceContainer.innerHTML = `<p><strong>Distance:</strong> ${distance} km</p>`;
			durationContainer.innerHTML = `<p><strong>Durée:</strong> ${duration} min</p>`;

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
