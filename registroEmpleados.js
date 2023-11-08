document.getElementById('registro-form').addEventListener('submit', function(event) {
  event.preventDefault();

  const nombre = document.getElementById('nombre').value;
  const apellido = document.getElementById('apellido').value;
  const dni = document.getElementById('dni').value;
  const area = document.getElementById('area').value;
  const fechaDeIngreso = document.getElementById('fechaDeIngreso').value;

  const datos = {
      nombre: nombre,
      apellido: apellido,
      dni: dni,
      area: area,
      fechaDeIngreso: fechaDeIngreso
  };

  fetch('/registrar', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(datos)
  })
  .then(response => response.json())
  .then(data => {
      const mensajeDiv = document.getElementById('mensaje');
      if (data.error) {
          mensajeDiv.className = 'error';
          mensajeDiv.innerText = data.error;
      } else {
          mensajeDiv.className = 'success';
          mensajeDiv.innerText = data.message;
      }
  })
  .catch(error => console.error('Error:', error));
});
