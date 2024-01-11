import what3words, { axiosTransport, ApiVersion } from '@what3words/api';
import { initMap } from './google';

// SETUP
const W3W_API_KEY = 'TSTSTSTS'; //TODO: Add your what3words API key here
const MAP_SELECTOR = 'div#w3w-map';
const MAP_CENTER = { lat: 51.52086, lng: -0.195499 };
const MAP_ZOOM = 20;

// DECLARATIONS
window.what3words = null;
let grid = [];
let map = null;

function clearGrid() {
  if (grid) grid.forEach(g => g.setMap(null));
}

function getGrid() {
  // Zoom level is high enough
  const ne = map.getBounds().getNorthEast();
  const sw = map.getBounds().getSouthWest();

  // Call the what3words Grid API to obtain the grid squares within the current visble bounding box
  return window.what3words.gridSection({
    boundingBox: {
      southwest: {
        lat: sw.lat(),
        lng: sw.lng(),
      },
      northeast: {
        lat: ne.lat(),
        lng: ne.lng(),
      },
    },
  });
}

function plotGrid(newGrid) {
  if (!grid) return;

  const { lines } = newGrid;
  lines.forEach(line => {
    const lineCoords = [
      { lat: line.start.lat, lng: line.start.lng },
      { lat: line.end.lat, lng: line.end.lng },
    ];
    const gridline = new google.maps.Polyline({
      path: lineCoords,
      geodesic: false,
      strokeWeight: 1,
      strokeOpacity: 0.1,
      fillColor: '#0A3049',
      strokeColor: '#0A3049',
      strokePosition: google.maps.StrokePosition.CENTER,
    });
    gridline.setMap(map);
    grid.push(gridline);
  });
}

/**
 * This script should be run after the w3w script tags have loaded
 */
(function loader() {
  window.what3words = what3words(
    W3W_API_KEY,
    { apiVersion: ApiVersion.Version3 },
    { transport: axiosTransport() }
  );
  map = initMap({
    selector: MAP_SELECTOR,
    center: MAP_CENTER,
    zoom: MAP_ZOOM,
  });

  map.addListener('bounds_changed', e => {
    const zoom = map.getZoom();
    clearGrid();
    if (zoom > 15) getGrid(map).then(plotGrid);
  });
})();
