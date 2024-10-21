import MapDefaults from './map_defaults'

const Basemaps = []
const idsTagIp = ['tag-ip-mu', 'maritime']
//const idsOSM = ['osm_carto', 'osm_hot', 'osm_bw']
//const idsGoogle = ["google-sattelite", "google-hybrid", "google-terrain", "google-roadmap", "google-roadmap-altered"]
const idsGoogle = ["google-sattelite",  "google-terrain", "google-roadmap"]

const tilesGOOGLESatellite = [
  "https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}",
  "https://mt1.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}",
  "https://mt2.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}",
  "https://mt3.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}",
]
const tilesGOOGLEHybrid = tilesGOOGLESatellite.map((a) => a.replace("s&hl", "y&hl"))
const tilesGOOGLETerrain = tilesGOOGLESatellite.map((a) => a.replace("s&hl", "p&hl"))
const tilesGOOGLERoadmap = tilesGOOGLESatellite.map((a) => a.replace("s&hl", "m&hl"))
const tilesGOOGLERoadmapAltered = tilesGOOGLESatellite.map((a) => a.replace("s&hl", "r&hl"))
//const tilesGOOGLE = [tilesGOOGLESatellite, tilesGOOGLEHybrid, tilesGOOGLETerrain, tilesGOOGLERoadmap, tilesGOOGLERoadmapAltered]
const tilesGOOGLE = [tilesGOOGLESatellite,  tilesGOOGLETerrain, tilesGOOGLERoadmap]

const sourceExtraParamsOSM = {
  attribution: "Map data from OpenStreetMap.",
  crossOriginIsolated: true,
  tileSize: 256,
  maxZoom: 16,
}

const sourceExtraParamsGOOGLE = {
  attribution: "Map tiles from Google",
  tileSize: 256,
}


const vectorUrl = MapDefaults.vectorurl
const rasterUrl = MapDefaults.rasterurl

//  vector tiles
  for (const a of idsTagIp){
  const infos = {}
  infos.id = a
  infos.name = a.replaceAll('-', ' ').toUpperCase()
  infos.sourceType = "vector"
  infos.icon = vectorUrl.concat('/styles/', a, '/0/0/0.png')

  Basemaps.push(infos)
}

//  google tiles
for (const a of idsGoogle){
  const infos = {}
  const index = idsGoogle.indexOf(a);
  infos.id = a
  infos.name = a
  infos.sourceType = "raster"
  infos.sourceExtraParams = sourceExtraParamsGOOGLE
  infos.tiles = tilesGOOGLE[index]

  Basemaps.push(infos)
}
/*
//  osm raster tiles
for (const a of idsOSM){
  const infos = {}
  infos.id = a
  infos.name = a
  infos.sourceType = "raster"
  infos.sourceExtraParams = sourceExtraParamsOSM
  infos.tiles = [rasterUrl.concat('/', a, '/{z}/{x}/{y}.png')]

  Basemaps.push(infos)
}
*/


export default Basemaps