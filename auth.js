// --- BASE DE DATOS LOCAL / ESTADO DE AUTENTICACIÓN ---
let currentUser = null;

// Base de Datos Central de Conductores y Cuentas
let driversDB = [
    {
        id: 1,
        name: 'Carlos Mendoza',
        email: 'carlos.mendoza@distritogo.pe',
        password: 'driver123',
        vehicle: 'Bajaj Mototaxi VIP',
        plate: '4582-3F',
        rating: 4.9,
        tripsCount: 124,
        reviews: [
            { passenger: 'Maria del Carmen', stars: 5, comment: 'Excelente servicio, muy puntual y amable.' },
            { passenger: 'Jorge L.', stars: 5, comment: 'Maneja con mucha precaución.' }
        ]
    },
    {
        id: 2,
        name: 'Luis Quispe',
        email: 'luis.quispe@distritogo.pe',
        password: 'driver123',
        vehicle: 'Auto Hyundai Atos',
        plate: '7192-8A',
        rating: 4.8,
        tripsCount: 88,
        reviews: [
            { passenger: 'Ana P.', stars: 4, comment: 'Buen viaje, auto limpio.' }
        ]
    }
];

// Cambiar entre pestañas de Login
function switchLoginTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (tab === 'passenger') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('form-login-passenger').style.display = 'block';
        document.getElementById('form-login-staff').style.display = 'none';
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('form-login-passenger').style.display = 'none';
        document.getElementById('form-login-staff').style.display = 'block';
    }
}

// Login de Pasajero
function handlePassengerLogin(e) {
    e.preventDefault();
    const name = document.getElementById('passengerName').value.trim();
    const phone = document.getElementById('passengerPhone').value.trim();

    currentUser = { role: 'passenger', name, phone };
    showAppForUser();
}

// Login para Jefe / Admin o Conductor
function handleStaffLogin(e) {
    e.preventDefault();
    const email = document.getElementById('staffEmail').value.trim();
    const password = document.getElementById('staffPassword').value.trim();

    // Cuenta Específica de Modo Jefe / Admin
    if (email === 'admin@distritogo.pe' && password === 'admin123') {
        currentUser = { role: 'admin', name: 'Jefe de Operaciones' };
        showAppForUser();
        return;
    }

    // Buscar en la lista de conductores
    const driver = driversDB.find(d => d.email === email && d.password === password);
    if (driver) {
        currentUser = { role: 'driver', ...driver };
        showAppForUser();
        return;
    }

    alert('Credenciales incorrectas. Verifica tu correo y contraseña.');
}

// Control de Pantallas según el Rol
function showAppForUser() {
    document.getElementById('userInfoHeader').style.display = 'flex';
    document.getElementById('userRoleBadge').innerText = currentUser.role.toUpperCase();

    if (currentUser.role === 'admin') {
        switchScreen('screen-admin');
        renderAdminDrivers();
    } else if (currentUser.role === 'driver') {
        switchScreen('screen-driver-dashboard');
        renderDriverDashboard();
    } else if (currentUser.role === 'passenger') {
        switchScreen('screen-passenger-trip');
        renderPassengerDriversList();
    }
}

function logout() {
    currentUser = null;
    document.getElementById('userInfoHeader').style.display = 'none';
    switchScreen('screen-login');
}