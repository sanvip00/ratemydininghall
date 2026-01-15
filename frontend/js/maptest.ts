// maptest.ts
let map: google.maps.Map;

export async function initMap(): Promise<void> {
  const mapEl = document.getElementById("map") as HTMLElement | null;
  if (!mapEl) return;

  const lat = Number(mapEl.getAttribute("data-lat")) || 39.9526;
  const lng = Number(mapEl.getAttribute("data-lng")) || -75.1652;

  const position = { lat, lng };

  const { Map } = (await google.maps.importLibrary("maps")) as google.maps.MapsLibrary;
  const { AdvancedMarkerElement } = (await google.maps.importLibrary("marker")) as google.maps.MarkerLibrary;

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

// If you’re not bundling TS, don’t call this directly in-browser.
// Call initMap() from your bundler build output.
