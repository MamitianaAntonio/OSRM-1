// Import the necessary libraries
import maplibregl from "maplibre-gl";
import MapLibreDirections from "./src/js/maplibre-gl-directions.js";

const nominate =
	"https://nominatim.openstreetmap.org/reverse.php?format=jsonv2";
const initBounds = [
	[41.428523678184234, -25.855015532118756],
	[52.75820791383018, -11.711066264154994],
];
const styleMap = "https://vector-tiles.tag-ip.xyz/styles/tag-ip/style.json";

function displayDirections(locationName, dist, x, y) {
	const informationDiv = document.getElementById("informations");

	const li = document.createElement("li");
	const spanDistance = document.createElement("span");
	const span = document.createElement("span");
	li.setAttribute("class", "list-direction");
	span.setAttribute("class", "decor");
	spanDistance.setAttribute("class", "decor");
	span.textContent = locationName;
	spanDistance.textContent = `${dist} m`;
	li.appendChild(span);
	li.appendChild(spanDistance);
	//li.textContent = `${side} ${locationName} ${dist} m`;

	informationDiv.appendChild(li);
}

async function getLocation(hh) {
	const informationDiv = document.getElementById("informations");
	informationDiv.innerHTML = "";


	for (const i of hh) {
		const cord = i.maneuver.location;
		const dist = i.distance;
		const side = i.driving_side;
		const x = cord[0];
		const y = cord[1];
		const chaine = "&lat="
			.concat(y)
			.concat("&lon=")
			.concat(x)
			.concat("&zoom=18");
		const url = nominate.concat(chaine);
		await fetch(url)
			.then((response) => response.json())
			.then((data) => {
				const locationName =
					data.display_name.split(",")[0] + data.display_name.split(",")[1];
				//const locationName = data.display_name.split(",")
				//locationName = locationName.filter((lx, idx) => idx < 2)
				// console.log("tgygvy : ", locationName, dist, side);
			});
			displayDirections(locationName, dist, side);
	}
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

	// Fit the map to the specified bounds when loaded
	map.fitBounds(initBounds);

	// Initialize directions
	const directions = new MapLibreDirections({
		map: map,
		unit: "metric",
		interactive: true,
		controls: {
			inputs: true,
			instructions: false,
			profileSwitcher: true,
		},
		profile: "driving",
	});
	/*
function displayDirections(locationName, dist, x, y) {
	const li = document.createElement("li");
	const spanDistance = document.createElement("span");
	const span = document.createElement("span");
	//add class
	li.setAttribute("class", "list-direction");
	span.setAttribute("class", "decor");
	spanDistance.setAttribute("class", "decor");
	span.textContent = locationName;
	spanDistance.textContent = conversion(dist, "distance");//`${dist} m`;
	li.appendChild(span);
	li.appendChild(spanDistance);

	li.addEventListener("click", () => {
		// Logic for centering map on (x, y)
	});
	informationDiv.appendChild(li);
}*/

	//new event itinerary
	directions.on("route", (e) => {
		//console.log(e.route);
		console.log(e.route);
		//initialization
		const route = e.route[0];
		const summaryContainer = document.getElementById("summary");
		const distanceContainer = document.getElementById("distance");
		const durationContainer = document.getElementById("duration");

		//display summary
		/*
		.maplibregl-ctrl-geocoder input[type='text']
		<div id="maplibre-directions-destination-input">
		<div class="maplibregl-ctrl-geocoder"><span class="geocoder-icon geocoder-icon-search"></span>
		<input type="text" placeholder="Choose destination">
		send to nominatim

		*/
		if (summaryContainer) {
			const summary = route.legs[0].summary;
			summaryContainer.innerHTML = `<p>${summary}</p>`;
		} else {
			console.error("L'élément #summary est introuvable.");
		}

		// display distance
		if (distanceContainer) {
			const distance = (route.legs[0].distance / 1000).toFixed(2);
			distanceContainer.innerHTML = `<p><strong>Distance:</strong> ${distance} km</p>`;
		} else {
			console.error("Distance element is not found.");
		}
		//display duration
		if (durationContainer) {
			const duration = (route.legs[0].duration / 60).toFixed(2);
			durationContainer.innerHTML = `<p><strong>Durée:</strong> ${duration} min</p>`;
		} else {
			console.error("Duration element is not found.");
		}
		const hh = route.legs[0].steps;
		getLocation(hh);
	});
	/*
	// Zoom button
	document.querySelector(".zoom-in").addEventListener("click", () => {
		map.zoomIn();
	});
	document.querySelector(".zoom-out").addEventListener("click", () => {
		map.zoomOut();
	});
	*/

	

	//control behaviour
	//const directionVisible = false;

	// Add the directions plugin and other controls to the map
	map.addControl(directions, "top-left");

	// Show the route once the map is loaded
	map.on("load", () => {
		showRoute(directions);
	});

	//slideShow
	const menuBtn = document.getElementById("menu-btn");
	const sideMenu = document.getElementById("side-menu");

	// add btn event
	menuBtn.addEventListener("click", () => {
		sideMenu.classList.toggle("show");
		// change btn behave
		if (sideMenu.classList.contains("show")) {
			menuBtn.innerHTML = "&gt;";
		} else {
			menuBtn.innerHTML = "&lt;";
		}
	});

	return map;
}
