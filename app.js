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
const redblue = ["#a53217ff", "#d2987fff", "#fffee6ff", "#8897a2ff", "#10305eff"];

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

  /**
   * Creates a MultipartColorRamp by connecting multiple AlgorithmicColorRamp segments.
   * * @param {Array<{hex: string}>} colorHexCodes A simple array of hex color strings.
   * @returns {MultipartColorRamp}
   */
  function createManualMultipartColorRamp(colorHexCodes) {
      if (!colorHexCodes || colorHexCodes.length < 2) {
          console.error("Multipart color ramp requires at least two colors.");
          return null;
      }

      const ramps = [];

      // We create a segment (an AlgorithmicColorRamp) between every consecutive pair of colors.
      for (let i = 0; i < colorHexCodes.length - 1; i++) {
          const fromColor = new Color(colorHexCodes[i]);
          const toColor = new Color(colorHexCodes[i + 1]);

          ramps.push(
              new AlgorithmicColorRamp({
                  // 'lab' is generally the best algorithm for smooth, visually uniform ramps
                  algorithm: "cie-lab", 
                  fromColor: fromColor,
                  toColor: toColor
              })
          );
      }

      // The final MultipartColorRamp is composed of all the segments we created.
      return new MultipartColorRamp({
          colorRamps: ramps
      });
  }  

  function createStretchRenderer(colorRamp) {
    return new RasterStretchRenderer({
        stretchType: "min-max", 
        colorRamp: colorRamp,
        dynamicRangeAdjustment: true 
    });
  }

  // ============================================================================
  //                        HAZARD LAYER DEFINITIONS 
  // ============================================================================
   
    // ============================ SMOKE LAYER =============================

  // function createMultipartColorRamp(colors) {
  //   // Convert string colors to ArcGIS Color objects
  //   const colorStops = colors.map((hex, index) => {
  //       return new Color(hex);
  //   });

  //   return new AlgorithmicColorRamp({
  //       // The ramp type determines the interpolation method. 'lab' is often smooth.
  //       algorithm: "cie-lab", 
  //       fromColor: colorStops[0],
  //       toColor: colorStops[colorStops.length - 1],
  //   });
  // }

  // function createStretchRenderer(colorRamp) {
  //     return new RasterStretchRenderer({
  //         // The stretchType should be set based on your raster data's distribution
  //         // "min-max" is a common choice for elevation/single-band rasters
  //         stretchType: "min-max", 
  //         // You can optionally set min/max values if you know the data range
  //         min: 0,
  //         max: 30,
  //         colorRamp: colorRamp,
  //         // If your raster is single-band, you may need to specify the band index (default is 0)
  //         // bandIds: [0] 
  //     });
  // }

  // const smokeLayer = new ImageryTileLayer({
  //     // Load the layer from the Portal Item ID
  //     portalItem: {
  //         id: SMOKE_LAYER_ITEM_ID,
  //     },
  //     title: "Smoke Layer"
  // });

  // const smokeRenderer = createStretchRenderer(createMultipartColorRamp(redblue10))

  // const smokeRenderer = {
  //   type: "raster-stretch",
  //   stretchType: "standard-deviation",
  //   numberOfStandardDeviations: 2,
  //   statistics: [{
  //     min: 0.0,
  //     max: 114.0,
  //     avg: 4.5278,
  //     stddev: 8.9357,
  //   }],
  //   gamma: [0.6],
  //   // colorRamp: {
  //   //   type: "algorithmic",
  //   //   fromColor: [198, 219, 239, 255], // lighter blue
  //   //   toColor:   [  8,  48, 107, 255], // deep blue
  //   //   algorithm: "lab-lch"
  //   // }
  //   colorRamp: createMultipartColorRamp(redblue10)
  // };

  const smokeLayer = new ImageryTileLayer({
    portalItem: { id: SMOKE_LAYER_ITEM_ID },
    // renderer: smokeRenderer,
    opacity: 1,
    visible: true,
    title: "Smoke hazard"
  });

  // APPROACH: CUSTOM COLOR RAMP
  // Wait for the layer to load to ensure rendering can happen correctly
  // smokeLayer.load().then(() => {
  //   // Get the specified Esri Color Ramp
  //   // const colorRamp = getEsriColorRamp(COLOR_RAMP_NAME);
  //   const customColorRamp = createManualMultipartColorRamp(redblue10);

  //   if (customColorRamp) {
  //         const renderer = createStretchRenderer(customColorRamp);
  //         smokeLayer.renderer = renderer;
  //         console.log("Successfully applied custom MultipartColorRamp.");
  //     }

  // }).catch(error => {
  //     console.error("Error loading ImageryLayer or applying renderer:", error);
  // });


  const COLOR_RAMP_NAME = "Cyan to Purple"

  // APROACH: NAMED COLOR RAMP
  // Wait for the layer to load to ensure rendering can happen correctly
  smokeLayer.load().then(() => {
    // Get the specified Esri Color Ramp
    const colorRamp = getEsriColorRamp(COLOR_RAMP_NAME);
    // Create the RasterStretchRenderer
    const renderer = new RasterStretchRenderer({
        stretchType: "min-max", 
        colorRamp: colorRamp,
        // If you know the min/max of your data, you can set them here for a custom stretch
        // outputMin: 1000, 
        // outputMax: 3500,
        
        // Recommended property for better visualization
        dynamicRangeAdjustment: true 
    });
    // Apply the renderer
    smokeLayer.renderer = renderer;
    console.log(`Successfully applied Esri ramp: ${COLOR_RAMP_NAME}`);

  }).catch(error => {
      console.error("Error loading ImageryLayer or applying renderer:", error);
  });
  // // Apply the renderer
  // smokeLayer.renderer = renderer;

  // console.log(`Renderer with "${COLOR_RAMP_NAME}" color ramp applied.`);
  // }).catch(error => {
  // console.error("Error loading ImageryLayer or applying renderer:", error);
  // });

  // const smokeRamp = {
  //   type: "multipart",
  //   colorRamps: [
  //     {
  //       type: "algorithmic",
  //       algorithm: "cie-lab",
  //       fromColor: redblue10[0],
  //       toColor: redblue10[redblue10.length - 1]
  //     }
  //   ]
  // };

  // const smokeRenderer = {
  //   type: "raster-stretch",
  //   stretchType: "percent-clip",
  //   numberOfStandardDeviations: 2,
  //   minPercent: 0.5,
  //   maxPercent: 99.5,
  //   gamma: [0.6],
  //   colorRamp: buildMultipartRamp(redblue)
  // };

  // // const smokeLayer = new ImageryTileLayer({
  // //   portalItem: { id: SMOKE_LAYER_ITEM_ID },
  // //   renderer: smokeRenderer,
  // //   opacity: 0.6,
  // //   visible: true,
  // //   title: "Smoke hazard"
  // // });  

  // const smokeLayer = new ImageryTileLayer({
  //   portalItem: { id: SMOKE_LAYER_ITEM_ID },
  //   renderingRule: {
  //     rasterFunction: "Stretch",
  //     rasterFunctionArguments: {
  //       StretchType: 5,        // Percent Clip
  //       MinPercent: 2,
  //       MaxPercent: 98,
  //       ColorRamp: buildMultipartRamp(redblue10)
  //     }
  //   }
  //   // opacity: 0.6,
  //   // visible: true,
  //   // title: "Smoke hazard"
  // });
  // function createFloatRasterRenderingRule(colors, weights, stretchType = 5, stretchParams = {}) {
  //   function hexToRGBA(hex) {
  //     const n = parseInt(hex.replace("#", ""), 16);
  //     return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
  //   }

  //   const ramps = [];
  //   for (let i = 0; i < colors.length - 1; i++) {
  //     const w = weights?.[i] ?? 1;
  //     for (let j = 0; j < w; j++) {
  //       ramps.push({
  //         type: "algorithmic",
  //         algorithm: "cie-lab",
  //         fromColor: hexToRGBA(colors[i]),
  //         toColor: hexToRGBA(colors[i + 1])
  //       });
  //     }
  //   }

  //   return {
  //     rasterFunction: "RasterStretch",
  //     rasterFunctionArguments: {
  //       StretchType: stretchType, // numeric code: 1, 3, 5
  //       ColorRamp: { type: "multipart", colorRamps: ramps },
  //       ...stretchParams
  //     }
  //   };
  // }

  // // Your color stops
  // const rampColors = [
  //   "#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b",
  //   "#e6f598","#abdda4","#66c2a5","#3288bd"
  // ];

  // // Optional weights to emphasize mid colors
  // const rampWeights = [1,1,2,3,3,2,1,1];

  // // Create rendering rule for percent-clip
  // const myRenderingRule = createFloatRasterRenderingRule(
  //   rampColors,
  //   rampWeights,
  //   "percent-clip",
  //   { MinPercent: 2, MaxPercent: 98 }
  // );

  // // Apply to a layer
  // const smokeLayer = new ImageryTileLayer({
  //   portalItem: { id: SMOKE_LAYER_ITEM_ID },
  //   renderingRule: myRenderingRule
  // });

  // webmap.add(smokeLayer);
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
      // Fuel breaks
      webmap.reorder(fuelBreaksLayer, webmap.layers.length - 3);
      // Fuel managed areas
      webmap.reorder(fuelMngdLayer, webmap.layers.length - 4);      
      // Wildfire risk
      webmap.reorder(fireRiskLayer, webmap.layers.length - 5);
      // Wildfire threat
      webmap.reorder(fireThreatLayer, webmap.layers.length - 6);
      // Flood outline below neighbourhoods
      webmap.reorder(floodExtentLayer, webmap.layers.length - 7);
      // Flood raster below both
      webmap.reorder(floodLayer, webmap.layers.length - 8);
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

  // Both fire breaks and managed areas with one toggle
  const fuelBreakToggle = document.getElementById("fuelBreakToggle");
  if (fuelBreakToggle) {
    fuelBreakToggle.addEventListener("change", function (event) {
      fuelBreaksLayer.visible = event.target.checked;
      fuelMngdLayer.visible = event.target.checked;
    });
  }

  // const fuelMngdToggle = document.getElementById("fuelBreakToggle");
  // if (fuelMngdToggle) {
  //   fuelMngdToggle.addEventListener("change", function (event) {
  //     fuelMngdLayer.visible = event.target.checked;
  //   });
  // }

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

  const floodToggle = document.getElementById("floodToggle");
  if (floodToggle) {
    floodToggle.addEventListener("change", function (event) {
      floodLayer.visible = event.target.checked;
    });
  }

  const floodOutlineToggle = document.getElementById("floodToggle");
  if (floodOutlineToggle) {
    floodOutlineToggle.addEventListener("change", function (event) {
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
