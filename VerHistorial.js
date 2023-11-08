mostrarSolicitudesEnTabla();

function obtenerSolicitudes(usuario) {

  return fetch(`/obtenerSolicitudes/${usuario}`)
    .then(response => response.json())
    .then(data => data.solicitudes)
    .catch(error => console.error('Error al obtener las solicitudes:', error));
}

function obtenerSolicitudesFiltradas(filtro, usuario) {

  return fetch(`/obtenerSolicitudesFiltradas/${filtro}/${usuario}`)
    .then(response => response.json())
    .then(data => data.solicitudesFiltradas)
    .catch(error => console.error('Error al obtener las solicitudes:', error));
}

function mostrarSolicitudesEnTabla() {
  const usuario =  sessionStorage.getItem('usuario')
  const listaSolicitudes = document.getElementById('solicitudes-body');
  listaSolicitudes.innerHTML = ''; // Limpiamos el contenido
  

  obtenerSolicitudes(usuario)
    .then(solicitudes => {
      solicitudes.forEach(solicitud => {

        const row = document.createElement('tr');
        const numeroSolicitudCell = document.createElement('td');
        numeroSolicitudCell.textContent = solicitud.idFecha;
        const nombreSolicitanteCell = document.createElement('td');
        nombreSolicitanteCell.textContent = solicitud.nombreEmpleado;
        const EstadoSolicitanteCell = document.createElement('td');
        EstadoSolicitanteCell.textContent = solicitud.estado

        const fechaSolicitud = new Date(solicitud.fechaSolicitud)
        const fechaformateada = `${fechaSolicitud.getFullYear()}-${('0' + (fechaSolicitud.getMonth() + 1)).slice(-2)}-${('0' + fechaSolicitud.getDate()).slice(-2)}`;

        const FechaSolicitudSolicitanteCell = document.createElement('td');
        FechaSolicitudSolicitanteCell.textContent = fechaformateada


        row.appendChild(numeroSolicitudCell);
        row.appendChild(nombreSolicitanteCell);
        row.appendChild(EstadoSolicitanteCell);
        row.appendChild(FechaSolicitudSolicitanteCell);

        listaSolicitudes.appendChild(row);
      });
    });
}


function mostrarSolicitudesFiltradas() {
  const filtro = document.getElementById('selectFiltrado').value
  const usuario = sessionStorage.getItem('usuario')

  obtenerSolicitudesFiltradas(filtro, usuario)
    .then(solicitudesFiltradas => {
      const listaSolicitudes = document.getElementById('solicitudes-body')
      listaSolicitudes.innerHTML = ''

      solicitudesFiltradas.forEach(solicitud => {
        const row = document.createElement('tr');
        const numeroSolicitudCell = document.createElement('td');
        numeroSolicitudCell.textContent = solicitud.idFecha;
        const nombreSolicitanteCell = document.createElement('td');
        nombreSolicitanteCell.textContent = solicitud.nombreEmpleado;
        const EstadoSolicitanteCell = document.createElement('td');
        EstadoSolicitanteCell.textContent = solicitud.estado

        const fechaSolicitud = new Date(solicitud.fechaSolicitud)
        const fechaformateada = `${fechaSolicitud.getFullYear()}-${('0' + (fechaSolicitud.getMonth() + 1)).slice(-2)}-${('0' + fechaSolicitud.getDate()).slice(-2)}`;

        const FechaSolicitudSolicitanteCell = document.createElement('td');
        FechaSolicitudSolicitanteCell.textContent = fechaformateada

        row.appendChild(numeroSolicitudCell);
        row.appendChild(nombreSolicitanteCell);
        row.appendChild(EstadoSolicitanteCell);
        row.appendChild(FechaSolicitudSolicitanteCell);

        listaSolicitudes.appendChild(row);
      })
    })
}

