function iniciarSesion() {
  const usuario = document.getElementById('usuario').value;
  const contrasenia = document.getElementById('contrasena').value;

  const datos = {
    usuario: usuario,
    contrasenia: contrasenia
  };
  fetch('/iniciarSesion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(datos)
  })
    .then(response => response.text())
    .then(mensaje => {
      switch (mensaje) {

        case '0':
          //paso el inicio de sesion y es gerente
          sessionStorage.setItem('usuario', usuario);
          window.location.href = '/pantallaInicioGerente';
          break;

        case '1':
          //paso el inicio de sesion y es un usuario normal
          sessionStorage.setItem('usuario', usuario);
          window.location.href = '/pantallaInicioUsuario';
          break;

        case '2':
          mostrarAlert('Contraseña Incorrecta')
          break;

        case '3':
          mostrarAlert('Usuario Incorrecto')
          break;
      }
    })
    .catch(error => console.error('Error:', error));
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
