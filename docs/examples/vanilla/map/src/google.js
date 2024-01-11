export const initMap = ({ selector, center, zoom, ...opts }) => {
  if (!window.google) throw Error('Google API sdk not found');

  const mapEl = document.querySelector(selector);
  return new window.google.maps.Map(mapEl, {
    center,
    zoom,
    ...opts,
  });
};
