// ── URL PARAM ────────────────────────────────────────────────
const params = new URLSearchParams(window.location.search);
const locKey = params.get('location') || 'punjab';

// ── CONFIG ───────────────────────────────────────────────────
const LOCATION_CONFIGS = {

  punjab: {
    center: [78, 20],
    zoom: 4,
    projects: [
      {
        name: "London Square",
        coords: [76.7106423, 30.5811009],
        modelUrl: "London_Square.glb",
        transform: {
          position: [23, -60, -50],
          rotation: [Math.PI / 2, 0, 0],
          scale: [1, 1, 1]
        }
      }
    ]
  },

  canada: {
    center: [-122.4935, 52.9799],
    zoom: 4,
    projects: [
      {
        name: "442 Kinchant St",
        coords: [-122.4935506, 52.9799497],
        modelUrl: "house.glb",
        zoom: 18,
        roadName: "Kinchant Street", // 🔥 ADD THIS

        transform: {
          position: [0, 0, -50], // 🔥 change this to move model
          rotation: [Math.PI / 2, 0, 0],
          scale: [1, 1, 1]
        }
      }
    ]
  }

};

// ── GLOBALS ──────────────────────────────────────────────────
const locConf = LOCATION_CONFIGS[locKey] || LOCATION_CONFIGS.punjab;
const projects = locConf.projects;

let map, scene, camera, renderer, model;
let currentProject = null;

// ── INIT ─────────────────────────────────────────────────────
window.onload = () => {

  map = new maplibregl.Map({
    container: 'map',
    // style: {
    //   version: 8,
    //   sources: {

    //     // 🛰 SATELLITE
    //     satellite: {
    //       type: "raster",
    //       tiles: [
    //         "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    //       ],
    //       tileSize: 256
    //     },

    //     // 🛣 ROADS + LABELS
    //     osm: {
    //       type: "vector",
    //       url: "https://demotiles.maplibre.org/tiles/tiles.json"
    //     }

    //   },

    //   layers: [

    //     // 🛰 base
    //     {
    //       id: "satellite",
    //       type: "raster",
    //       source: "satellite"
    //     },
    //     {
    //       id: "road-glow",
    //       type: "line",
    //       source: "osm",
    //       "source-layer": "transportation",
    //       paint: {
    //         "line-color": "#00BFFF",
    //         "line-width": [
    //           "interpolate",
    //           ["linear"],
    //           ["zoom"],
    //           10, 3,
    //           15, 8,
    //           20, 14
    //         ],
    //         "line-opacity": 0.2
    //       }
    //     },
    //     // 🛣 roads
    //     {
    //       id: "roads",
    //       type: "line",
    //       source: "osm",
    //       "source-layer": "transportation",
    //       paint: {
    //         "line-color": "#00BFFF",   // 🔥 bright blue
    //         "line-width": [
    //           "interpolate",
    //           ["linear"],
    //           ["zoom"],
    //           10, 1,
    //           15, 3,
    //           20, 6
    //         ],
    //         "line-opacity": 0.9
    //       }
    //     },

    //     // 🏙 buildings (optional)
    //     {
    //       id: "buildings",
    //       type: "fill",
    //       source: "osm",
    //       "source-layer": "building",
    //       paint: {
    //         "fill-color": "#888",
    //         "fill-opacity": 0.3
    //       }
    //     }

    //   ]
    // },


    style: {
      version: 8,
      sources: {

        // 🛰 Satellite
        satellite: {
          type: "raster",
          tiles: [
            "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          ],
          tileSize: 256
        },

        // 🛣 Roads overlay (raster labels)
        roads: {
          type: "raster",
          tiles: [
            "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
          ],
          tileSize: 256
        }

      },

      layers: [

        // base satellite
        {
          id: "satellite",
          type: "raster",
          source: "satellite"
        },

        // roads overlay
        {
          id: "roads",
          type: "raster",
          source: "roads",
          paint: {
            "raster-opacity": 0.9
          }
        }

      ]
    },
    center: locConf.center,
    zoom: locConf.zoom
  });

  map.addControl(new maplibregl.NavigationControl());

  setupProjects();
  setupThreeLayer();
  buildPanel();
};

// ── PANEL ────────────────────────────────────────────────────
function buildPanel() {
  const container = document.getElementById('project-buttons');
  container.innerHTML = '';

  projects.forEach((project, i) => {
    const btn = document.createElement('button');
    btn.textContent = project.name;
    btn.onclick = () => focusProject(i);
    container.appendChild(btn);
  });
}

// ── MARKERS ──────────────────────────────────────────────────
function setupProjects() {
  projects.forEach((project, i) => {

    const el = document.createElement('div');
    el.className = 'marker';

    new maplibregl.Marker({ element: el })
      .setLngLat(project.coords)
      .addTo(map)
      .getElement()
      .addEventListener('click', () => focusProject(i));
  });
}
function showNearbyRoad(project) {

  const coords = project.coords;

  // remove old
  if (map.getLayer('road-label')) {
    map.removeLayer('road-label');
    map.removeSource('road-label');
  }

  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: coords
        },
        properties: {
          name: project.roadName || "Nearby Road"
        }
      }
    ]
  };

  map.addSource('road-label', {
    type: 'geojson',
    data: geojson
  });

  // 📝 ONLY TEXT
  map.addLayer({
    id: 'road-label',
    type: 'symbol',
    source: 'road-label',
    layout: {
      'text-field': ['get', 'name'],
      'text-size': 14,
      'text-offset': [0, -2],
      'text-anchor': 'top'
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#000',
      'text-halo-width': 2
    }
  });
}
// ── CAMERA MOVE ──────────────────────────────────────────────
function focusProject(index) {

  const project = projects[index];
  currentProject = project;

  map.flyTo({
    center: project.coords,
    zoom: project.zoom || 17,
    pitch: 85,
    bearing: -10
  });

  loadModel(project);

  // 🔥 show nearby road
  showNearbyRoad(project);
}
function drawInfoLine(start, end, text) {

  // remove old
  if (map.getLayer('info-line')) {
    map.removeLayer('info-line');
    map.removeSource('info-line');
  }
  if (map.getLayer('info-text')) {
    map.removeLayer('info-text');
  }

  const geojson = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [start, end]
        }
      },
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            (start[0] + end[0]) / 2,
            (start[1] + end[1]) / 2
          ]
        },
        properties: {
          title: text
        }
      }
    ]
  };

  map.addSource('info-line', {
    type: 'geojson',
    data: geojson
  });

  // 🔵 line
  map.addLayer({
    id: 'info-line',
    type: 'line',
    source: 'info-line',
    paint: {
      'line-color': '#00BFFF',
      'line-width': 4
    }
  });

  // 📝 text label
  map.addLayer({
    id: 'info-text',
    type: 'symbol',
    source: 'info-line',
    layout: {
      'text-field': ['get', 'title'],
      'text-size': 14,
      'text-offset': [0, -1],
      'text-anchor': 'top'
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': '#000000',
      'text-halo-width': 2
    }
  });
}
// ── THREE LAYER ──────────────────────────────────────────────
function setupThreeLayer() {

  map.on('load', () => {

    const customLayer = {

      id: '3d-model',
      type: 'custom',
      renderingMode: '3d',

      onAdd(map, gl) {

        camera = new THREE.Camera();
        scene = new THREE.Scene();

        scene.add(new THREE.AmbientLight(0xffffff, 1.5));

        const dir = new THREE.DirectionalLight(0xffffff, 5);
        dir.position.set(100, 200, 100);
        scene.add(dir);

        renderer = new THREE.WebGLRenderer({
          canvas: map.getCanvas(),
          context: gl,
          antialias: true
        });

        renderer.autoClear = false;
      },

      render(gl, matrix) {

        if (!model || !currentProject) return;

        const mercator = maplibregl.MercatorCoordinate.fromLngLat(
          currentProject.coords,
          50
        );

        const scale = mercator.meterInMercatorCoordinateUnits();

        const m = new THREE.Matrix4().fromArray(matrix);

        const t = currentProject.transform || {};
        const pos = t.position || [0, 0, 0];

        const transform = new THREE.Matrix4()
          .makeTranslation(
            mercator.x + pos[0] * scale,
            mercator.y + pos[1] * scale,
            mercator.z + pos[2] * scale
          )
          .scale(new THREE.Vector3(scale, -scale, scale));

        camera.projectionMatrix = m.multiply(transform);

        renderer.resetState();
        renderer.render(scene, camera);
        map.triggerRepaint();
      }
    };

    map.addLayer(customLayer);
  });
}

// ── MODEL LOADER ─────────────────────────────────────────────
function loadModel(project) {

  const loader = new THREE.GLTFLoader();

  if (model) scene.remove(model);

  loader.load(project.modelUrl, (gltf) => {

    model = gltf.scene;

    const t = project.transform || {};

    model.rotation.set(...(t.rotation || [0, 0, 0]));
    model.scale.set(...(t.scale || [1, 1, 1]));

    scene.add(model);

    console.log("Loaded:", project.name);
  });
}