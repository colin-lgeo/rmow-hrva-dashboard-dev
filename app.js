// RMOW hazard viewer styled to match static map
// Uses AGOL items directly, no API key, for public content.

// const BASEMAP_ITEM_ID        = "16ccd4ff9fe3428690c776202ff4a5c7"; // Jamie's initial basemap
const BASEMAP_ITEM_ID         = "a7dd522d5f374ef3840d2dc35c83b7ea"; // Colin's for underlay
const OVERLAY_ITEM_ID         = "20e707c910c1493fa33818c4fe835f86"; // Merged overlay polygons
const WB_BOUNDARY_ITEM_ID     = "04ee7fab5a204ceebadfe539d66ce361";
const BUILDINGS_ITEM_ID       = "b302800be04844b485800c5997d74766";

const SMOKE_LAYER_ITEM_ID     = "02019d71f4e04a22851fb60cc2b076c2";
const ROCKFALL_LAYER_ITEM_ID  = "093117efdd044aa0ae99c16e2f918922";
const DEBRISF_LAYER_ITEM_ID   = "f6a548dcae7145dbad1f77a285f192f6";
const NDVI_LAYER_ITEM_ID      = "daa0a40dbeb04d60af56d239dd592e8c";
const LST_LAYER_ITEM_ID       = "5557e9f89df349809d212d54066ccbeb";
const FUELBREAKS_LAYER_ITEM_ID = "b7d65560b3514835a47fe541ef31bfb3";
const FUELMNG_LAYER_ITEM_ID   = "b9421a66f7104e47886395fc70e61270";
const RISKCLS_LAYER_ITEM_ID   = "1533a455f7e84c4d916c951a155f797d";
const THREATCLS_LAYER_ITEM_ID = "006ca2c7ecb2464d9b14eeafa1ea1bbc";
const FLOOD_LAYER_ITEM_ID     = "c14e543a2a8944b6aba17b589e2d532b";
const NEIGHBOURHOOD_ITEM_ID   = "eaaf9354f8ce4c8588e29f1137667cde"; // sublayer 12
const FLOOD_OUTLINE_ITEM_ID   = "39c5ebf72e18404eb39e6cf8399e3f0c";

// --- colour map definitions --- 
  // Esri color ramps - Starburst
const starburst = ["#ec8787ff", "#f9cbb3ff", "#fff0d0ff", "#b7d5d7ff", "#70b6baff"];
// Esri color ramps - Red 1
const reds1 = ["#f6d7e0ff", "#e6968eff", "#db6a58ff", "#a1412cff"];
// Esri color ramps - Blue and Red 10
const redblue10 = ["#d7191cff", "#fdae61ff", "#ffffbfff", "#abdda4ff", "#2b83baff"];
const bluered10 = ["#2b83baff", "#abdda4ff", "#ffffbfff", "#fdae61ff", "#d7191cff"  ];
const redblue = ["#a53217ff", "#d2987fff", "#fffee6ff", "#8897a2ff", "#10305eff"];
const inferno = ["#010005ff", "#1c0f4bff", "#520d8eff", "#881b9eff", "#bc2e9aff", "#f04188ff", "#ff5c6aff", "#ff8345ff", "#ffb71bff", "#fff415ff", "#ffff64ff", "#ffffe1ff", "#ffffebff"];

require([
  "esri/config",
  "esri/WebMap",
  "esri/layers/ImageryTileLayer",
  "esri/layers/ImageryLayer",
  "esri/layers/FeatureLayer",
  "esri/renderers/RasterStretchRenderer",
  "esri/rest/support/AlgorithmicColorRamp",
  "esri/rest/support/MultipartColorRamp",
  "esri/smartMapping/raster/support/colorRamps",
  "esri/Color",
  "esri/views/MapView",
  "esri/widgets/Legend",
  "esri/widgets/ScaleBar",
  "esri/widgets/Expand"
], function (
  esriConfig,
  WebMap,
  ImageryTileLayer,
  ImageryLayer,
  FeatureLayer,
  RasterStretchRenderer,
  AlgorithmicColorRamp,
  MultipartColorRamp,
  colorRamps,
  Color,
  MapView,
  Legend,
  ScaleBar,
  Expand
) {
  // esriConfig.apiKey = "YOUR_API_KEY"; // only if you later add secured content

  // --- WebMap (basemap + existing AGOL layers) ---
  const webmap = new WebMap({
    portalItem: { id: BASEMAP_ITEM_ID }
  });


// ============================================================================
//                          FUNCTIONS
// ============================================================================
  // /**
  //  * Retrieves a named Esri Color Ramp and formats it for the RasterStretchRenderer.
  //  * Works for a limited subset of names, but I can't find a way to get a reference list
  //  * @param {string} name - The name of the Esri color ramp.
  //  * @returns {Object} A valid ColorRamp object for the renderer.
  //  */
  // function getEsriColorRamp(name) {
  //     // 1. Look up the color data structure
  //     const rampData = colorRamps.byName(name);

  //     if (!rampData || !rampData.colors || rampData.colors.length === 0) {
  //         // Fallback to a simple, manually defined algorithmic ramp if lookup fails
  //         console.error(`Named color ramp "${name}" lookup failed. Using Blue-to-Red fallback.`);
  //         return new AlgorithmicColorRamp({
  //             algorithm: "cie-lab",
  //             fromColor: new Color("#0000FF"),
  //             toColor: new Color("#FF0000")
  //         });
  //     }
      
  //     // 2. Convert the color data into a proper ColorRamp class instance
  //     return colorRamps.createColorRamp(rampData);
  // }

  // /**
  //  * Creates a MultipartColorRamp by connecting multiple AlgorithmicColorRamp segments.
  //  * * @param {Array<{hex: string}>} colorHexCodes A simple array of hex color strings.
  //  * @returns {MultipartColorRamp}
  //  */
  // function createManualMultipartColorRamp(colorHexCodes) {
  //     if (!colorHexCodes || colorHexCodes.length < 2) {
  //         console.error("Multipart color ramp requires at least two colors.");
  //         return null;
  //     }

  //     const ramps = [];

  //     // We create a segment (an AlgorithmicColorRamp) between every consecutive pair of colors.
  //     for (let i = 0; i < colorHexCodes.length - 1; i++) {
  //         const fromColor = new Color(colorHexCodes[i]);
  //         const toColor = new Color(colorHexCodes[i + 1]);

  //         ramps.push(
  //             new AlgorithmicColorRamp({
  //                 // 'lab' is generally the best algorithm for smooth, visually uniform ramps
  //                 algorithm: "cie-lab", 
  //                 fromColor: fromColor,
  //                 toColor: toColor
  //             })
  //         );
  //     }

  //     // The final MultipartColorRamp is composed of all the segments we created.
  //     return new MultipartColorRamp({
  //         colorRamps: ramps
  //     });
  // }  

  function createStretchRenderer(colorRamp) {
    return new RasterStretchRenderer({
        stretchType: "min-max", 
        colorRamp: colorRamp,
        dynamicRangeAdjustment: false 
    });
  }

  /**
   * Creates a MultipartColorRamp from a flat array of hex color codes, with optional positions.
   * @param {string[]} colorHexCodes - An array of hex color strings.
   * @param {number[]} [ratios] - Optional array of ratios (0.0 to 1.0) defining color positions.
   * @returns {MultipartColorRamp | null}
   */
  function createManualMultipartColorRamp(colorHexCodes, ratios) {
      if (!colorHexCodes || colorHexCodes.length < 2) {
          console.error("Multipart color ramp requires at least two colors.");
          return null;
      }

      if (ratios && ratios.length !== colorHexCodes.length) {
          console.error("If ratios are provided, the count must match the color count.");
          return null;
      }

      const segments = [];

      // Create a segment (AlgorithmicColorRamp) between every consecutive pair of colors.
      for (let i = 0; i < colorHexCodes.length - 1; i++) {
          const fromColor = new Color(colorHexCodes[i]);
          const toColor = new Color(colorHexCodes[i + 1]);
          
          const segment = new AlgorithmicColorRamp({
              algorithm: "cie-lab", 
              fromColor: fromColor,
              toColor: toColor
          });

          // Case 1: Custom Ratios provided. Use the ratio/colorRamp structure.
          if (ratios) {
              segments.push({
                  colorRamp: segment,
                  // The ratio where this segment STARTS (must match the index of the start color)
                  ratio: ratios[i] 
              });
          } 
          // Case 2: No Ratios provided. Just push the segment. The API assumes even spacing.
          else {
              segments.push(segment);
          }
      }

      return new MultipartColorRamp({
          colorRamps: segments
      });
  }

  /**
   * Creates a RasterStretchRenderer using the 'min-max' stretch type.
   * @param {number} min - The data value that maps to 0% (start) of the color ramp.
   * @param {number} max - The data value that maps to 100% (end) of the color ramp.
   * @param {Object} colorRamp - The ColorRamp object (e.g., from createManualMultipartColorRamp).
   * @returns {RasterStretchRenderer}
   */
  function createMinMaxRenderer(min, max, colorRamp) {
      return new RasterStretchRenderer({
          stretchType: "min-max",
          // The values that define the range of the stretch
          min: min,
          max: max,
          // Optional: If you want to clamp output values outside of the min/max range
          outputMin: min,
          outputMax: max, 
          colorRamp: colorRamp,
          dynamicRangeAdjustment: false // Usually set to false when min/max are explicitly defined
      });
  }

  /**
   * Creates a RasterStretchRenderer using the 'percent-clip' stretch type.
   * @param {number} minPercent - The percentage of low values to clip (0 to 100).
   * @param {number} maxPercent - The percentage of high values to clip (0 to 100).
   * @param {Object} colorRamp - The ColorRamp object.
   * @returns {RasterStretchRenderer}
   */
  function createPercentClipRenderer(minPercent, maxPercent, colorRamp) {
      return new RasterStretchRenderer({
          stretchType: "percent-clip",
          // The percentage of the data distribution to clip from the low and high ends
          min: minPercent,
          max: maxPercent,
          colorRamp: colorRamp,
          dynamicRangeAdjustment: false // Recommended to be false for consistent percentage clips
      });
  }
  // ============================================================================
  //                        HAZARD LAYER DEFINITIONS 
  // ============================================================================

  // ============================ SMOKE LAYER =============================
  const smokeLayer = new ImageryTileLayer({
    portalItem: { id: SMOKE_LAYER_ITEM_ID },
    opacity: 1.0,
    blendMode: "multiply",
    visible: false,
    title: "Smoke hazard"
  });

  // APPROACH: CUSTOM COLOR RAMP
  // Wait for the layer to load to ensure rendering can happen correctly
  smokeLayer.load().then(() => {
    // Get the specified Esri Color Ramp
    const smokeColorRamp = createManualMultipartColorRamp(bluered10);

    if (smokeColorRamp) {
          const smokeRenderer = createPercentClipRenderer(0.5, 99.5, smokeColorRamp);
          smokeLayer.renderer = smokeRenderer;
          console.log("Successfully applied custom MultipartColorRamp.");
      }

  }).catch(error => {
      console.error("Error loading ImageryLayer or applying renderer:", error);
  });

  // ============================ ROCKFALL LAYER =============================

  // ============================ DEBRIS FLOW LAYER =============================
  // ============================ EXTREME HEAT LAYER =============================
  const lstLayer = new ImageryTileLayer({
    portalItem: { id: LST_LAYER_ITEM_ID },
    opacity: 1.0,
    visible: false,
    title: "Extreme Heat hazard"
  });

  // APPROACH: CUSTOM COLOR RAMP
  // Wait for the layer to load to ensure rendering can happen correctly
  lstLayer.load().then(() => {
    // Get the specified Esri Color Ramp
    const lstColorRamp = createManualMultipartColorRamp(inferno);
    const lstRenderer = createPercentClipRenderer(0.5, 99.5, lstColorRamp);
    lstLayer.renderer = lstRenderer;
    console.log("Successfully applied custom MultipartColorRamp.");

  }).catch(error => {
      console.error("Error loading ImageryLayer or applying renderer:", error);
  });
  // ============================ NDVI LAYER =============================

  // ============================ FLOOD LAYERS =============================
  // --- Flood hazard imagery: darker, opaque blue stretch ---

  const floodRenderer = {
    type: "raster-stretch",
    stretchType: "standard-deviation",
    numberOfStandardDeviations: 2,
    statistics: [{
      min: 0.00006103515625,
      max: 7.69512939453125,
      avg: 1.1509735879299638,
      stddev: 0.90648640678161641
    }],
    gamma: [0.6],
    colorRamp: {
      type: "algorithmic",
      fromColor: [198, 219, 239, 255], // lighter blue
      toColor:   [  8,  48, 107, 255], // deep blue
      algorithm: "lab-lch"
    }
  };

  const floodLayer = new ImageryTileLayer({
    portalItem: { id: FLOOD_LAYER_ITEM_ID },
    renderer: floodRenderer,
    opacity: 1,
    visible: true,
    title: "Flood hazard"
  });

  // --- Flood extent outline: transparent fill, thick outline ---

  const floodExtentLayer = new FeatureLayer({
    portalItem: { id: FLOOD_OUTLINE_ITEM_ID },
    title: "Flood extent outline",
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: [0, 0, 0, 0],          // no fill
        outline: {
          color: [8, 48, 107, 1],     // deep blue outline
          width: 2
        }
      }
    },
    opacity: 1,
    popupEnabled: true
  });

  // ============================ WILDFIRE LAYERS =============================
  // --- Fire Break ---
  const fuelBreaksLayer = new FeatureLayer({
    portalItem: { id: FUELBREAKS_LAYER_ITEM_ID },
    title: "Fuel Breaks Layer",
    opacity: 1,
    visible: false,
    popupEnabled: true
  });  

  // --- Fire Managed Areas ---
  const fuelMngdLayer = new FeatureLayer({
    portalItem: { id: FUELMNG_LAYER_ITEM_ID },
    title: "Fuel Managed Areas Layer",
    opacity: 1,
    visible: false,
    popupEnabled: true
  });  

  // --- Fire Risk Class ---
  const fireRiskLayer = new FeatureLayer({
    portalItem: { id: RISKCLS_LAYER_ITEM_ID },
    title: "Wildfire Risk Layer",
    opacity: 1,
    visible: false,
    popupEnabled: true
  });    

  // --- Fire Threat Class ---
  const fireThreatLayer = new FeatureLayer({
    portalItem: { id: THREATCLS_LAYER_ITEM_ID },
    title: "Wildfire PSTA Threat Class",
    opacity: 1,
    visible: false,
    popupEnabled: true
  }); 
// ============================================================================
//                        BASEMAP LAYER DEFINITIONS 
// ============================================================================

  // --- Neighbourhoods: transparent fill, blue outline ---

  const neighbourhoodsLayer = new FeatureLayer({
    portalItem: { id: NEIGHBOURHOOD_ITEM_ID },
    layerId: 12,
    title: "Neighbourhoods",
    renderer: {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: [0, 0, 0, 0],
        outline: {
          color: [30, 64, 175, 1],
          width: 1
        }
      }
    },
    opacity: 1,
    popupEnabled: true
  });

  const buildingsLayer = new FeatureLayer({
    portalItem: { id: BUILDINGS_ITEM_ID },
    title: "Buliding Footprints",
    opacity: 1,
    popupEnabled: true
  });

// ============================================================================
//                        Build layers and toggles
// ============================================================================
  // Add layers in desired order:
  //  - flood imagery
  //  - flood outline
  //  - neighbourhoods
  // webmap.addMany([floodLayer, floodExtentLayer, neighbourhoodsLayer]);
  // webmap.addMany([floodLayer, floodExtentLayer, fireRiskLayer]);
  webmap.addMany([
    floodLayer, 
    floodExtentLayer,
    lstLayer, 
    fireThreatLayer,
    fireRiskLayer,
    fuelMngdLayer,
    fuelBreaksLayer,
    smokeLayer,
    neighbourhoodsLayer, 
    buildingsLayer
    ]);

  // --- View + widgets ---

  const view = new MapView({
    container: "viewDiv",
    map: webmap,
    popup: {
      dockEnabled: true,
      dockOptions: {
        position: "bottom-right",
        buttonEnabled: false
      }
    }
  });

  view.when().then(function () {
    const legend = new Legend({ view });
    const legendExpand = new Expand({
      view,
      content: legend,
      expanded: false,
      expandTooltip: "Legend"
    });
    view.ui.add(legendExpand, "top-left");

    const scaleBar = new ScaleBar({
      view,
      unit: "metric"
    });
    view.ui.add(scaleBar, "bottom-left");

    // Zoom to flood extent once it’s ready
    floodLayer.when().then(function () {
      if (floodLayer.fullExtent) {
        view.goTo(floodLayer.fullExtent.expand(1.1)).catch(() => {});
      }
    }).catch(function (error) {
      console.error("Flood layer failed to load:", error);
    });

    // // Zoom to fire threat once it’s ready
    // floodLayer.when().then(function () {
    //   if (floodLayer.fullExtent) {
    //     view.goTo(floodLayer.fullExtent.expand(1.1)).catch(() => {});
    //   }
    // }).catch(function (error) {
    //   console.error("Flood layer failed to load:", error);
    // });

    // -------- Optional: explicitly confirm ordering -------
    webmap.when().then(function () {
      // very top
      webmap.reorder(buildingsLayer, webmap.layers.length - 1);      
      // Neighbourhoods on 
      webmap.reorder(neighbourhoodsLayer, webmap.layers.length - 2);
      // Smoke
      webmap.reorder(smokeLayer, webmap.layers.length - 3);
      // Fuel breaks
      webmap.reorder(fuelBreaksLayer, webmap.layers.length - 4);
      // Fuel managed areas
      webmap.reorder(fuelMngdLayer, webmap.layers.length - 5);      
      // Wildfire risk
      webmap.reorder(fireRiskLayer, webmap.layers.length - 6);
      // Wildfire threat
      webmap.reorder(fireThreatLayer, webmap.layers.length - 7);
      // LST
      // Flood outline below neighbourhoods
      webmap.reorder(floodExtentLayer, webmap.layers.length - 8);
      // Flood raster below both
      webmap.reorder(floodLayer, webmap.layers.length - 9);
    });
  });

  // --- UI toggles ---
  const buildingsToggle = document.getElementById("buildingsToggle");
  if (buildingsToggle) {
    buildingsToggle.addEventListener("change", function (event) {
      buildingsLayer.visible = event.target.checked;
    });
  }

  const neighbourhoodsToggle = document.getElementById("neighbourhoodsToggle");
  if (neighbourhoodsToggle) {
    neighbourhoodsToggle.addEventListener("change", function (event) {
      neighbourhoodsLayer.visible = event.target.checked;
    });
  }

  const smokeToggle = document.getElementById("smokeToggle");
  if (smokeToggle) {
    smokeToggle.addEventListener("change", function (event) {
      smokeLayer.visible = event.target.checked;
    });
  }

  // Both fire breaks and managed areas with one toggle
  const fuelBreakToggle = document.getElementById("fuelBreakToggle");
  if (fuelBreakToggle) {
    fuelBreakToggle.addEventListener("change", function (event) {
      fuelBreaksLayer.visible = event.target.checked;
      fuelMngdLayer.visible = event.target.checked;
    });
  }

  const fireRiskToggle = document.getElementById("fireRiskToggle");
  if (fireRiskToggle) {
    fireRiskToggle.addEventListener("change", function (event) {
      fireRiskLayer.visible = event.target.checked;
    });
  }

  const fireThreatToggle = document.getElementById("fireThreatToggle");
  if (fireThreatToggle) {
    fireThreatToggle.addEventListener("change", function (event) {
      fireThreatLayer.visible = event.target.checked;
    });
  }

  const lstToggle = document.getElementById("lstToggle");
  if (lstToggle) {
    lstToggle.addEventListener("change", function (event) {
      lstLayer.visible = event.target.checked;
    });
  }

  const floodToggle = document.getElementById("floodToggle");
  if (floodToggle) {
    floodToggle.addEventListener("change", function (event) {
      floodLayer.visible = event.target.checked;
      floodExtentLayer.visible = event.target.checked;
    });
  }

  const nhToggle = document.getElementById("neighbourhoodToggle");
  if (nhToggle) {
    nhToggle.addEventListener("change", function (event) {
      neighbourhoodsLayer.visible = event.target.checked;
    });
  }
});
