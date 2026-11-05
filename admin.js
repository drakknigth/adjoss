// RENDERIZAR LISTA DE CHOFERES EN PANEL DE ADMIN
function renderAdminDrivers() {
    const listContainer = document.getElementById('adminDriversList');
    listContainer.innerHTML = '';

    driversDB.forEach(driver => {
        listContainer.innerHTML += `
            <div class="admin-driver-row">
                <div>
                    <strong>${driver.name}</strong> (${driver.vehicle})
                    <br><small style="color:#94a3b8;">${driver.email} | Placa: ${driver.plate}</small>
                </div>
                <div class="action-btns">
                    <button class="btn-icon edit" onclick="editDriver(${driver.id})"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn-icon delete" onclick="deleteDriver(${driver.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
    });
}

function showAddDriverModal() {
    document.getElementById('modalTitle').innerText = 'Añadir Nuevo Chofer';
    document.getElementById('driverId').value = '';
    document.getElementById('driverForm').reset();
    document.getElementById('driverModal').style.display = 'flex';
}

function closeDriverModal() {
    document.getElementById('driverModal').style.display = 'none';
}

// AÑADIR O MODIFICAR CHOFER (CRUD)
function handleSaveDriver(e) {
    e.preventDefault();
    const id = document.getElementById('driverId').value;
    const name = document.getElementById('modalDriverName').value;
    const email = document.getElementById('modalDriverEmail').value;
    const vehicle = document.getElementById('modalDriverVehicle').value;
    const plate = document.getElementById('modalDriverPlate').value;

    if (id) {
        // Modificar
        const driver = driversDB.find(d => d.id === parseInt(id));
        if (driver) {
            driver.name = name;
            driver.email = email;
            driver.vehicle = vehicle;
            driver.plate = plate;
        }
    } else {
        // Añadir Nuevo
        const newDriver = {
            id: Date.now(),
            name,
            email,
            password: 'driver123',
            vehicle,
            plate,
            rating: 5.0,
            tripsCount: 0,
            reviews: []
        };
        driversDB.push(newDriver);
    }

    closeDriverModal();
    renderAdminDrivers();
}

function editDriver(id) {
    const driver = driversDB.find(d => d.id === id);
    if (!driver) return;

    document.getElementById('modalTitle').innerText = 'Modificar Chofer';
    document.getElementById('driverId').value = driver.id;
    document.getElementById('modalDriverName').value = driver.name;
    document.getElementById('modalDriverEmail').value = driver.email;
    document.getElementById('modalDriverVehicle').value = driver.vehicle;
    document.getElementById('modalDriverPlate').value = driver.plate;
    document.getElementById('driverModal').style.display = 'flex';
}

function deleteDriver(id) {
    if (confirm('¿Estás seguro de eliminar a este conductor del sistema?')) {
        driversDB = driversDB.filter(d => d.id !== id);
        renderAdminDrivers();
    }
}