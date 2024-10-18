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
const informationDiv = document.getElementById("informations");
const summaryContainer = document.getElementById("summary");
const distanceContainer = document.getElementById("distance");
const durationContainer = document.getElementById("duration");
const menuBtn = document.getElementById("menu-btn");
const sideMenu = document.getElementById("side-menu");

function displayDirections(locationName, dist, x, y) {
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

	li.addEventListener("click", () => {
		//x, y
	});
	informationDiv.appendChild(li);
	/*
 asiana icon direction font-awesome??
 atao hover pointer tanana kely
 rah mitony ny ambony sy ambany dia ovay
 asian evenement mijery lay points sur carte==> fitbounds
	*/
}

async function getLocation(hh) {
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

	map.addControl(new maplibregl.AttributionControl(), "bottom-right");
	map.addControl(new maplibregl.ScaleControl());
	map.addControl(new maplibregl.FullscreenControl(), "top-right");
	map.addControl(
		new maplibregl.NavigationControl({ visualizePitch: true }),
		"top-right",
	);
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

	//new event itinerary
	directions.on("route", (e) => {
		//console.log(e.route);
		console.log(e.route);
		//initialization
		const route = e.route[0];

		//display summary
		/*
		.maplibregl-ctrl-geocoder input[type='text']
		<div id="maplibre-directions-destination-input">
		<div class="maplibregl-ctrl-geocoder"><span class="geocoder-icon geocoder-icon-search"></span>
		<input type="text" placeholder="Choose destination">
		send to nominatim
		anaty css no milalao l.. esorina ny p, strong, kl

		*/
		const summary = route.legs[0].summary;
		const distance = (route.legs[0].distance / 1000).toFixed(2);
		const duration = (route.legs[0].duration / 60).toFixed(2);

		summaryContainer.innerHTML = `<p>${summary}</p>`;
		distanceContainer.innerHTML = `<p><strong>Distance:</strong> ${distance} km</p>`;
		durationContainer.innerHTML = `<p><strong>Durée:</strong> ${duration} min</p>`;

		const hh = route.legs[0].steps;
		getLocation(hh);
	});

	// Add the directions plugin and other controls to the map
	map.addControl(directions, "top-left");

	// Show the route once the map is loaded
	map.on("load", () => {
		showRoute(directions);
	});

	// add btn event
	/*menuBtn.addEventListener("click", () => {
		//sideMenu.classList.toggle("side-menu");

		// change btn behave
		if (sideMenu.style.display === "block") {
			menuBtn.innerHTML = "&gt;";
			sideMenu.style.display = "none";
		} else {
			menuBtn.innerHTML = "&lt;";
			sideMenu.style.display = "block";
		}
	});*/
	menuBtn.addEventListener("click", () => {
		// change btn behavior
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
