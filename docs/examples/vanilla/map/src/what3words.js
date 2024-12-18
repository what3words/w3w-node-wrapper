import what3words, { axiosTransport, ApiVersion } from '@what3words/api';
import { initMap } from './google';

// SETUP
const DEFAULT_MAP_CENTER = { lat: 51.52086, lng: -0.195499 };
const MAP_SELECTOR = 'div#w3w-map';
const MAP_ZOOM = 20;
const THREE_WORD_ADDRESS = 'filled.count.soap';
const W3W_API_KEY = process.env.W3W_API_KEY;
const W3W_API_ENDPOINT = process.env.W3W_API_ENDPOINT;
const GOOGLE_API_KEY = process.env.W3W_MAP_API_KEY;

if (!GOOGLE_API_KEY) throw new Error('Missing Google Maps API key');

// Dynamically load google maps API - must attach to DOM after callback is defined
const googleScript = document.createElement('script');
googleScript.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&callback=init`;
googleScript.async = true;

let address,
  div,
  input,
  grid = [],
  languages,
  map,
  mapCenter;

function getControls() {
  div = document.createElement('div');
  input = document.createElement('input');

  // Add element styling
  div.style.margin = '50px';
  div.style.display = 'flex';
  div.style.flexDirection = 'column';
  div.style.flexGrow = 1;
  input.style.lineHeight = '25px';
  input.style.minWidth = '250px';

  // Add input attributes
  input.type = 'text';
  input.index = 1;

  div.appendChild(input);
  return div;
}

function clearGrid() {
  if (grid) grid.forEach(g => g.setMap(null));
}

function getGrid() {
  // Zoom level is high enough
  const ne = map.getBounds().getNorthEast();
  const sw = map.getBounds().getSouthWest();

  // Call the what3words Grid API to obtain the grid squares within the current visible bounding box
  return window.what3words
    .gridSection({
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
    })
    .catch(err => {
      const {
        details: { code, message },
      } = err;
      console.error(`Error retrieving grid sections - ${code}: ${message}`);
    });
}

function onMapClick(e) {
  const latLng = e.latLng.toJSON();
  // Convert a coordinate to a three word address
  window.what3words.convertTo3wa({ coordinates: latLng }).then(res => {
    plot3wa(res);
    if (map.getZoom() < 20) {
      map.panTo(res.coordinates);
      map.setZoom(20);
    }
  });
}

function plot3wa(new3wa) {
  if (!new3wa) return;
  const { square, words } = new3wa;
  if (address) address.setMap(null);

  address = new google.maps.Rectangle({
    bounds: new google.maps.LatLngBounds(square.southwest, square.northeast),
    strokeWeight: 1,
    fillColor: '#0A3049',
    strokeColor: '#0A3049',
    strokePosition: google.maps.StrokePosition.INSIDE,
  });
  input.value = '///' + words;
  address.setMap(map);
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
 * Make use of google maps script callback functionality to load the app
 */
window.init = function () {
  if (!W3W_API_KEY) throw new Error('Invalid or missing what3words API key.');

  window.what3words = what3words(
    W3W_API_KEY,
    { apiVersion: ApiVersion.Version3, host: W3W_API_ENDPOINT },
    { transport: axiosTransport() }
  );

  // Retrieve and print out supported languages
  window.what3words.availableLanguages().then(res => {
    languages = res.languages;
  });

  // Retrieve coordinates for initial three word address
  window.what3words
    .convertToCoordinates({ words: THREE_WORD_ADDRESS })
    .then(res => {
      mapCenter = res.coordinates;
    })
    .catch(err => {
      const {
        details: { code, message },
      } = err;
      console.error(
        `Error converting 3wa to coordinates - ${code}: ${message}`
      );
    })
    .finally(() => {
      // Initialise map instance
      map = initMap({
        selector: MAP_SELECTOR,
        center: mapCenter || DEFAULT_MAP_CENTER,
        zoom: MAP_ZOOM,
      });

      const controls = getControls();
      map.controls[google.maps.ControlPosition.TOP_CENTER].push(controls);
      map.addListener('bounds_changed', e => {
        const zoom = map.getZoom();
        clearGrid();
        if (zoom > 15) getGrid(map).then(grid => grid && plotGrid(grid));
      });
      map.addListener('click', onMapClick);
    });
};

// Append google script to head
document.head.appendChild(googleScript);
