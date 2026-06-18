
// Extracts postcode and geocodes based off it - so ALL addresses work.
function cleanAddress(address) {
    const postcode = address.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/i);
    return postcode ? postcode[0] : address.split(',').slice(-2).join(',');
}

// CACHE GEOCODED LOCATIONS IN BROWSER - prevents site from re-geocoding each location everytime page is reloaded so no rate limit!!!
const key = "geocode_cache";
const cache = JSON.parse(localStorage.getItem(key) || "{}");

function saveLocation() {
    localStorage.setItem(key, JSON.stringify(cache));

}
document.addEventListener('DOMContentLoaded', async () => {

    // Loads map
    var map = L.map('map-container');
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 11,
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Setting map view to Ladywood
    map.setView([52.4828, -1.9165], 12);


    // Map marker
    var sproutMarker = L.icon({
        iconUrl: '/assets/sprout.png',

        iconSize: [70, 70],
        iconAnchor: [50, 70],
        popupAnchor: [-3, -76]

    });

    // Nominatim geocoding api
    const geocoder = L.Control.Geocoder.nominatim();

    // Gets latitude and longitude bounds for Ladywood
    const bounds = L.latLngBounds();
    const spaces = window.growingSpaces || []; // Array of growing spaces
    for (const s of spaces) {
        const cleanAddr = cleanAddress(s.address);

        var latLng = cache[cleanAddr];

        if(!latLng){
            const res = await geocoder.geocode(cleanAddr);
            if(!res?.length) continue;

            latLng = res[0].center;
            cache[cleanAddr] = {
                lat: latLng.lat,
                lng: latLng.lng
            };
            saveLocation();
        }

        L.marker(latLng, { icon: sproutMarker }).addTo(map)
                .bindPopup(`<b>${s.place_name}</b><br>${s.address}<br>
                        <a href="/plotInfo?plot=${s.spaceid}"> View Space </a>`); // Popup shows place name, address and link
            // to its information page.


        
        bounds.extend(latLng);


    }

});