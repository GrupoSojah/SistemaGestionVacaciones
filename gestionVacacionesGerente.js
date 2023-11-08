var diasPedidos = 0;
$(document).ready(function () {
  var anioActual = new Date().getFullYear();
  var finDeAnio = new Date(anioActual, 11, 31);

  // Recuperar las fechas bloqueadas
  recuperarFechasBloqueadas()
    .then(intervaloFechas => {

      var calendar = $('#calendario').fullCalendar({
        locale: 'es',
        selectable: true,
        validRange: {
          start: new Date(),
          end: finDeAnio,
        },
        select: function (start, end) {
          var fechaInicio = start.format('YYYY-MM-DD');
          var fechaFin = end.format('YYYY-MM-DD');

          var seleccionPermitida = true;

          for (var i = 0; i < intervaloFechas.length; i++) {
            var intervalo = intervaloFechas[i];
            var bloqueoInicio = moment(intervalo.fecha_inicio);
            var bloqueoFin = moment(intervalo.fecha_fin);

            if ((start >= bloqueoInicio && start < bloqueoFin) || (end > bloqueoInicio && end <= bloqueoFin)) {
              seleccionPermitida = false;
              break;
            }
          }

          if (seleccionPermitida) {
            const usuario = sessionStorage.getItem('usuario');
            console.log('Usuario:', usuario);

            obtenerDiasPermitidos(usuario)
              .then(diasPermitidos => {
                if (diasPermitidos !== null) {
                   var diasSeleccionados = end.diff(start, 'days') + 1;
                   diasPedidos = diasSeleccionados;

                  if (diasSeleccionados <= diasPermitidos) {
                    $('#fecha_inicio').val(fechaInicio);
                    $('#fecha_fin').val(fechaFin);
                  } else {
                    mostrarAlert('No puedes seleccionar más de' + diasPermitidos + ' días.');
                  }
                } else {
                  console.error('No se pudo obtener la antigüedad del usuario.');
                }
              })
              .catch(error => {
                console.error('Error al obtener la antigüedad del usuario:', error);
              });
          } else {
            mostrarAlert('El intervalo de fechas seleccionadas contienen una fecha bloqueada.')
          }
        },
        dayClick: function () {
          $('#fecha_inicio').val('');
          $('#fecha_fin').val('');
        },
      });
    })
    .catch(error => {
      console.error('Error al recuperar las fechas bloqueadas:', error);
    });
});

function limpiarSeleccion() {
  const calendar = $('#calendario').fullCalendar();
  calendar.fullCalendar('unselect');
  $('#fecha_inicio').val('');
  $('#fecha_fin').val('');
}

async function guardarEnBD() {
  const fechaInicio = $('#fecha_inicio').val();
  const fechaFin = $('#fecha_fin').val();
  const estado = 'Pendiente';
  const diasPedidosUsuario = diasPedidos;
  const usuario = sessionStorage.getItem('usuario');

  try {
   
    const numeroSolicitudResult = await numeroSolicitud(usuario);
    const contadorPorArea = await cantidadPorArea(usuario,fechaInicio,fechaFin);
    
    if (numeroSolicitudResult === 0 && contadorPorArea === 0) {
      if (fechaInicio && fechaFin) {
        $.ajax({
          type: "POST",
          url: "/guardarFechas",
          data: JSON.stringify({ usuario, fechaInicio, fechaFin, estado, diasPedidosUsuario }),
          contentType: "application/json; charset=utf-8",
          dataType: "json",
          success: function (data) {
            console.log('Datos guardados exitosamente en la base de datos.');
          },
        });

        mostrarAlert('¡Su Solicitud se encuentra en proceso!')
      }
    } else {
      mostrarAlert('No puedes realizar una nueva solicitud en este momento.');
    }
  } catch (error) {
    console.error('Error al obtener el número de solicitudes:', error);
  }
}


function obtenerAntiguedad(usuario) {
  return new Promise((resolve, reject) => {
    $.ajax({
      type: "POST",
      url: "/obtenerAntiguedad",
      data: JSON.stringify({ usuario }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (data) {
        const antiguedadUsuario = data.antiguedad;
        resolve(antiguedadUsuario);
      },
      error: function (error) {
        console.error('Error al obtener la antigüedad del usuario:', error);
        reject(error);
      }
    });
  });
}

function calcularDiasPermitidos(antiguedadUsuario) {
  let diasPermitidos = 0;

  if (antiguedadUsuario <= 1) {
    diasPermitidos = 7;
  } else if (antiguedadUsuario <= 5) {
    diasPermitidos = 15;
  } else {
    diasPermitidos = 30;
  }
  return diasPermitidos;
}

function redireccionar() {
  window.location.href = 'VerHistorial.html';
}

function obtenerDiasPermitidos(usuario) {
  return fetch(`/obtenerDiasPermitidos/${usuario}`)
    .then(response => response.json())
    .then(diasPermitidos => diasPermitidos.diasPermitidos)
    .catch(error => console.error('Error al obtener los dias permitidos:', error));
}
mostrarSolicitudesEnTabla();

function obtenerSolicitudes(usuario) {
  return fetch(`/obtenerSolicitudesMisVacaciones/${usuario}`)
    .then(response => response.json())
    .then(data => data.solicitudes)
    .catch(error => console.error('Error al obtener las solicitudes:', error));
}

function obtenerSolicitudesFiltradas(filtro, usuario) {
  return fetch(`/obtenerSolicitudesFiltradasMisVacaciones/${filtro}/${usuario}`)
    .then(response => response.json())
    .then(data => data.solicitudesFiltradas)
    .catch(error => console.error('Error al obtener las solicitudes:', error));
}

function mostrarSolicitudesEnTabla() {
  const listaSolicitudes = document.getElementById('solicitudes-body');
  listaSolicitudes.innerHTML = ''; // Limpiamos el contenido
  const usuario = sessionStorage.getItem('usuario');
  console.log("El usuario es:", usuario)

  obtenerSolicitudes(usuario)
    .then(solicitudes => {
      solicitudes.forEach(solicitud => {

        const row = document.createElement('tr');
        const numeroSolicitudCell = document.createElement('td');
        numeroSolicitudCell.textContent = solicitud.idFecha;
        const nombreSolicitanteCell = document.createElement('td');
        nombreSolicitanteCell.textContent = solicitud.nombre;
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
  const usuario = sessionStorage.getItem('usuario')
  const filtro = document.getElementById('selectFiltrado').value

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

function BloquearFecha() {
  const fechaInicio = $('#fecha_inicio').val();
  const fechaFin = $('#fecha_fin').val();
  const estado = 'Bloqueado'

  const usuario = sessionStorage.getItem('usuario');
 
  if (fechaInicio && fechaFin) {
    $.ajax({
      type: "POST",
      url: "/guardarFechas",
      data: JSON.stringify({ usuario, fechaInicio, fechaFin, estado }),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function (data) {
       
      },
    });
    mostrarAlert("¡Las Fechas fueron bloquedas con exito!")
  }
}

function recuperarFechasBloqueadas() {
  return fetch(`/obtenerFechasBloquedas`)
    .then(response => response.json())
    .then(data => {
      console.log('Fechas bloqueadas:', data.fechas);
      return data.fechas;  // Retornar las fechas para que estén disponibles en el siguiente `.then`
    })
    .catch(error => console.error('Error al obtener las fechas bloqueadas:', error));
}


function mostrarAlert(message) {
  const customAlert = document.getElementById('custom-alert');
  const alertMessage = document.getElementById('alert-message');
  const closeAlert = document.getElementById('close-alert');

  alertMessage.textContent = message;
  customAlert.style.display = 'block';

  closeAlert.addEventListener('click', hideAlert);
}

function ocultarAlert() {
  const customAlert = document.getElementById('custom-alert');
  customAlert.style.display = 'none';
}


function numeroSolicitud(usuario) {
  return fetch(`/contarSolicitudes/${usuario}`)
      .then(response => {
          if (!response.ok) {
              throw new Error('Error en la solicitud');
          }
          return response.json();
      })
      .then(data => {
          if (data.numeroSolicitud !== undefined) {
              return data.numeroSolicitud;
          } else {
              throw new Error('Respuesta del servidor no contiene el número de solicitud');
          }
      })
      .catch(error => {
          console.error('Error al obtener las solicitudes:', error);
          throw error; // Re-lanzar el error para que sea manejado en otro lugar si es necesario
      });
}

function cantidadPorArea(usuario, fechaInicio, fechaFin){
  return fetch(`/cantidadDeVacacionesPedidasPorArea/${usuario}/${fechaInicio}/${fechaFin}`)
    .then (response=>{
      if(!response.ok){
        throw new Error("Error en la solictud")
      }
      return response.json();
    })
    .then(data =>{
      if(data.countSolicitudesPorArea !== undefined){
        return data.countSolicitudesPorArea;
      }else {
        throw new Error("La respuesta del servidor no contiene el contador");
      }
    })
    .catch(error =>{
        console.error('Error al obtener el dato:', error);
        throw error;  
    })
}


