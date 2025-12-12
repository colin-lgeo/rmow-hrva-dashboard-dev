// RMOW hazard viewer styled to match static map
// Uses AGOL items directly, no API key, for public content.

const BASEMAP_ITEM_ID        = "16ccd4ff9fe3428690c776202ff4a5c7";
const SMOKE_LAYER_ITEM_ID = "02019d71f4e04a22851fb60cc2b076c2";
const ROCKFALL_LAYER_ITEM_ID = "093117efdd044aa0ae99c16e2f918922";
const DEBRISF_LAYER_ITEM_ID = "f6a548dcae7145dbad1f77a285f192f6";
const NDVI_LAYER_ITEM_ID = "daa0a40dbeb04d60af56d239dd592e8c";
const LST_LAYER_ITEM_ID = "5557e9f89df349809d212d54066ccbeb";
const FUELBREAKS_LAYER_ITEM_ID = "b7d65560b3514835a47fe541ef31bfb3";
const FUELMNG_LAYER_ITEM_ID = "b9421a66f7104e47886395fc70e61270";
const RISKCLS_LAYER_ITEM_ID = "1533a455f7e84c4d916c951a155f797d";
const THREATCLS_LAYER_ITEM_ID = "006ca2c7ecb2464d9b14eeafa1ea1bbc";
const FLOOD_LAYER_ITEM_ID    = "c14e543a2a8944b6aba17b589e2d532b";
const NEIGHBOURHOOD_ITEM_ID  = "eaaf9354f8ce4c8588e29f1137667cde"; // sublayer 12
const FLOOD_OUTLINE_ITEM_ID  = "39c5ebf72e18404eb39e6cf8399e3f0c";

// --- colour map definitions --- 
  // Esri color ramps - Starburst
const starburst = ["#ec8787ff", "#f9cbb3ff", "#fff0d0ff", "#b7d5d7ff", "#70b6baff"];
// Esri color ramps - Red 1
const reds1 = ["#f6d7e0ff", "#e6968eff", "#db6a58ff", "#a1412cff"];

require([
  "esri/config",
  "esri/WebMap",
  "esri/layers/ImageryTileLayer",
  "esri/layers/FeatureLayer",
  "esri/views/MapView",
  "esri/widgets/Legend",
  "esri/widgets/ScaleBar",
  "esri/widgets/Expand"
], function (
  esriConfig,
  WebMap,
  ImageryTileLayer,
  FeatureLayer,
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
//                        HAZARD LAYER DEFINITIONS 
// ============================================================================
 
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
  // --- Risk Threat: reds fill, thin grey outline ---
  const riskThreatValues = ["Low", "Moderate", "High", "Extreme"];

 /**
 * Function to generate the required uniqueValueInfos array dynamically.
 * @param {Array<number|string>} values - The list of unique field values (e.g., [1, 2, 3, 4]).
 * @param {Array<string>} colors - The list of colors corresponding to the values.
 * @returns {Array<Object>} The array formatted for the UniqueValueRenderer.
 */
  function createUniqueValueInfos(values, colors) {
  // Use the .map() function to iterate through the values array
    return values.map((value, index) => {
      // For each value, create the corresponding uniqueValueInfo object
      return {
        value: value, // The actual data value (e.g., 1)
        label: `Risk Threat ${value}`, // A label for the legend
        symbol: {
          type: "simple-fill", // Change this to "simple-marker" for points
          color: colors[index], // Use the color at the matching index
          outline: {
            color: [255, 255, 255, 0.5],
            width: 0.5
          }
        }
      };
    });
  }

  // 3. Generate the uniqueValueInfos array
  const uniqueValueInfos = createUniqueValueInfos(riskThreatValues, reds1);

  // 4. Define the FeatureLayer Renderer using the generated array
  const riskThreatRenderer = {
    type: "unique-value",
    field: "Risk Threat", 
    
    // *** Use the dynamically generated array here ***
    uniqueValueInfos: uniqueValueInfos,
    
    defaultSymbol: {
      type: "simple-fill",
      color: [0, 0, 0, 0.5],
      outline: {
        color: [110, 110, 110, 1.0],
        width: 1
      }
    }
  };


  // 5. Define the FeatureLayer (as before)
  const riskThreatLayer = new FeatureLayer({
    url: "your-data-source", 
    renderer: riskThreatRenderer,
    title: "Risk Threat Assessment Layer"
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

  // Add layers in desired order:
  //  - flood imagery
  //  - flood outline
  //  - neighbourhoods
  webmap.addMany([riskThreatLayer, floodLayer, floodExtentLayer, neighbourhoodsLayer]);

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

    // Optional: explicitly confirm ordering
    webmap.when().then(function () {
      // Neighbourhoods on very top
      webmap.reorder(neighbourhoodsLayer, webmap.layers.length - 1);
      // Wildfire risk
      webmap.reorder(floodExtentLayer, webmap.layers.length - 2);
      // Flood outline below neighbourhoods
      webmap.reorder(floodExtentLayer, webmap.layers.length - 3);
      // Flood raster below both
      webmap.reorder(floodLayer, webmap.layers.length - 4);
    });
  });

  // --- UI toggles ---

  // const floodToggle = document.getElementById("floodToggle");
  // if (floodToggle) {
  //   floodToggle.addEventListener("change", function (event) {
  //     floodLayer.visible = event.target.checked;
  //   });
  // }

  const floodOutlineToggle = document.getElementById("floodOutlineToggle");
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
