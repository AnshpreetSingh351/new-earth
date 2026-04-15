// ===============================
// 1. BASE MAP LAYERS
// ===============================

const normalMap = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  { attribution: '' }
);

const satelliteMap = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { attribution: '' }
);

const darkMap = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  { attribution: '' }
);


// ===============================
// 2. MAP INITIALIZATION
// ===============================

const projectCoords = [30.5785991, 76.7120484];

const map = L.map('map', {
  zoomControl: false,
  layers: [satelliteMap] // default view
}).setView(projectCoords, 14);


// ===============================
// 3. LAYER CONTROL
// ===============================

const baseMaps = {
  "Normal": normalMap,
  "Satellite": satelliteMap,
  "Dark": darkMap
};

L.control.layers(baseMaps).addTo(map);


// ===============================
// 4. CUSTOM ICON
// ===============================

const icon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [40, 40]
});


// ===============================
// 5. LOCATIONS DATA
// ===============================

const places = [
  { name: "My Project", coords: projectCoords },
  { name: "Airport", coords: [30.6735, 76.7885] },
  { name: "Hospital", coords: [30.7400, 76.7800] },
  { name: "School", coords: [30.7280, 76.7750] }
];


// ===============================
// 6. ADD MARKERS
// ===============================

places.forEach(place => {

  const marker = L.marker(place.coords, { icon })
    .addTo(map)
    .bindTooltip(place.name, {
      direction: "top",
      offset: [0, -10]
    });

  // 🎯 Special behavior for project
  if (place.name === "My Project") {

    marker.bindPopup("<b>My Project</b><br>Main Location");

    marker.on('click', () => {
      map.flyTo(place.coords, 18, {
        duration: 2
      });
      marker.openPopup();
    });

  }

});


// ===============================
// 7. CINEMATIC INTRO ANIMATION
// ===============================

setTimeout(() => {

  // Step 1 — zoomed out
  map.setView([20, 78], 5);

  setTimeout(() => {

    // Step 2 — move closer
    map.flyTo(projectCoords, 10, {
      duration: 3
    });

    setTimeout(() => {

      // Step 3 — final zoom
      map.flyTo(projectCoords, 14, {
        duration: 2
      });

    }, 3000);

  }, 1000);

}, 500);