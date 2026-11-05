let map = null;
let currentTrip = null;
let selectedRating = 5;
let animationInterval = null;

let originMarker = null;
let destMarker = null;
let driverMarker = null;
let routeLine = null;

const LOCATIONS = {
    plaza: { name: 'Plaza Principal', lat: -11.5205, lng: -75.9085 },
    mercado: { name: 'Mercado Central', lat: -11.5240, lng: -75.9120 },
    estacion: { name: 'Estación Distrital', lat: -11.5160, lng: -75.9040 },
    hospital: { name: 'Hospital Distrital', lat: -11.5300, lng: -75.9150 },
    alamos: { name: 'Av. Los Álamos Mz. B', lat: -11.5280, lng: -75.9010 },
    industrial: { name: 'Zona Industrial', lat: -11.5120, lng: -75.9180 }
};

document.addEventListener('DOMContentLoaded', () => {
    initMap();
});

function initMap() {
    map = L.map('map', { zoomControl: true }).setView([-11.5205, -75.9085], 14);

    // Servidor Esri World Street Map (Libre de bloqueos 403)
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri'
    }).addTo(map);

    setTimeout(() => map.invalidateSize(), 200);
}

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    if (map) setTimeout(() => map.invalidateSize(), 150);
}

// RENDERIZAR LISTA DE CHOFERES PARA EL PASAJERO
function renderPassengerDriversList() {
    const container = document.getElementById('passengerDriversList');
    container.innerHTML = '';

    driversDB.forEach(driver => {
        container.innerHTML += `
            <div class="driver-item-card" onclick="selectDriverForTrip(${driver.id})">
                <div>
                    <strong>${driver.name}</strong>
                    <div style="font-size:0.75rem; color:#94a3b8;">${driver.vehicle} (${driver.plate})</div>
                    <div style="color:#f59e0b; font-size:0.8rem; margin-top:2px;">⭐ ${driver.rating} (${driver.reviews.length} reseñas)</div>
                </div>
                <button class="btn btn-primary" style="padding:6px 12px; font-size:0.8rem;">Pedir</button>
            </div>
        `;
    });
}

// SELECCIONAR CHOFER Y SOLICITAR VIAJE
function selectDriverForTrip(driverId) {
    const driver = driversDB.find(d => d.id === driverId);
    const origKey = document.getElementById('selectOrigin').value;
    const destKey = document.getElementById('selectDestination').value;

    currentTrip = {
        passenger: currentUser.name,
        driver: driver,
        origin: LOCATIONS[origKey],
        destination: LOCATIONS[destKey],
        status: 'in_progress'
    };

    document.getElementById('activeDriverCard').innerHTML = `
        <div class="driver-avatar"><i class="fa-solid fa-car-side"></i></div>
        <div>
            <h4>${driver.name} (⭐ ${driver.rating})</h4>
            <p style="font-size:0.8rem; color:#94a3b8;">${driver.vehicle} - Placa: ${driver.plate}</p>
        </div>
    `;

    document.getElementById('ratingSection').style.display = 'none';
    document.getElementById('btnCancelTrip').style.display = 'block';

    switchScreen('screen-trip-status');
    updateMapRoute();
    simulateDriverApproaching();
}

function updateMapRoute() {
    if (originMarker) map.removeLayer(originMarker);
    if (destMarker) map.removeLayer(destMarker);
    if (routeLine) map.removeLayer(routeLine);

    const orig = currentTrip.origin;
    const dest = currentTrip.destination;

    originMarker = L.marker([orig.lat, orig.lng]).addTo(map).bindPopup("Tu ubicación");
    destMarker = L.marker([dest.lat, dest.lng]).addTo(map).bindPopup("Destino");

    routeLine = L.polyline([[orig.lat, orig.lng], [dest.lat, dest.lng]], { color: '#0284c7', weight: 4, dashArray: '8, 8' }).addTo(map);
    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
}

function simulateDriverApproaching() {
    const badge = document.getElementById('tripStatusBadge');
    badge.innerText = 'Tu chofer está en camino...';

    const orig = currentTrip.origin;
    const startLat = orig.lat + 0.005;
    const startLng = orig.lng + 0.005;

    if (driverMarker) map.removeLayer(driverMarker);

    const carIcon = L.divIcon({
        className: 'car-icon',
        html: '<div style="font-size: 24px; color: #0284c7;"><i class="fa-solid fa-car-side"></i></div>',
        iconSize: [30, 30]
    });

    driverMarker = L.marker([startLat, startLng], { icon: carIcon }).addTo(map);

    const steps = 50;
    const deltaLat = (orig.lat - startLat) / steps;
    const deltaLng = (orig.lng - startLng) / steps;
    let step = 0;

    if (animationInterval) clearInterval(animationInterval);

    animationInterval = setInterval(() => {
        step++;
        driverMarker.setLatLng([startLat + (deltaLat * step), startLng + (deltaLng * step)]);

        if (step >= steps) {
            clearInterval(animationInterval);
            badge.innerText = '¡Viaje Finalizado!';
            badge.style.backgroundColor = '#22c55e';
            document.getElementById('ratingSection').style.display = 'block';
            document.getElementById('btnCancelTrip').style.display = 'none';
        }
    }, 100);
}

// CALIFICACIÓN Y COMENTARIOS DEL PASAJERO
function setRating(stars) {
    selectedRating = stars;
    const elements = document.querySelectorAll('.star-rating span');
    elements.forEach((el, idx) => {
        el.classList.toggle('selected', idx < stars);
    });
}

function submitRating() {
    const comment = document.getElementById('tripComment').value.trim();
    if (currentTrip && currentTrip.driver) {
        currentTrip.driver.reviews.push({
            passenger: currentUser.name,
            stars: selectedRating,
            comment: comment || 'Sin comentario'
        });
        alert('¡Gracias por calificar el viaje!');
    }
    cancelTrip();
}

function cancelTrip() {
    if (animationInterval) clearInterval(animationInterval);
    if (driverMarker) map.removeLayer(driverMarker);
    if (originMarker) map.removeLayer(originMarker);
    if (destMarker) map.removeLayer(destMarker);
    if (routeLine) map.removeLayer(routeLine);

    currentTrip = null;
    switchScreen('screen-passenger-trip');
}

// DONTROL DEL PANEL DEL CONDUCTOR (RESEÑAS Y NOTIFICACIONES)
function renderDriverDashboard() {
    document.getElementById('driverProfileName').innerText = currentUser.name;
    document.getElementById('driverProfileRating').innerText = `⭐ ${currentUser.rating} (${currentUser.tripsCount} viajes)`;

    // Cargar comentarios
    const reviewsContainer = document.getElementById('driverReviewsList');
    reviewsContainer.innerHTML = '';

    if (currentUser.reviews.length === 0) {
        reviewsContainer.innerHTML = '<p class="empty-state">Aún no tienes comentarios de clientes.</p>';
    } else {
        currentUser.reviews.forEach(r => {
            reviewsContainer.innerHTML += `
                <div class="review-card">
                    <strong>${r.passenger} (⭐ ${r.stars})</strong>
                    <p>${r.comment}</p>
                </div>
            `;
        });
    }

    // Notificaciones activas
    const notifContainer = document.getElementById('driverNotificationsList');
    if (currentTrip && currentTrip.driver.id === currentUser.id) {
        notifContainer.innerHTML = `
            <div class="notification-card">
                <div>
                    <strong>Pasajero: ${currentTrip.passenger}</strong>
                    <p style="font-size:0.75rem; color:#94a3b8;">Hacia: ${currentTrip.destination.name}</p>
                </div>
                <span class="badge">EN CURSO</span>
            </div>
        `;
    } else {
        notifContainer.innerHTML = '<p class="empty-state">No hay solicitudes pendientes en el distrito.</p>';
    }
}