export const initMap = ({ selector, center, zoom, ...opts }) => {
  const mapEl = document.querySelector(selector);
  return new google.maps.Map(mapEl, {
    center,
    zoom,
    ...opts,
  });
};
