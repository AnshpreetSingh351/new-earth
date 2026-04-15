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

const map = L.map('map', {
  zoomControl: false,
  layers: [satelliteMap],
  attributionControl: false
}).setView([20, 78], 5);


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
// 4. ICONS
// ===============================

const icon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [40, 40]
});

// 🔥 Office special icon
// const officeIcon = L.icon({
//   iconUrl: 'https://cdn-icons-png.flaticon.com/512/484/484167.png', // 🏢 building icon
//   iconSize: [50, 50],
//   className: 'office-marker'
// });

// const officeIcon = L.icon({
//   iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684809.png',
//   iconSize: [55, 55],
//   className: 'office-marker'
// });


// const officeIcon = L.icon({
//   iconUrl: 'logo.png', // your brand logo
//   iconSize: [60, 60],
//   className: 'office-marker'
// });


// ===============================
// 5. DATA
// ===============================

const officeCoords = [30.8722322, 75.8447432];

const places = [
  { name: "MDB London Square", coords: [30.5811009, 76.7106423], type: "project" },
  { name: "CM Infinia", coords: [30.9334374, 75.745526], type: "project" },

  { name: "Airport", coords: [30.6735, 76.7885], type: "nearby" },
  { name: "Hospital", coords: [30.7400, 76.7800], type: "nearby" },
  { name: "School", coords: [30.7280, 76.7750], type: "nearby" }
];


// ===============================
// 6. LAYERS
// ===============================

const projectLayer = L.layerGroup().addTo(map);
const nearbyLayer = L.layerGroup();


// ===============================
// 7. STATE
// ===============================

let activeProject = places.find(p => p.type === "project").coords;
let routeControl = null;
const projectMarkers = [];


// ===============================
// 8. ROUTING SYSTEM
// ===============================

function createRoute(start, end) {

  if (routeControl) {
    map.removeControl(routeControl);
  }

  routeControl = L.Routing.control({
    waypoints: [
      L.latLng(start[0], start[1]),
      L.latLng(end[0], end[1])
    ],
    routeWhileDragging: false,
    addWaypoints: false,
    draggableWaypoints: false,
    show: false,

    lineOptions: {
      styles: [
        {
          color: '#00BFFF',
          weight: 6,
          opacity: 0.9
        }
      ]
    }

  }).addTo(map);
}


// ===============================
// 9. MARKERS
// ===============================

// 🏢 OFFICE (always visible)
// ===============================
// OFFICE (LOGO MARKER - CLEAN)
// ===============================

const officeMarker = L.marker(officeCoords, {
  icon: L.divIcon({
    className: "custom-office-marker",
    html: `<div class="office-logo"></div>`,
    iconSize: [160, 60] // adjust if needed
  })
}).addTo(map);

officeMarker
  .bindTooltip("BetterSide Office", { direction: "top" })
  .bindPopup("<b>BetterSide Office</b><br>Visit us here");

officeMarker.on('click', () => {
  map.flyTo(officeCoords, 16, { duration: 2 });
  officeMarker.openPopup();
});


// 🗺 OTHER MARKERS
places.forEach(place => {

  const marker = L.marker(place.coords, { icon })
    .bindTooltip(place.name, {
      direction: "top",
      offset: [0, -10]
    });

  // 🏢 PROJECT
  if (place.type === "project") {

    marker.addTo(projectLayer);

    marker.bindPopup(`<b>${place.name}</b><br>Main Project`);

    projectMarkers.push(marker);

    marker.on('click', () => {
      activeProject = place.coords;

      map.flyTo(place.coords, 18, { duration: 2 });
      marker.openPopup();

      map.addLayer(nearbyLayer);
    });

  }

  // 📍 NEARBY
  else {

    marker.addTo(nearbyLayer);

    marker.on('click', () => {
      createRoute(place.coords, activeProject);

      map.fitBounds([
        place.coords,
        activeProject
      ]);
    });

  }

});


// ===============================
// 10. ZOOM BEHAVIOR
// ===============================

map.on('zoomend', () => {

  if (map.getZoom() < 12) {

    map.removeLayer(nearbyLayer);

    if (routeControl) {
      map.removeControl(routeControl);
      routeControl = null;
    }

  } else {

    if (!map.hasLayer(nearbyLayer)) {
      map.addLayer(nearbyLayer);
    }

  }

});


// ===============================
// 11. CLICK OUTSIDE → REMOVE ROUTE
// ===============================

map.on('click', () => {
  if (routeControl) {
    map.removeControl(routeControl);
    routeControl = null;
  }
});


// ===============================
// 12. PANEL CONTROL
// ===============================

function focusProject(index) {

  const project = places.filter(p => p.type === "project")[index];
  const marker = projectMarkers[index];

  if (!project || !marker) return;

  activeProject = project.coords;

  map.flyTo(project.coords, 18, { duration: 2 });

  map.addLayer(nearbyLayer);

  marker.openPopup();
}