mostrarSolicitudesEnTabla();

function obtenerSolicitudes(filtro, usuario) {
    return fetch(`/obtenerSolicitudesFiltradas/${filtro}/${usuario}`)
      .then(response => response.json())
      .then(data => data.solicitudesFiltradas)
      .catch(error => console.error('Error al obtener las solicitudes:', error));
}

  function mostrarSolicitudesEnTabla() {
    const filtro = 'Pendiente'
    const usuario = sessionStorage.getItem('usuario')
    const listaSolicitudes = document.getElementById('solicitudes-body');
    listaSolicitudes.innerHTML = ''; // Limpiamos el contenido
  
    obtenerSolicitudes(filtro, usuario)
      .then(solicitudesFiltradas => {
        solicitudesFiltradas.forEach(solicitud => {

          const row = document.createElement('tr');
          const numeroSolicitudCell = document.createElement('td');
          numeroSolicitudCell.textContent = solicitud.idFecha;
          const nombreSolicitanteCell = document.createElement('td');
          nombreSolicitanteCell.textContent = solicitud.nombreEmpleado ;
          const EstadoSolicitanteCell = document.createElement('td');
          EstadoSolicitanteCell.textContent = solicitud.estado
    
          const fechaInicio = new Date(solicitud.fecha_inicio)
          const fechaformateadainicio = `${fechaInicio.getFullYear()}-${('0' + (fechaInicio.getMonth() + 1)).slice(-2)}-${('0' + fechaInicio.getDate()).slice(-2)}`; 
          const fechaFin = new Date(solicitud.fecha_fin)
          const fechaformateadaFin = `${fechaFin.getFullYear()}-${('0' + (fechaFin.getMonth() + 1)).slice(-2)}-${('0' + fechaFin.getDate()).slice(-2)}`;  
          const FechaInicioSolicitanteCell = document.createElement('td');
          FechaInicioSolicitanteCell.textContent = fechaformateadainicio;
          const FechaFinSolicitanteCell = document.createElement('td');
          FechaFinSolicitanteCell.textContent = fechaformateadaFin;
          const botonAceptar = document.createElement('button');
          botonAceptar.textContent = 'Si';
          const botonRechazar = document.createElement('button');
          botonRechazar.textContent = 'No';
          botonAceptar.addEventListener('click', () =>{
            aceptarPeticion(solicitud.idFecha);

          });
          botonRechazar.addEventListener('click', () => {
            rechazarPeticion(solicitud.idFecha);
          });

          row.appendChild(numeroSolicitudCell);
          row.appendChild(nombreSolicitanteCell);
          row.appendChild(EstadoSolicitanteCell);
          row.appendChild(FechaInicioSolicitanteCell);
          row.appendChild(FechaFinSolicitanteCell);
          row.appendChild(botonAceptar);
          row.appendChild(botonRechazar);
  
          listaSolicitudes.appendChild(row);
        });
      });
  }

   function aceptarPeticion(numeroDePeticion){
    const numeroPeticion = numeroDePeticion;
    location.reload();
    return fetch('/aceptarSolicitud', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ numeroPeticion: numeroPeticion }),
      success: function (data) {
        console.log('fecha aceptada.');
      }
    })
    .then(response => response.json())
    .catch(error => console.error('Error al aceptar:', error));
  }

  function rechazarPeticion(numeroDePeticion){
    const numeroPeticion = numeroDePeticion;
    location.reload();
    return fetch('/rechazarSolicitud', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ numeroPeticion: numeroPeticion }),
      success: function (data) {
        console.log('fecha aceptada.');
      }
    })
    .then(response => response.json())
    .catch(error => console.error('Error al aceptar:', error));
    
  }




  
