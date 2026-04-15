// ✅ STEP 1 — Define base layers FIRST

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



// ✅ STEP 2 — Initialize map AFTER layers exist

const map = L.map('map', {
  zoomControl: false,
  layers: [satelliteMap] // now it exists ✅
}).setView([30.5785991, 76.7120484], 14);



// ✅ STEP 3 — Layer control

const baseMaps = {
  "Normal": normalMap,
  "Satellite": satelliteMap,
  "Dark": darkMap
};

L.control.layers(baseMaps).addTo(map);



// ✅ STEP 4 — Icon

const icon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [40, 40]
});



// ✅ STEP 5 — Markers

const places = [
  { name: "My Project", coords: [30.5785991, 76.7120484] },
  { name: "Airport", coords: [30.6735, 76.7885] },
  { name: "Hospital", coords: [30.7400, 76.7800] },
  { name: "School", coords: [30.7280, 76.7750] }
];

// places.forEach(place => {
//   L.marker(place.coords, { icon })
//     .addTo(map)
//     .bindTooltip(place.name, {
//       direction: "top",
//       offset: [0, -10]
//     });
// });



// ✅ STEP 6 — Animation

// map.flyTo([30.5785991, 76.7120484], 18, {
//   duration: 2
// });

places.forEach(place => {

  const marker = L.marker(place.coords, { icon })
    .addTo(map)
    .bindTooltip(place.name, {
      direction: "top",
      offset: [0, -10]
    });

  // 🎯 Special behavior for "My Project"
  // if (place.name === "My Project") {
  //   marker.on('click', () => {
  //     map.flyTo(place.coords, 18, {
  //       duration: 2
  //     });

  //     marker.bindPopup("<b>My Project</b><br>Main Location").openPopup();
  //   });
  // }

  if (place.name === "My Project") {

  marker.bindPopup("<b>My Project</b><br>Main Location");

  marker.on('click', () => {
    map.flyTo(place.coords, 18, { duration: 2 });
    marker.openPopup();
  });

}

});
