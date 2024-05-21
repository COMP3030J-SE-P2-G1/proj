let map;
let marker;
let geocoder;

function initMap() {
    const lat = parseFloat(document.getElementById('lat').value) || 53.3067;
    const lon = parseFloat(document.getElementById('lon').value) || -6.2269;

    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: lat, lng: lon},
        zoom: 8
    });

    marker = new google.maps.Marker({
        map: map,
        position: map.getCenter()
    });

    geocoder = new google.maps.Geocoder();

    map.addListener('click', function (event) {
        updateMarker(event.latLng.lat(), event.latLng.lng());
    });
}

function updateMarker(lat, lng) {
    const location = {lat: lat, lng: lng};
    map.setCenter(location);
    marker.setPosition(location);

    // 将经纬度填入到 lon 和 lat 输入框中
    document.getElementById('lon').value = lng;
    document.getElementById('lat').value = lat;
}

function geocodeAddress(event) {
    event.preventDefault(); // Prevent default form submission behavior

    const address = document.getElementById('address').value;

    geocoder.geocode({'address': address}, function (results, status) {
        if (status === 'OK') {
            const location = results[0].geometry.location;
            updateMarker(location.lat(), location.lng());
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}

