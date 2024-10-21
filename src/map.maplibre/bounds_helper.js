const SW = {
  lng: 41.428523678184234,
  lat: -25.855015532118756,
}

const NE = {
  lng: 52.75820791383018,
  lat: -11.711066264154994,
}

// bounds SW, NE
const initBounds = [
  [41.428523678184234,-25.855015532118756], 
  [52.75820791383018, -11.711066264154994]
] 

const Center = [46.8691, -18.7669]

const Zoom = 5

function fleet () {}

function trace () {}

export default {
  fleet,
  trace,
  SW,
  NE,
  initBounds,
  Center,
  Zoom,
}
