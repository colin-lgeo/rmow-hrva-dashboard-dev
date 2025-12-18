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
const DIKES_LAYER_ITEM_ID     = "6ce26b152302474281495a081ee7e4b0";
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
// const inferno = ["#010005ff", "#1c0f4bff", "#520d8eff", "#881b9eff", "#bc2e9aff", "#f04188ff", "#ff5c6aff", "#ff8345ff", "#ffb71bff", "#fff415ff", "#ffff64ff", "#ffffe1ff", "#ffffebff"];
const inferno = ["#520d8eff", "#bc2e9aff", "#ff5c6aff", "#ffb71bff", "#ffff64ff"];

const rockfall = ["#f9eedd00", "#dea183ff", "#cd7C58ff", "#ba5632ff"]
// const debris = ["#a297b300", "#9f8cbdff", "#9b81c6ff", "#9876d0ff", "#946bd9ff", "#9060cfff", "#8d55ecff", "#894af6ff", "#853fffff", "#a46fbfff", "#c29f80ff", "#e0cf40ff", "#ffff00ff"];
// Esri color ramps - Viridis
// const debris = ["#6730a4ff", "#6058beff", "#507dc9ff", "#419ecbff", "#35bdcbff", "#2cdcc6ff", "#3bfbb6ff", "#6fff99ff", "#b9ff6eff", "#ffff37ff"];
const debris = ["#44015400", "#48247540", "#41448780", "#355f8dbf", "#2a788eff", "#21918cff", "#22a884ff", "#44bf70ff", "#7ad151ff", "#bddf26ff", "#fde725ff"];
const dry = ["#543005ff", "#8c510aff", "#bf812dff", "#dfc27dff", "#f6e8c3ff", "#f5f5f500", "#c7eae5ff", "#80cdc1ff", "#35978fff", "#01665eff", "#003c30ff"];


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
  "esri/widgets/Expand",
  "esri/widgets/Feature"
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
  Expand,
  Feature
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
          statistics: [{
            min: min,
            max: max,
            avg: 0.0,
            stddev: 0.0,
          }],
          // The values that define the range of the stretch
          // min: min,
          // max: max,
          // Optional: If you want to clamp output values outside of the min/max range
          // outputMin: 0,
          // outputMax: 150, 
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
          minPercent: minPercent,
          maxPercent: maxPercent,
          colorRamp: colorRamp,
          dynamicRangeAdjustment: false // Recommended to be false for consistent percentage clips
      });
  }

  /**
   * Creates the html setup for the corner panel for all layers in the config.
   * @param {object} config - layer config
   * @param {string} containderId - HTML id for the corner calcite panel.
   * @returns {RasterStretchRenderer}
   */
  function renderLayerControls(config, containerId) {
    const container = document.getElementById(containerId);
    let html = `<calcite-accordion>`;

    config.forEach(group => {
      const isGroupVisible = group.items.some(item => {
        // Check the layer objects for visibility, expand accordion if so
        return item.layers.some(layer => layer && layer.visible === true);
      });

      const expanded = isGroupVisible ? " expanded" : "";
      // console.log(`Group: ${group.category}, isVisible: ${isGroupVisible}, expanded: ${expanded}`)

      html += `<calcite-accordion-item heading="${group.category}"${expanded}>`;
      
      group.items.forEach(item => {
        let layerVis = item.layers.some(layer => layer && layer.visible === true);
        let checked = layerVis ? " checked" : "";
        // -- Adds hover tooltip in panel ---
        // html += `
        //   <div class="layer-row">
        //     <calcite-action icon="information" id="info-${item.id}" text="More Info" appearance="transparent" scale="s"></calcite-action>
        //     <calcite-label layout="inline">
        //       <calcite-checkbox id="${item.id}"${checked}></calcite-checkbox>
        //       ${item.label}
        //     </calcite-label>
        //     <calcite-tooltip reference-element="info-${item.id}" placement="top">
        //       ${item.info}
        //     </calcite-tooltip>
        //   </div>`;
        // -- Removed hover tool tip - will be popup panel only
        html += `
          <div class="layer-row">
            <calcite-action icon="information" id="info-${item.id}" text="More Info" appearance="transparent" scale="s"></calcite-action>
            <calcite-label layout="inline">
              <calcite-checkbox id="${item.id}"${checked}></calcite-checkbox>
              ${item.label}
            </calcite-label>
          </div>`;
      });

      html += `</calcite-accordion-item>`;
    });

    html += `</calcite-accordion>`;
    container.innerHTML = html;

    // After injecting HTML, bind your events
    setupVisibilityListeners(config);
  }

  // Manages UI visibility and toggles
  function setupVisibilityListeners(config) {
    config.forEach(group => {
      group.items.forEach(item => {
        const checkbox = document.getElementById(item.id);
        if (checkbox) {
          checkbox.addEventListener("calciteCheckboxChange", (event) => {
            const isVisible = event.target.checked;
            item.layers.forEach(lyr => {
              if (lyr) lyr.visible = isVisible;
            });
          });
        }
      });
    });
  }

  // Keep this variable at the top level so all functions can access/clear it
  let visibilityWatcher = null;

  async function updateInfoPanel(item) {
    const infoPanel = document.getElementById("infoPanel");
    const layer = item.layers[0];

    if (layer.loadStatus !== "loaded") await layer.load();

    const description = layer.portalItem?.description || layer.serviceDescription || "No description available.";

    // --- 1. LEGEND LOGIC ---
    let legendHTML = "";
    if (!layer.visible) {
      legendHTML = `
        <div style="padding: 10px; background: #fff5f5; border: 1px solid #feb2b2; border-radius: 4px; color: #c53030; font-size: 0.85rem; text-align: center;">
          <calcite-icon icon="view-hide" scale="s" style="margin-right: 5px; vertical-align: middle;"></calcite-icon>
          Layer Hidden
        </div>`;
    } else if (layer.type === "imagery") {
      legendHTML = await getRasterLegendHTML(layer);
    } else {
      legendHTML = `<div id="standard-legend-node"></div>`;
    }

    // --- 2. UPDATE PANEL HTML ---
    infoPanel.heading = item.label;
    infoPanel.innerHTML = `
      <div style="padding: 15px; display: flex; flex-direction: column; gap: 10px;">
        <div style="background: #f8f8f8; padding: 8px; border-radius: 4px;">
          <calcite-label scale="s">
            Layer Transparency
            <calcite-slider id="layer-opacity-slider" min="0" max="100" value="${Math.round(layer.opacity * 100)}" step="1" label-handles></calcite-slider>
          </calcite-label>
        </div>
        
        <strong style="font-size: 0.9rem;">Legend</strong>
        <div id="legend-container">${legendHTML}</div>

        <hr style="opacity: 0.2; margin: 5px 0;">
        
        <div class="metadata-content" style="font-size: 0.9rem; line-height: 1.4;">
          ${description}
        </div>
      </div>
    `;

    // --- 3. RE-ATTACH SLIDER EVENT ---
    const slider = document.getElementById("layer-opacity-slider");
    slider.addEventListener("calciteSliderInput", (event) => {
      layer.opacity = event.target.value / 100;
    });

    // --- 4. INIT FEATURE LEGEND IF NEEDED ---
    if (layer.visible && layer.type !== "imagery") {
      new Legend({
        view: view,
        layerInfos: [{ layer: layer }],
        container: "standard-legend-node"
      });
    }
  }

  function setupInfoListeners(config) {
    const infoWrapper = document.querySelector(".info-panel");
    const infoPanel = document.getElementById("infoPanel");

    // FIX: The "X" button listener - hides everything and cleans up
    infoPanel.addEventListener("calcitePanelClose", () => {
      infoWrapper.style.display = "none";
      if (visibilityWatcher) visibilityWatcher.remove();
      
      document.querySelectorAll('.layer-row calcite-action').forEach(a => {
        a.active = false;
        a.classList.remove("info-active");
      });
    });

    config.forEach(group => {
      group.items.forEach(item => {
        const infoBtn = document.getElementById(`info-${item.id}`);
        if (!infoBtn) return;

        infoBtn.onclick = async () => {
          const isAlreadyActive = infoBtn.classList.contains("info-active");
          const layer = item.layers[0];

          // Reset all buttons first
          document.querySelectorAll('.layer-row calcite-action').forEach(a => {
            a.active = false;
            a.classList.remove("info-active");
          });

          // FIX: Toggle Logic (If already blue, just close)
          if (isAlreadyActive) {
            infoWrapper.style.display = "none";
            if (visibilityWatcher) visibilityWatcher.remove();
            return;
          }

          // --- OPENING PANEL ---
          infoBtn.active = true;
          infoBtn.classList.add("info-active");
          infoWrapper.style.display = "flex";
          infoPanel.closed = false;

          // Clean up previous watcher before starting a new one
          if (visibilityWatcher) visibilityWatcher.remove();

          // Initial Load
          await updateInfoPanel(item);

          // FIX: Live Legend Watcher
          // When layer visibility changes, just re-run the update function
          visibilityWatcher = layer.watch("visible", () => {
            updateInfoPanel(item);
          });
        };
      });
    });
  }


  // function setupInfoListeners(config) {
  //   const infoWrapper = document.querySelector(".info-panel");
  //   const infoPanel = document.getElementById("infoPanel");
  //   let visibilityWatcher = null;

  //   infoPanel.addEventListener("calcitePanelClose", () => {
  //     infoWrapper.style.display = "flex";
  //     if (infoWrapper) {
  //       infoWrapper.style.display = "none";
  //     }
  //     document.querySelectorAll('.layer-row calcite-action').forEach(a => {
  //       a.active = false;
  //       a.classList.remove("info-active");
  //     });
  //   });

  //   config.forEach(group => {
  //     group.items.forEach(item => {
  //       const infoBtn = document.getElementById(`info-${item.id}`);
  //       if (!infoBtn) return;

  //       infoBtn.onclick = async () => {
  //         const isAlreadyActive = infoBtn.classList.contains("info-active");
  //         const layer = item.layers[0];

  //         // Reset UI
  //         document.querySelectorAll('.layer-row calcite-action').forEach(a => {
  //           a.active = false;
  //           a.classList.remove("info-active");
  //         });

  //         if (isAlreadyActive) {
  //           infoWrapper.style.display = "none";
  //           return;
  //         }

  //         // Ensure the layer is loaded so metadata is populated
  //         if (layer.loadStatus !== "loaded") {
  //           await layer.load();
  //         }

  //         // PRIORITY: 1. Portal Description -> 2. Service Description -> 3. Local Config Fallback
  //         const officialDescription = 
  //           layer.portalItem?.description || 
  //           layer.description || 
  //           layer.serviceDescription || 
  //           item.info || 
  //           "No description available for this layer.";

  //         // Update Panel Content
  //         infoPanel.heading = item.label;
  //         infoPanel.innerHTML = `
  //           <div style="padding: 15px;">
  //             <div class="metadata-content" style="font-size: 0.9rem; line-height: 1.4;">
  //               ${officialDescription}
  //             </div>
  //             <hr style="opacity: 0.2; margin: 15px 0;">
  //             <strong>Legend</strong>
  //             <div style="margin-top: 10px; text-align: center;">
  //                <img src="${layer.url}/legend?f=image" 
  //                     style="max-width: 100%; border: 1px solid #eee;" 
  //                     onerror="this.style.display='none'">
  //             </div>
  //           </div>
  //         `;

  //         // Set Active UI
  //         infoBtn.active = true;
  //         infoBtn.classList.add("info-active");
  //         await updateInfoPanel(item); // Call the helper that uses the Legend widget
  //         infoWrapper.style.display = "flex";
  //         infoPanel.closed = false; 
  //       };
  //     });
  //   });
  // }

  // // Keep a reference to the legend widget so we can destroy/recreate it
  // // let internalLegend = null;

  // async function getRasterLegendHTML(layer) {
  //     try {
  //         const response = await fetch(`${layer.url}/legend?f=pjson`);
  //         const data = await response.json();
          
  //         // Find the specific legend for this layer
  //         const layerLegend = data.layers[0];
  //         if (!layerLegend || !layerLegend.legend) return "Legend not available.";

  //         let html = `<div class="custom-raster-legend">`;
          
  //         layerLegend.legend.forEach(item => {
  //             // item.contentType is usually 'image/png', item.imageData is the base64 string
  //             const imgSrc = `data:${item.contentType};base64,${item.imageData}`;
  //             html += `
  //                 <div style="display: flex; align-items: center; margin-bottom: 4px;">
  //                     <img src="${imgSrc}" style="width: 20px; height: 20px; margin-right: 10px; border: 1px solid #eee;">
  //                     <span style="font-size: 0.85rem;">${item.label || ''}</span>
  //                 </div>`;
  //         });

  //         html += `</div>`;
  //         return html;
  //     } catch (err) {
  //         console.error("Manual legend fetch failed:", err);
  //         return "Unable to load legend.";
  //     }
  // }

  // async function updateInfoPanel(item) {
  //     const infoPanel = document.getElementById("infoPanel");
  //     const layer = item.layers[0];

  //     if (layer.loadStatus !== "loaded") await layer.load();

  //     const description = layer.portalItem?.description || layer.serviceDescription || "No description available.";
      
  //     // --- LEGEND LOGIC START ---
  //     // const legendHTML = layer.type === "imagery" ? await getRasterLegendHTML(layer) : `<div id="standard-legend-node"></div>`;
  //     let legendHTML = "";
      
  //     if (!layer.visible) {
  //         // 1. If the layer is off, show the "Layer Hidden" message
  //         legendHTML = `
  //             <div style="padding: 10px; background: #fff5f5; border: 1px solid #feb2b2; border-radius: 4px; color: #c53030; font-size: 0.85rem; text-align: center;">
  //                 <calcite-icon icon="view-hide" scale="s" style="margin-right: 5px; vertical-align: middle;"></calcite-icon>
  //                 Layer Hidden
  //             </div>`;
  //     } else if (layer.type === "imagery") {
  //         // 2. If it's on and Imagery, fetch the manual legend
  //         legendHTML = await getRasterLegendHTML(layer);
  //     } else {
  //         // 3. If it's on and Feature, prepare the widget node
  //         legendHTML = `<div id="standard-legend-node"></div>`;
  //     }

  //     infoPanel.heading = item.label;
  //     infoPanel.innerHTML = `
  //             <div style="margin-bottom: 1px; background: #f8f8f8; padding: 1px; border-radius: 4px;">
  //                 <calcite-label scale="s">
  //                     Layer Transparency
  //                     <calcite-slider 
  //                         id="layer-opacity-slider" 
  //                         min="0" max="100" 
  //                         value="${Math.round(layer.opacity * 100)}" 
  //                         step="1" 
  //                         label-handles>
  //                     </calcite-slider>
  //                 </calcite-label>
  //             </div>
  //             <div style="padding: 15px; display: flex; flex-direction: column; gap: 15px;">
  //             <strong style="font-size: 0.9rem;">Legend</strong>
  //             <div style="margin-top: 10px;">
  //                 ${legendHTML}
  //             </div>

  //             <hr style="opacity: 0.2; margin: 15px 0;">
  //             <div class="metadata-content" style="max-height: 250px;">
  //                 ${description}
  //             </div>
  //         </div>
  //     `;

  //     // 2. Attach the Slider Event Listener
  //     const slider = document.getElementById("layer-opacity-slider");
  //     slider.addEventListener("calciteSliderChange", (event) => {
  //         // ArcGIS opacity is 0-1, Slider is 0-100
  //         layer.opacity = event.target.value / 100;
  //     });

  //     // If it's a feature layer, we can still use the widget if you prefer
  //     // if (layer.type !== "imagery") {
  //     //     new Legend({
  //     //         view: view,
  //     //         layerInfos: [{ layer: layer }],
  //     //         container: "standard-legend-node"
  //     //     });
  //     // }
  // }

// async function updateInfoPanel(item) {
//     const infoPanel = document.getElementById("infoPanel");
//     const layer = item.layers[0];

//     if (layer.loadStatus !== "loaded") await layer.load();

//     const description = layer.portalItem?.description || layer.serviceDescription || "No description.";
//     const legendHTML = layer.type === "imagery" ? await getRasterLegendHTML(layer) : `<div id="standard-legend-node"></div>`;

//     infoPanel.heading = item.label;
    
//     // Inject Slider + Description + Legend
//     infoPanel.innerHTML = `
//         <div style="padding: 15px;">
//             <div style="margin-bottom: 20px; background: #f8f8f8; padding: 10px; border-radius: 4px;">
//                 <calcite-label scale="s">
//                     Layer Transparency
//                     <calcite-slider 
//                         id="layer-opacity-slider" 
//                         min="0" max="100" 
//                         value="${Math.round(layer.opacity * 100)}" 
//                         step="1" 
//                         label-handles>
//                     </calcite-slider>
//                 </calcite-label>
//             </div>

//             <div class="metadata-content" style="max-height: 200px; overflow-y: auto; margin-bottom: 15px;">
//                 ${description}
//             </div>
            
//             <hr style="opacity: 0.2; margin: 15px 0;">
//             <strong style="font-size: 0.9rem;">Legend</strong>
//             <div style="margin-top: 10px;">${legendHTML}</div>
//         </div>
//     `;



//     // Handle standard legend if not imagery
//     if (layer.type !== "imagery") {
//         new Legend({ view: view, layerInfos: [{ layer: layer }], container: "standard-legend-node" });
//     }
// }


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
          const smokeRenderer = createPercentClipRenderer(0.5, 0.5, smokeColorRamp);
          smokeLayer.renderer = smokeRenderer;
          console.log("Successfully applied custom MultipartColorRamp.");
      }

  }).catch(error => {
      console.error("Error loading ImageryLayer or applying renderer:", error);
  });

  // ============================ ROCKFALL LAYER =============================
  const rockfallLayer = new ImageryTileLayer({
    portalItem: { id: ROCKFALL_LAYER_ITEM_ID },
    opacity: 0.8,
    visible: false,
    title: "Rockfall hazard"
  });

  // APPROACH: CUSTOM COLOR RAMP
  // Wait for the layer to load to ensure rendering can happen correctly
  smokeLayer.load().then(() => {
    // Get the specified Esri Color Ramp
    const rockfallColorRamp = createManualMultipartColorRamp(rockfall);

    if (rockfallColorRamp) {
          const rockfallRenderer = createPercentClipRenderer(75, 0.5, rockfallColorRamp);
          rockfallLayer.renderer = rockfallRenderer;
          console.log("Successfully applied custom MultipartColorRamp.");
      }

  }).catch(error => {
      console.error("Error loading ImageryLayer or applying renderer:", error);
  });

  // ============================ DEBRIS FLOW LAYER =============================
  const debrisLayer = new ImageryTileLayer({
    portalItem: { id: DEBRISF_LAYER_ITEM_ID },
    opacity: 0.9,
    visible: false,
    title: "Rockfall hazard"
  });

  // APPROACH: CUSTOM COLOR RAMP
  // Wait for the layer to load to ensure rendering can happen correctly
  smokeLayer.load().then(() => {
    // Get the specified Esri Color Ramp
    const debrisColorRamp = createManualMultipartColorRamp(debris);

    if (debrisColorRamp) {
          // const debrisRenderer = createPercentClipRenderer(50, 0.5, debrisColorRamp);
      const debrisRenderer = createMinMaxRenderer(0.3, 1.0, debrisColorRamp);
          debrisLayer.renderer = debrisRenderer;
          console.log("Successfully applied custom MultipartColorRamp.");
      }

  }).catch(error => {
      console.error("Error loading ImageryLayer or applying renderer:", error);
  });
  // ============================ EXTREME HEAT LAYER =============================
  const lstLayer = new ImageryTileLayer({
    portalItem: { id: LST_LAYER_ITEM_ID },
    opacity: 0.9,
    visible: false,
    title: "Extreme Heat hazard"
  });

  // APPROACH: CUSTOM COLOR RAMP
  // Wait for the layer to load to ensure rendering can happen correctly
  lstLayer.load().then(() => {
    // Get the specified Esri Color Ramp
    const lstColorRamp = createManualMultipartColorRamp(inferno);
    const lstRenderer = createPercentClipRenderer(0.5, 0.5, lstColorRamp);
    lstLayer.renderer = lstRenderer;
    console.log("Successfully applied custom MultipartColorRamp.");

  }).catch(error => {
      console.error("Error loading ImageryLayer or applying renderer:", error);
  });
  // ============================ NDVI LAYER =============================
  const ndviLayer = new ImageryTileLayer({
    portalItem: { id: NDVI_LAYER_ITEM_ID },
    opacity: 0.7,
    visible: false,
    title: "Drought Susceptibility"
  });

  // APPROACH: CUSTOM COLOR RAMP
  // Wait for the layer to load to ensure rendering can happen correctly
  ndviLayer.load().then(() => {
    // Get the specified Esri Color Ramp
    const ndviColorRamp = createManualMultipartColorRamp(dry); //, dry_positions);
    const ndviRenderer = createMinMaxRenderer(-0.2, 0.2, ndviColorRamp);
    ndviLayer.renderer = ndviRenderer;
    console.log("Successfully applied custom MultipartColorRamp.");

  }).catch(error => {
      console.error("Error loading ImageryLayer or applying renderer:", error);
  });
  // ============================ FLOOD LAYERS =============================
  // --- Flood protection dikes ---
  const dikesLayer = new FeatureLayer({
    portalItem: { id: DIKES_LAYER_ITEM_ID },
    title: "Flood Protection Dikes Layer",
    opacity: 1,
    visible: true,
    popupEnabled: true
  });  

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
          color: [20, 33, 94, 1],
          width: 1
        }
      }
    },
    opacity: 1,
    popupEnabled: true
  });

  const buildingsLayer = new FeatureLayer({
    portalItem: { id: BUILDINGS_ITEM_ID },
    title: "Building Footprints",
    opacity: 1,
    popupEnabled: true
  });


// ============================================================================
//                        Build layers and toggles
// ============================================================================
  // Add layers in desired order:
  layerOrder = [
    buildingsLayer,
    neighbourhoodsLayer, 
    smokeLayer,

    rockfallLayer,
    debrisLayer,
    fuelBreaksLayer,
    fuelMngdLayer,
    fireRiskLayer,
    fireThreatLayer,
    lstLayer, 
    ndviLayer,
    dikesLayer,
    floodExtentLayer,
    floodLayer, 
    ];

  webmap.addMany(layerOrder);

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
    // const legend = new Legend({ view });
    // const legendExpand = new Expand({
    //   view,
    //   content: legend,
    //   expanded: false,
    //   expandTooltip: "Legend"
    // });
    // view.ui.add(legendExpand, "top-left");

    // -------- Scale Bar -------
    const scaleBar = new ScaleBar({
      view,
      unit: "metric",
      // className: "scaleBar"
    });
    // scaleBar.className = "scaleBar";
    view.ui.add(scaleBar, "bottom-right");
    const bottomCenterContainer = document.createElement("div");
    bottomCenterContainer.className = "bottom-center-scalebar";

    view.ui.add(bottomCenterContainer, "manual");
    bottomCenterContainer.appendChild(scaleBar.container);

    // Zoom to flood extent once it’s ready
    floodLayer.when().then(function () {
      if (floodLayer.fullExtent) {
        view.goTo(floodLayer.fullExtent.expand(1.1)).catch(() => {});
      }
    }).catch(function (error) {
      console.error("Flood layer failed to load:", error);
    });

    // -------- Optional: explicitly confirm ordering -------
    webmap.when().then(function () {
      layerOrder.forEach((layer, index) => {
        // webmap.layers.length - 1 is the top position
        const position = webmap.layers.length - (index + 1);
        webmap.reorder(layer, position);
      });
    });
  });

  // --- UI toggles ---
  const uiMappings = [
    {
      category: "RMOW Basemap",
      items: [
        { id: "buildingsToggle", layers: [buildingsLayer], label: "Building Footprints", info: "B" },
        { id: "neighbourhoodsToggle", layers: [neighbourhoodsLayer], label: "Neighbourhoods", info: "N" },
      ]
    },
    {
      category: "Air Quality",
      items: [
        { id: "smokeToggle", layers: [smokeLayer], label: "3-year Smoke PM2.5 Exceedance Days", info: "S" },
      ]
    },
    {
      category: "Landslide",
      items: [
        { id: "rockfallToggle", layers: [rockfallLayer], label: "Rockfall Susceptibility", info: ""},
        { id: "debrisToggle", layers: [debrisLayer], label: "Debris Flow Susceptibility", info: ""},
      ]
    },
    {
      category: "Wildfire",
      items: [
        { id: "fuelBreakToggle", layers: [fuelBreaksLayer, fuelMngdLayer], label: "Fuel Breaks and Fire Managed Areas", info: ""},
        { id: "fireRiskToggle", layers: [fireRiskLayer], label: "Wildfire Risk Class ≥ Moderate", info: ""},
        { id: "fireThreatToggle", layers: [fireThreatLayer], label: "WUI Fire Threat Class ≥ 6", info: ""},
      ]
    },
    {
      category: "Extreme Heat",
      items: [
        { id: "lstToggle", layers: [lstLayer], label: "Extreme Heat hazard", info: ""},
      ]
    },
    {
      category: "Drought",
      items: [
        { id: "ndviToggle", layers: [ndviLayer], label: "Drought Susceptibility", info: "NDVI Anomaly"},
      ]
    },
    {
      category: "Flooding",
      items: [
        { id: "dikesToggle", layers: [dikesLayer], label: "Flood Protection Dikes", info: ""},
        { id: "floodToggle", layers: [floodLayer,floodExtentLayer], label: "Flood hazard", info: ""}
      ]
    },
  ];  


  renderLayerControls(uiMappings, "layerPanel")
  setupInfoListeners(uiMappings)

});