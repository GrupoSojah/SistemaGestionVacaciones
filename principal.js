/*<script>
document.getElementById("formulario-contacto").addEventListener("submit", function(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const mensaje = document.getElementById("mensaje").value;

    const data = {
        nombre: nombre,
        email: email,
        mensaje: mensaje
    };

    fetch("/enviar_correo", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Mensaje enviado con éxito.");
        } else {
            alert("Error al enviar el mensaje.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
    });
});
</script>
En el servidor, crea una ruta que maneje la solicitud POST en el endpoint /enviar_correo. Esta ruta debe tomar los datos del formulario, procesarlos y enviar el correo electrónico utilizando una biblioteca o servicio de envío de correos. La implementación específica dependerá del lenguaje de backend que estés utilizando.

Asegúrate de que tu servidor esté configurado correctamente para enviar correos electrónicos de forma segura, utilizando credenciales seguras y, posiblemente, alguna biblioteca de envío de correo electrónico, como Nodemailer para Node.js.

Este es solo un esquema básico. La implementación exacta dependerá de las tecnologías que estés utilizando en tu servidor y de cómo estés gestionando el envío de correos electrónicos. También debes asegurarte de implementar la seguridad adecuada para evitar abusos en el formulario.





*/