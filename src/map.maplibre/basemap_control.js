
import { MaplibreLegendControl } from "@watergis/maplibre-gl-legend"

import Basemaps from "./basemaps"
import mapObjectEvent from "./map_object_events"
import mapObject from "./map_object"


const LegendControl = new MaplibreLegendControl(
	mapObject.seaDepth,
	mapObject.LegendOptions,
)

class BasemapControl {
	constructor(options) {
		this._options = { ...options }
		this._container = document.createElement("div")
		this._container.classList.add("maplibregl-ctrl")
		this._container.classList.add("maplibregl-ctrl-basemaps")
		this._container.classList.add("closed")

		switch (this._options.expandDirection) {
			case "top":
				this._container.classList.add("reverse")
				break
			case "down":
				this._container.classList.add("reverse")
				this._container.classList.add("column")
				break
			case "left":
				this._container.classList.add("reverse")
				break
			case "right":
				this._container.classList.add("reverse")
				this._container.classList.add("row")
				break
			default:
				this._container.classList.add("reverse")
				this._container.classList.add("row")
		}

		this._container.addEventListener("mouseenter", () => {
			this._container.classList.remove("closed")
		})
		this._container.addEventListener("mouseleave", () => {
			this._container.classList.add("closed")
		})

		this.activeBasemap = localStorage.getItem("map:basemap")

		if (!this.activeBasemap) this.setActiveBasemap(Basemaps[0].id)
	}

	get isVector() {
		return this.activeBasemap === Basemaps[0].id
	}

	setActiveBasemap(id) {
		localStorage.setItem("map:basemap", id)
		this.activeBasemap = id

		if (id !== Basemaps[0].id && id !== Basemaps[1].id) {
			// VisibleMap.resetNorthPitch()
		}
	}

	onAdd(map) {
		this._map = map

		map.on("load", () => {
			for (const {
				id,
				tiles,
				sourceExtraParams = {},
				layerExtraParams = {},
				icon,
				img,
				name,
				sourceType,
			} of Basemaps) {
				const basemapContainer = document.createElement("img")
				basemapContainer.style.width="50px";
				basemapContainer.style.height="50px";

				if (sourceType === "vector") {
					basemapContainer.classList.add("basemap")
					basemapContainer.dataset.id = id
					basemapContainer.dataset.basemap_type = "vector"
					basemapContainer.setAttribute("title", name)
					basemapContainer.setAttribute("id", id)
					basemapContainer.src = icon
					this._container.appendChild(basemapContainer)
				}

				if (sourceType === "raster") {
					map.addSource(id, {
						...sourceExtraParams,
						type: "raster",
						tiles,
					})
					map.addLayer({
						id,
						source: id,
						type: "raster",
						...layerExtraParams,
					})

					if (this.activeBasemap === id) {
						map.setLayoutProperty(id, "visibility", "visible")
					} else map.setLayoutProperty(id, "visibility", "none")

					basemapContainer.classList.add("basemap")
					basemapContainer.dataset.id = id
					basemapContainer.dataset.basemap_type = "raster"

					basemapContainer.setAttribute("title", name)
					basemapContainer.setAttribute("id", id)
					basemapContainer.src = tiles[0]
						.replace("{x}", "0")
						.replace("{y}", "0")
						.replace("{z}", (sourceExtraParams.minzoom || 0).toString())
					
					this._container.appendChild(basemapContainer)
				}

				if (this.activeBasemap === id) {
					basemapContainer.classList.toggle("active")
				}

				basemapContainer.addEventListener("click", () => {
					const activeElement = this._container.querySelector(".active")

					activeElement.classList.toggle("active")
					basemapContainer.classList.toggle("active")

					this.setActiveBasemap(id)

					if (sourceType === "vector") {
						if (activeElement.dataset.basemap_type === "raster") {
							map.setLayoutProperty(
								activeElement.dataset.id,
								"visibility",
								"none",
							)
						}

						if (id === "tag-ip-mu") {
							mapObjectEvent.showLayers(map, "tag-ip")
							mapObjectEvent.hideLegend()
						}

						if (id === "maritime") {
							mapObjectEvent.showLayers(map, "maritime")
							mapObjectEvent.switcherLegend("block")
						}
					}

					if (sourceType === "raster") {
						mapObjectEvent.showLayers(map, "none")
						map.setLayoutProperty(id, "visibility", "visible")

						if (activeElement.dataset.basemap_type === "raster") {
							map.setLayoutProperty(
								activeElement.dataset.id,
								"visibility",
								"none",
							)
						}

						// hide legend
						mapObjectEvent.hideLegend()

						// move to above all directions for raster image
						// console.log("all layers", map.getStyle().layers)
						if (map.getSource("directions")){
							const Layers = map.getStyle().layers
							for (const f of Layers){
								if (f.source ===  "directions"){
									const idLayer = f.id
									map.moveLayer(idLayer)
								}
							}
						}

						
					}
				})
			}
			
			map.addControl(LegendControl, "bottom-left")
			document
				.getElementsByClassName("maplibregl-legend-switcher")[0]
				.setAttribute("title", "Afficher la légende")
			document.getElementsByClassName("maplibregl-legend-onlyRendered-label",)[0].innerText = "Seulement rendu"
			mapObjectEvent.switcherLegendList("none")
		})

		return this._container
	}

	onRemove() {
		this._container.parentNode.removeChild(this._container)

		// delete this._map
	}
}

export default BasemapControl
