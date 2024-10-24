// Import the necessary libraries
import maplibregl from "maplibre-gl";
import MapLibreDirections from "./src/js/maplibre-gl-directions.js";
import MapDefaults from "./src/map.maplibre/map_defaults.js";
import Bounds from "./src/map.maplibre/bounds_helper";
import MapState from "./src/map.maplibre/map_state.js";
import BasemapControl from "./src/map.maplibre/basemap_control.js";

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
function conversion(arg, argType) {
	if (argType == "distance") {
		return `${(arg / 1000).toFixed(2)} km`;
	}
	if (argType == "hours") {
		const totalMinutes = (arg / 60);
		const hours = parseInt(Math.floor(totalMinutes / 60));
		const minutes = parseInt(totalMinutes % 60);
		const seconds = Math.floor((totalMinutes * 60) % 60);
		if (hours > 0) {
			return `${hours} h ${minutes} min ${seconds} sec`;
		} else {
			if (minutes > 0) {
				return `${minutes} min ${seconds} sec`;
			} else {
				return `${seconds} sec`;
			}
		}
	}
}

function displayDirections(locationName, stepDuration, dist, x, y) {
	const li = document.createElement("li");
	const spanDistance = document.createElement("span");
	const spanLocation = document.createElement("span");

	li.setAttribute("class", "list-direction");
	spanLocation.setAttribute("class", "decor");
	spanDistance.setAttribute("class", "decor");

	spanLocation.textContent = locationName;
	spanDistance.textContent = conversion(dist, "distance") + " (" + conversion(stepDuration, "hours") + ")";

	li.appendChild(spanLocation);
	li.appendChild(spanDistance);
	informationDiv.appendChild(li);

	if (informationDiv.children.length === 1) {
		const departureNote = document.createElement("div");
		departureNote.innerHTML = `<i class="fa-solid fa-a summary-icon"></i> : Départ`;
		departureNote.style.fontWeight = "bold";
		departureNote.style.marginBottom = "15px";
		informationDiv.insertBefore(departureNote, informationDiv.firstChild);
	}
}

async function getLocation(steps) {
	informationDiv.innerHTML = "";
	let lastElement; // Pour garder une référence du dernier élément affiché
	let pos = 0;
	let toFrom = "";
	let toEnd = "";
	let locationName = "";
	for (const step of steps) {
		console.log(step);
		const cord = step.maneuver.location;
		const dist = step.distance;
		const x = cord[0];
		const y = cord[1];
		const url = `${nominate}&lat=${y}&lon=${x}&zoom=18`;
		const stepDuration = step.duration;
		await fetch(url)
			.then((response) => response.json())
			.then((data) => {
				locationName = `${data.display_name.split(",")[0]} ${data.display_name.split(",")[1]}`;
				lastElement = displayDirections(locationName, stepDuration, dist, x, y); // Stocker la référence de l'élément créé
			});
		if (pos == 0) {
			toFrom = locationName;
		}
		if (pos == steps.length - 1) {
			toEnd = locationName;
		}
		pos++;

	}
	const toA = document.createElement("span");
	toA.setAttribute("class", "summary-child");
	const toB = document.createElement("span");
	toB.setAttribute("class", "summary-child");
	toA.innerHTML = toFrom;
	toB.innerHTML = toEnd;
	summaryContainer.appendChild(toA);
	summaryContainer.appendChild(toB);

	
	// Créer l'élément "Destination Atteinte" après la boucle
	const destinationNote = document.createElement("div");
	destinationNote.innerHTML = `<i class="fa-solid fa-b summary-icon-end"></i> : Destination Atteinte`;
	destinationNote.style.fontWeight = "bold";
	informationDiv.appendChild(destinationNote);

	// Faire apparaître l'élément "Destination Atteinte" après avoir ajouté toutes les destinations
	destinationNote.style.display = "block";

	// Assurer que le note soit en bas du dernier élément
	if (lastElement) {
		lastElement.after(destinationNote);
	}

	sideMenu.style.display = "block"; // Afficher le menu latéral après avoir terminé
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
		console.log(e.route);
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

			const putDistance = conversion(route.legs[0].distance, "distance");
			const putDuration = conversion(route.legs[0].duration, "hours");

			// Mise à jour du contenu HTML

			distanceContainer.innerHTML = `<p><strong>Distance:</strong> ${putDistance} </p>`;
			durationContainer.innerHTML = `<p><strong>Durée:</strong> ${putDuration} </p>`;

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
