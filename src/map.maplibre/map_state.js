export default class MapState {
  follow = true

  playMode = false

  trb = null

  flt = null // label de flotte

  filter = 'all' // label de flotte avec filtre

  trackables = {}

  statuses = {}

  trackable_features = {}

  fleet_features = null

  trace_features = null

  trace = []

  popup = null

  popupOnClose = null

  marker = null

  selected_event_id = null

  overlay_ids = []

  system_overlay_ids = []

  overlays = {}

  pitch = 0

  zoom = 0

  keepZoom = false

  interactiveMode = false

  maxZoomRequested = false

  controls = {
    basemap: {
      isVector: false
    }
  }

  get wowMode () {
    return this.controls.basemap.isVector
  }

  get allowClick () {
    return !this.interactiveMode
  }

  get allowFollow () {
    return !this.interactiveMode
  }

  get isInteractive () {
    return this.interactiveMode
  }

  requestMaxZoom () {
    this.maxZoomRequested = true
  }

  maxZoomApplied () {
    this.maxZoomRequested = false
  }

  startCustomZoom () {
    this.keepZoom = true
    this.maxZoomRequested = false
  }

  endCustomZoom () {
    this.keepZoom = false
  }

  startInteractiveMode () {
    console.log('Starting interactive mode')

    if (!this.interactiveMode) {
      console.log('Started interactive mode')

      this.interactiveMode = true
      map.resetNorthPitch()
    } else console.log('Interactive mode already started')
  }

  /**
   * L'utilisateur peut faire des choses sur la carte, les selections sont
   * desactivés, et les mises à jiur de la carte sont desactivées
   */
  enableInteractiveMode () {
    this.startInteractiveMode()
  }

  endInteractiveMode () {
    console.log('Ending interactive mode')

    if (this.interactiveMode) {
      console.log('Ended interactive mode')

      this.interactiveMode = false
    } else console.log('Interactive mode already ended')
  }

  /**
   * L'utilisateur a fini ses actions sur la carte, reactiver le mode selection
   * et le follow
   */
  disableInteractiveMode () {
    this.endInteractiveMode()
  }
}
