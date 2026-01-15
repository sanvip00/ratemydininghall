// maptest.js
let map;

async function initMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  const lat = Number(mapEl.getAttribute("data-lat")) || 39.9526;  // default Philly
  const lng = Number(mapEl.getAttribute("data-lng")) || -75.1652;

  const position = { lat, lng };

  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  map = new Map(mapEl, {
    zoom: 14,
    center: position,
  });

  new AdvancedMarkerElement({
    map,
    position,
    title: "Dining Hall",
  });
}

window.initMap = initMap;
