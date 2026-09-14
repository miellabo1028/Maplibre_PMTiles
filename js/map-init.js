/*
 * Display a current zoom level in MapLibre Control.
 */
class ZoomLevelControl {
  onAdd(map) {
    this._map = map;

    this._container =
      document.createElement("div");

    this._container.className =
      "maplibregl-ctrl zoom-level-control";

    this._updateZoom =
      this._updateZoom.bind(this);

    /*
     * The display will be updated while zooming is in progress.
     */
    this._map.on(
      "zoom",
      this._updateZoom
    );

    this._updateZoom();

    return this._container;
  }

  _updateZoom() {
    if (
      !this._map ||
      !this._container
    ) {
      return;
    }

    const zoom =
      this._map.getZoom();

    this._container.textContent =
      "Zoom: " + zoom.toFixed(1);

    this._container.title =
      "Current zoom level: " +
      zoom.toFixed(2);
  }

  onRemove() {
    if (this._map) {
      this._map.off(
        "zoom",
        this._updateZoom
      );
    }

    if (this._container) {
      this._container.remove();
    }

    this._map = undefined;
    this._container = undefined;
  }
}


/*
 * Initialize GESAT MapLibre
 */
(function initializeGesatMapLibre() {
  const status =
    document.getElementById("status");

  function showStatus(message) {
    if (status) {
      status.textContent =
        message;
    }

    console.log(message);
  }

  try {
    if (
      typeof maplibregl ===
      "undefined"
    ) {
      throw new Error(
        "MapLibre GL JS was not loaded."
      );
    }

    if (
      typeof pmtiles ===
      "undefined"
    ) {
      throw new Error(
        "PMTiles JavaScript library was not loaded."
      );
    }

    if (
      typeof GESAT_CONFIG ===
      "undefined"
    ) {
      throw new Error(
        "GESAT_CONFIG was not loaded."
      );
    }

    if (
      typeof createGesatStyle !==
      "function"
    ) {
      throw new Error(
        "createGesatStyle() was not loaded."
      );
    }

    if (
      typeof createGesatLayerControl !==
      "function"
    ) {
      throw new Error(
        "createGesatLayerControl() was not loaded."
      );
    }

    /*
     * PMTiles protocol
     */
    const protocol =
      new pmtiles.Protocol({
        metadata: true
      });

    maplibregl.addProtocol(
      "pmtiles",
      protocol.tile
    );

    /*
     * MapLibre map
     */
    const map =
      new maplibregl.Map({
        container:
          "map",

        style:
          createGesatStyle(),

        center:
          GESAT_CONFIG.map.center,

        zoom:
          GESAT_CONFIG.map.zoom,

        minZoom:
          GESAT_CONFIG.map.minZoom,

        maxZoom:
          GESAT_CONFIG.map.maxZoom,

        attributionControl:
          true
      });

    /*
     * ＋, －, Compas
     */
    map.addControl(
      new maplibregl
        .NavigationControl(),
      "top-left"
    );

    /*
     * Current zoom level
     *
     * By adding it after the NavigationControl, 
     * it will be positioned below the same top-left area.
     */
    map.addControl(
      new ZoomLevelControl(),
      "top-left"
    );

    /*
     * Scale
     */
    map.addControl(
      new maplibregl
        .ScaleControl({
          unit: "metric"
        }),
      "bottom-left"
    );

    /*
     * After loading Style and PMTiles
     */
    map.on(
      "load",
      function () {
        map.addControl(
          createGesatLayerControl(),
          "top-right"
        );

        /*
         * Console checks
         */
        window.gesatDebug = {
          map: map,
          protocol: protocol,
          config: GESAT_CONFIG,
          layerIds:
            typeof GESAT_LAYER_IDS !==
            "undefined"
              ? GESAT_LAYER_IDS
              : null
        };

        showStatus(
          "GESAT MapLibre map loaded successfully."
        );

        setTimeout(
          function () {
            if (status) {
              status.style.display =
                "none";
            }
          },
          2500
        );
      }
    );

    /*
     * Error processing in uMapLibre
     */
    map.on(
      "error",
      function (event) {
        const error =
          event.error || event;

        console.error(
          "MapLibre error:",
          error
        );

        /*
         * To prevent the system from remaining stuck in a loading state, 
         * errors will also be displayed on the screen.
         */
        if (
          status &&
          status.style.display !==
            "none"
        ) {
          showStatus(
            "MapLibre error: " +
            (
              error.message ||
              "See the browser console."
            )
          );
        }
      }
    );
  } catch (error) {
    console.error(
      "Startup error:",
      error
    );

    showStatus(
      "Startup error: " +
      error.message
    );
  }
})();