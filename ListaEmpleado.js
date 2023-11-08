mostrarEmpleadosEnTabla();

function obtenerEmpleados() {

    return fetch(`/obtenerEmpleados`)
        .then(response => response.json())
        .then(data => data.empleados)
        .catch(error => console.error('Error al obtener las solicitudes:', error));
}
function obtenerEmpleadosFiltrados(filtro, TipoFiltrado) {
    return fetch(`/obtenerEmpleadosFiltrados/${filtro}/${TipoFiltrado}`)
        .then(response => response.json())
        .then(data => data.empleadosFiltrados)
        .catch(error => console.error('Error al obtener las solicitudes:', error));
}

function mostrarEmpleadosFiltrados() {

    const listaEmpleado = document.getElementById('Empleado-body');
    listaEmpleado.innerHTML = ''; // Limpiamos el contenido
    const filtro = document.getElementById('selectFiltrado').value
    const orden = document.getElementById('OrderBY').value

    obtenerEmpleadosFiltrados(filtro, orden)
        .then(empleadosFiltrados => {
            empleadosFiltrados.forEach(empleado => {

                const row = document.createElement('tr');
                const nombreEmpleadoCell = document.createElement('td');
                nombreEmpleadoCell.textContent = empleado.nombre;
                const apellidoEmpleadoCell = document.createElement('td');
                apellidoEmpleadoCell.textContent = empleado.apellido;
                const areaEmpleadoCell = document.createElement('td')
                areaEmpleadoCell.textContent = empleado.area
                const fechaIngreso = new Date(empleado.fechaIngreso)
                const fechaformateada = `${fechaIngreso.getFullYear()}-${('0' + (fechaIngreso.getMonth() + 1)).slice(-2)}-${('0' + fechaIngreso.getDate()).slice(-2)}`;

                const FechaIngresoCell = document.createElement('td');
                FechaIngresoCell.textContent = fechaformateada
                const DniEmpleadoCell = document.createElement('td')
                DniEmpleadoCell.textContent = empleado.dni

                row.appendChild(nombreEmpleadoCell);
                row.appendChild(apellidoEmpleadoCell);
                row.appendChild(areaEmpleadoCell)
                row.appendChild(FechaIngresoCell);
                row.appendChild(DniEmpleadoCell)

                listaEmpleado.appendChild(row);
            });
        });
}


function mostrarEmpleadosEnTabla() {
    const listaEmpleado = document.getElementById('Empleado-body');
    listaEmpleado.innerHTML = ''; // Limpiamos el contenido

    obtenerEmpleados()
        .then(empleados => {
            empleados.forEach(empleado => {

                const row = document.createElement('tr');
                const nombreEmpleadoCell = document.createElement('td');
                nombreEmpleadoCell.textContent = empleado.nombre;
                const apellidoEmpleadoCell = document.createElement('td');
                apellidoEmpleadoCell.textContent = empleado.apellido;
                const areaEmpleadoCell = document.createElement('td')
                areaEmpleadoCell.textContent = empleado.area
                const fechaIngreso = new Date(empleado.fechaIngreso)
                const fechaformateada = `${fechaIngreso.getFullYear()}-${('0' + (fechaIngreso.getMonth() + 1)).slice(-2)}-${('0' + fechaIngreso.getDate()).slice(-2)}`;

                const FechaIngresoCell = document.createElement('td');
                FechaIngresoCell.textContent = fechaformateada
                const DniEmpleadoCell = document.createElement('td')
                DniEmpleadoCell.textContent = empleado.dni

                row.appendChild(nombreEmpleadoCell);
                row.appendChild(apellidoEmpleadoCell);
                row.appendChild(areaEmpleadoCell)
                row.appendChild(FechaIngresoCell);
                row.appendChild(DniEmpleadoCell)

                listaEmpleado.appendChild(row);
            });
        });
}



