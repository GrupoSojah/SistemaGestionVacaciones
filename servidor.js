const express = require('express'); // central 


const mysql = require('mysql'); 

const path = require('path'); //manejar directorios 

const bodyParser = require('body-parser'); //manejar respuestas del servidor .json, y demas 

const cors = require('cors'); //Asincronia que se puede producir 


const { error } = require('console'); 


//npm i [Nombre de la libreria]
const app = express();
app.use(bodyParser.json());
app.use(cors());


const conexion = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'admin',
  database: 'mydb'
});

//conexion tenes que completarlo segun sean tus parametros 
app.use(express.static(__dirname));

// Para la página de inicio de sesión
app.get('/inicioSesion', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Para la página de selección de fechas
app.get('/seleccionFechas', (req, res) => {
  res.sendFile(path.join(__dirname, 'gestionVacacionesUsuario.html'));
});

app.get('/ListaEmpleados', (req, res) => {
  res.sendFile(path.join(__dirname, 'ListaEmpleado.html'));
});

app.get('/gestionVacacionesGerente', (req, res) => {
  res.sendFile(path.join(__dirname, 'gestionVacacionesGerente.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'registroEmpleado.html'))
});

app.get('/pantallaInicioGerente', (req, res) => {
  res.sendFile(path.join(__dirname, 'pantallaInicioGerente.html'))
});

app.get('/pantallaInicioUsuario', (req, res) => {
  res.sendFile(path.join(__dirname, 'pantallaInicioUsuario.html'))
});

app.post('/registrar', (req, res) => {
  const { nombre, apellido, dni, area, fechaDeIngreso } = req.body;
  
  const usuario = nombre.toLowerCase() + apellido.toLowerCase();
  const fechaIngreso = new Date(fechaDeIngreso);
  const fechaActual = new Date();
  const antiguedadEnMs = fechaActual - fechaIngreso;
  const antiguedadEnAnios = Math.floor(antiguedadEnMs / (1000 * 60 * 60 * 24 * 365.25));
  var diasPermitidos;
  if (antiguedadEnAnios <= 1) {
    diasPermitidos = 7;
  } else if (antiguedadEnAnios <= 5) {
    diasPermitidos = 15;
  } else {
    diasPermitidos = 30;
  }

  const registroEmpleadoQuery = `INSERT INTO empleado (nombre, apellido, area, dni, fechaIngreso, diasPermitidos ) VALUES (?, ?, ?, ?, ?, ?)`;
  const values = [nombre, apellido, area, dni, fechaDeIngreso, diasPermitidos];

    conexion.query(registroEmpleadoQuery, values, (error, resultadosRegistroEmpleadoQuery) => {
      if (error) {
        console.error('Error al ejecutar la consulta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
      }

      const verificarQuery = `SELECT usuario FROM credenciales WHERE usuario = ?`

      conexion.query(verificarQuery, [usuario], (error, resultadoVerificarQuery)=>{
        if (error) {
          console.error('Error al ejecutar la consulta:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
          return;
        }

        if (resultadoVerificarQuery.length> 0)
        {
          console.log("El dni es:", dni )
          const ultimosTresDigitosDni = dni.slice(-3)
          const UsuarioModfiicado = usuario + ultimosTresDigitosDni

          const obtenerIdEmpleadoQuery = `SELECT idEmpleado FROM empleado WHERE dni = ?`
          conexion.query(obtenerIdEmpleadoQuery,dni, (error, resultadosObtenerIdEmpleadoQuery) =>{

            if (error) {
              console.error('Error al ejecutar la consulta:', error);
              res.status(500).json({ error: 'Error interno del servidor' });
              return;
            }
    
            let nivel = 0;
            switch (area) {
              case "Gerente":
                nivel = 0;
                break;
              default:
                nivel = 1;
                break;
            }

            const idEmpleado = resultadosObtenerIdEmpleadoQuery[0].idEmpleado
            const insertarCredencialQuery =  `INSERT INTO credenciales (usuario, contraseña,nivel, Empleado_idEmpleado) VALUES (?, ?, ?, ?)`
            const valoresCredencial = [UsuarioModfiicado, dni, nivel, idEmpleado]
            conexion.query(insertarCredencialQuery,valoresCredencial, (err, resultadosInsertarCredencial) =>{
              if (error) {
                console.error('Error al ejecutar la consulta:', error);
                res.status(500).json({ error: 'Error interno del servidor' });
                return;
              }
            })
          })
        }else {

          const obtenerIdEmpleadoQuery = `SELECT idEmpleado FROM empleado WHERE dni = ?`
          conexion.query(obtenerIdEmpleadoQuery,dni, (error, resultadosObtenerIdEmpleadoQuery) =>{

            if (error) {
              console.error('Error al ejecutar la consulta:', error);
              res.status(500).json({ error: 'Error interno del servidor' });
              return;
            }
    
            let nivel = 0;
            switch (area) {
              case "Gerente":
                nivel = 0;
                break;
              default:
                nivel = 1;
                break;
            }
            const idEmpleado = resultadosObtenerIdEmpleadoQuery[0].idEmpleado

            const insertarCredencialQuery =  `INSERT INTO credenciales (usuario, contraseña,nivel, Empleado_idEmpleado) VALUES (?, ?, ?, ?)`
            const valoresCredencial = [usuario, dni, nivel, idEmpleado]
            conexion.query(insertarCredencialQuery,valoresCredencial, (err, resultadosInsertarCredencial) =>{
              if (error) {
                console.error('Error al ejecutar la consulta:', error);
                res.status(500).json({ error: 'Error interno del servidor' });
                return;
              }
            })
          })
        }
      console.log('Usuario registrado con éxito:', resultadosRegistroEmpleadoQuery);
      res.json({ message: 'Usuario registrado con éxito' });
      })
    });
});

app.get('/obtenerDiasPermitidos/:usuario', (req, res)=>{
  const usuario = req.params.usuario
  const diasPermitidosQuery = `SELECT empleado.diasPermitidos FROM empleado INNER JOIN 
  credenciales on empleado.idEmpleado = credenciales.Empleado_idEmpleado
  WHERE credenciales.usuario = ?`
  conexion.query(diasPermitidosQuery, [usuario], (error, resultadoDiasPermitidos) =>{
    if (error) {
      console.error('Error al obtener los dias permitidos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    const diaspermitidos = resultadoDiasPermitidos[0].diasPermitidos;

    res.json({ diasPermitidos: diaspermitidos });
  })
});

app.get('/obtenerSolicitudes/:usuario', (req, res) => {

  const usuario = req.params.usuario

  const idEmpleadoQUERY = `SELECT Empleado_idEmpleado FROM credenciales WHERE usuario = ?`

  conexion.query(idEmpleadoQUERY, [usuario], (error, resultadosIdEmpleadoQuery) =>{
    if (error) {
      console.error('Error al obtener las solicitudes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    const idEmpleado =  resultadosIdEmpleadoQuery[0].Empleado_idEmpleado
    const obtenerSolicitudesQuery = `SELECT * FROM calendario WHERE estado != 'Bloqueado' && Empleado_idEmpleado != ?`;

    conexion.query(obtenerSolicitudesQuery, [idEmpleado], (error, solicitudes) => {
      if (error) {
        console.error('Error al obtener las solicitudes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
      }
  
      console.log("las solicitudes recupoeradas son: ", solicitudes)
  
      const idsEmpleados = solicitudes.map(solicitud => solicitud.Empleado_idEmpleado);
  
      if (idsEmpleados.length === 0) {
        res.json({ solicitudes: [] });
        console.log("hay un error:")
        // No hay empleados, retornar lista vacía
        return;
      }
  
      const obtenerNombresQuery = `SELECT idEmpleado, nombre FROM empleado WHERE idEmpleado IN (${idsEmpleados.join(',')})`
  
      conexion.query(obtenerNombresQuery, (error, resultadosNombres) => {
  
        if (error) {
          console.error('Error al obtener las solicitudes:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
          return;
        }
        const nombreEmpleadoMap = new Map();
        resultadosNombres.forEach(nombre => {
          nombreEmpleadoMap.set(nombre.idEmpleado, nombre.nombre);
        });
  
        const solicitudesConNombres = solicitudes.map(solicitud => ({
          ...solicitud,
          nombreEmpleado: nombreEmpleadoMap.get(solicitud.Empleado_idEmpleado)
        }));
  
  
        res.json({ solicitudes: solicitudesConNombres });
      })

  })
});
})

app.get('/obtenerSolicitudesFiltradas/:filtro/:usuario', (req, res) => {
  const filtro = req.params.filtro;
  const usuario = req.params.usuario;

  console.log("Se recuperó el filtro:", filtro);

  const empleadoIdQuery = `SELECT Empleado_idEmpleado FROM credenciales WHERE usuario = ?`;

  conexion.query(empleadoIdQuery, [usuario], (error, resultadoEmpleadoIdQuery) => {
    if (error) {
      console.error('Error al obtener el ID del empleado:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }

    const idEmpleado = resultadoEmpleadoIdQuery[0].Empleado_idEmpleado;

    const obtenerSolicitudesAceptadasQuery = `SELECT * FROM calendario WHERE Estado = ? && Empleado_idEmpleado != ?`;
    const values = [filtro, idEmpleado];

    conexion.query(obtenerSolicitudesAceptadasQuery, values, (error, solicitudes) => {
      if (error) {
        console.error('Error al obtener las solicitudes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
      }

      console.log("Las solicitudes recuperadas son:", solicitudes);

      const idsEmpleados = solicitudes.map(solicitud => solicitud.Empleado_idEmpleado);

      if (idsEmpleados.length === 0) {
        res.json({ solicitudes: [] });
        console.log("No hay solicitudes para mostrar.");
        return;
      }

      const obtenerNombresQuery = `SELECT idEmpleado, nombre FROM empleado WHERE idEmpleado IN (${idsEmpleados.join(',')})`;

      conexion.query(obtenerNombresQuery, (error, resultadosNombres) => {
        if (error) {
          console.error('Error al obtener los nombres de los empleados:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
          return;
        }

        const nombreEmpleadoMap = new Map();
        resultadosNombres.forEach(nombre => {
          nombreEmpleadoMap.set(nombre.idEmpleado, nombre.nombre);
        });

        const solicitudesConNombres = solicitudes.map(solicitud => ({
          ...solicitud,
          nombreEmpleado: nombreEmpleadoMap.get(solicitud.Empleado_idEmpleado)
        }));

        res.json({ solicitudesFiltradas: solicitudesConNombres });
      });
    });
  });
});


app.post('/guardarFechas', (req, res) => {
  const fechaInicio = req.body.fechaInicio;
  const fechaFin = req.body.fechaFin;
  const usuario = req.body.usuario;
  const estado = req.body.estado;
  const diasPedidos = req.body.diasPedidosUsuario;

  const fechaActual = new Date().toISOString().split('T')[0]

  // Consulta para obtener el idEmpleado con nombre 
  const obtenerIdEmpleadoQuery = `SELECT Empleado_idEmpleado FROM credenciales WHERE usuario = '${usuario}'`;


  conexion.query(obtenerIdEmpleadoQuery, (error, resultados) => {
    if (error) throw error;

    if (resultados.length > 0) {
      const idEmpleado = resultados[0].Empleado_idEmpleado;

      const insertarFechasQuery = `INSERT INTO calendario (fecha_inicio, fecha_fin, estado, Empleado_idEmpleado, fechaSolicitud, diasQuePidio) VALUES (?,?,?,?,?,?)`;
      const valuesQuery = [fechaInicio, fechaFin, estado, idEmpleado, fechaActual, diasPedidos]
      conexion.query(insertarFechasQuery, valuesQuery, (error, insertarResultados) => {
        if (error) throw error;
        res.status(200).send('Fechas guardadas exitosamente.');
      });
    } else {
      res.status(400).send('No se encontró un empleado con el nombre ', usuario);
    }
  });
});

app.put('/aceptarRechazarPeticion', (req, res) => {
  const { numeroSolicitud, estado } = req.body;

  const cambiarEstadoQuery = `UPDATE calendario set estado = ? WHERE idFecha = ?`;
  const values = [estado, numeroSolicitud]

  conexion.query(cambiarEstadoQuery, values, (err, cambiarEstado) => {
    if (err) {
      console.error('Error al actualizar el estado:', err);
      res.status(500).json({ error: 'Error al actualizar el estado' });
    } else {
      res.status(200).json({ message: 'Actualizado con éxito' });
    }
  });
});



app.post('/iniciarSesion', (req, res) => {
  const contrasenia = req.body.contrasenia;
  const usuario = req.body.usuario;

  const obtenerUsuarioyContrasenia = `SELECT usuario,contraseña, nivel FROM credenciales WHERE usuario = ?`;

  conexion.query(obtenerUsuarioyContrasenia, [usuario], (error, resultados) => {
    if (error) throw error;

    if (resultados.length > 0) {
      if (resultados[0].usuario === usuario && resultados[0].contraseña === contrasenia) {
        if (resultados[0].nivel === 1) {
          res.status(200).send('1')//usuarios normales
        } else {
          res.status(200).send('0'); // usuarios de nivel alto
        }
      }
      else {
        res.status(200).send('2'); // incorrecto contraseña 
      }
    } else {
      res.status(400).send('3'); //incorrecto usuario
    }
  });
});


app.post('/obtenerAntiguedad', (req, res) => {

  const usuario = req.body.usuario;

  const obtenerIdEmpleadoQuery = `SELECT Empleado_idEmpleado FROM credenciales WHERE usuario = ?`;

  conexion.query(obtenerIdEmpleadoQuery, [usuario], (error, resultadosObtenerIdEmpleadoQuery) => {
    if (error) {
      console.error('Error al obtener la fecha de ingreso del usuario:', error);
      res.status(500).json({ error: 'Error al obtener la antigüedad del usuario' });
      return;
    }

    const idEmpleado = resultadosObtenerIdEmpleadoQuery[0].Empleado_idEmpleado

    const obtenerFechaIngresoQuery = `SELECT fechaIngreso FROM empleado WHERE idEmpleado = ?`
    conexion.query(obtenerFechaIngresoQuery, [idEmpleado], (error, resultadosobtenerFechaIngresoQuery) => {
      if (error) {
        console.error('Error al obtener la fecha de ingreso del usuario:', error);
        res.status(500).json({ error: 'Error al obtener la antigüedad del usuario' });
        return;
      } if (resultadosobtenerFechaIngresoQuery.length > 0) {
        console.log(resultadosobtenerFechaIngresoQuery[0].fechaIngreso)
        const fechaIngreso = new Date(resultadosobtenerFechaIngresoQuery[0].fechaIngreso);
        const fechaActual = new Date();
        const antiguedadEnMs = fechaActual - fechaIngreso;
        const antiguedadEnAnios = Math.floor(antiguedadEnMs / (1000 * 60 * 60 * 24 * 365.25));
        res.status(200).json({ antiguedad: antiguedadEnAnios });
      } else {
        console.error('No se encontró la fecha de ingreso para el usuario:', usuario);
        res.status(500).json({ error: 'No se encontró la fecha de ingreso para el usuario' });
      }
    });
  })
});

app.put('/aceptarSolicitud', (req, res) => {
  const aceptarPeticionQuery = `UPDATE calendario SET estado = 'Aceptada' WHERE idFecha = ?`;
  const idEmpleado = req.body.numeroPeticion;
  
  const recuperarDiasPedidosQuery = `SELECT diasQuePidio FROM calendario WHERE idFecha = ?`;

  conexion.query(aceptarPeticionQuery, [idEmpleado], (error, resultado) => {
    if (error) {
      console.error('Error al acceptar la fecha:', error);
      res.status(500).json({ error: 'Error al obtener acceptar la fecha' });
      return;
    }
    conexion.query(recuperarDiasPedidosQuery, [idEmpleado],(error, resultados)=>{
      if (error) {
        console.error('Error al recuperar cuantos dias pidio el ususario:', error);
        res.status(500).json({ error: 'Error al obtener dias pedidos por el usuario' });
        return;
      }
      const recuperarDiasDeVacacionesDelEmpleadoQuery = `SELECT empleado.diasPermitidos, empleado.idEmpleado FROM empleado 
      INNER JOIN calendario on empleado.idEmpleado = calendario.Empleado_idEmpleado WHERE idFecha = ?`
      const diasQuePidioDeVacaciones = resultados[0].diasQuePidio;
      //const empleadoID = resultados[0].idEmpleado;
      conexion.query(recuperarDiasDeVacacionesDelEmpleadoQuery, [idEmpleado], (error,resultadoDiasPermitidos) =>{
        if (error) {
          console.error('Error al obtener los dias permitidos del usuario:', error);
          res.status(500).json({ error: 'Error al obtener los dias permitidos del usuario' });
          return;
        }
        const diasPermitidos = resultadoDiasPermitidos[0].diasPermitidos - diasQuePidioDeVacaciones;

        const actualizarDiasPermitidosUsuario = `UPDATE empleado SET diasPermitidos = ${diasPermitidos} WHERE idEmpleado = ${idEmpleado}`
        
        conexion.query(actualizarDiasPermitidosUsuario,(error, results) =>{
          if (error) {
            console.error('Error al alctualizar los dias permitidos del usuario:', error);
            res.status(500).json({ error: 'Error al alctualizar los dias permitido del usuario' });
            return;
          }
        } )
      })
    })
    res.json({ mensaje: 'Vacacion aprobada' });
  }
  );
});

app.get('/cantidadDeVacacionesPedidasPorArea/:usuario/:fechaInicio/:fechaFin', (req, res) => {
  const fechaInicio = req.params.fechaInicio;
  const fechaFin = req.params.fechaFin;
  const usuario = req.params.usuario;

  const obtenerAreaDelEmpleadoQuery = `SELECT e.area FROM empleado AS e
  INNER JOIN credenciales AS c ON e.idEmpleado = c.Empleado_idEmpleado
  WHERE c.usuario = ?`;

  conexion.query(obtenerAreaDelEmpleadoQuery, [usuario], (error, resultadoArea) => {
    if (error) {
      console.error('Error al acceptar la fecha:', error);
      res.status(500).json({ error: 'Error al obtener acceptar la fecha' });
      return;
    }
    const area = resultadoArea[0].area;

    const obtenerCantidadDeVacacionesPorAreaQuery = `SELECT COUNT(*) As cantidad FROM calendario AS c 
    INNER JOIN empleado AS e ON e.idEmpleado = c.Empleado_idEmpleado
    WHERE e.area = '${area}' AND c.estado = 'Aceptada'
    AND c.fecha_inicio BETWEEN '${fechaInicio}' AND '${fechaFin}'`;
    conexion.query(obtenerCantidadDeVacacionesPorAreaQuery, (error, resultadoCountdeSolicitudesPorArea) => {
      if (error) {
        console.error('Error al acceptar la fecha:', error);
        res.status(500).json({ error: 'Error al obtener acceptar la fecha' });
        return;
      }
      res.json({ countSolicitudesPorArea:resultadoCountdeSolicitudesPorArea[0].cantidad});
    })
  });
});

app.put('/rechazarSolicitud', (req, res) => {
  const aceptarPeticionQuery = `UPDATE calendario SET estado = 'Rechazada' WHERE idFecha = ?`;
  const idEmpleado = req.body.numeroPeticion;
  conexion.query(aceptarPeticionQuery, [idEmpleado], (error, resultado) => {
    if (error) {
      console.error('Error al obtener la fecha de ingreso del usuario:', error);
      res.status(500).json({ error: 'Error al obtener la antigüedad del usuario' });
      return;
    }
    res.json({ mensaje: 'Vacacion rechazazda' });
  }
  );
});

app.get('/obtenerSolicitudesMisVacaciones/:usuario', (req, res) => {

  const usuario = req.params.usuario;

  console.log("Recupera el usuario?", usuario)

  const obtenerIDDeSolicitanteQuery = `SELECT Empleado_idEmpleado FROM credenciales WHERE usuario = ?`

  conexion.query(obtenerIDDeSolicitanteQuery, [usuario], (error, obtenerIDDeSolicitanteQuery) => {
    if (error) {
      console.error('Error al obtener las solicitudes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    } const idEmpleado = obtenerIDDeSolicitanteQuery[0].Empleado_idEmpleado

    console.log("El Id empleado es: ", idEmpleado)

    const obtenerNombreDeSolcitante = `SELECT nombre FROM empleado WHERE idEmpleado = ?`

    conexion.query(obtenerNombreDeSolcitante, [idEmpleado], (error, resultadosobtenerNombreDeSolcitante) => {
      if (error) {
        console.error('Error al obtener las solicitudes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
      }
      const nombreSolicitante = resultadosobtenerNombreDeSolcitante[0].nombre

      const obtenerSolicitudesQuery = `SELECT * FROM calendario WHERE Empleado_idEmpleado = ? && estado != 'Bloqueado' `;

      conexion.query(obtenerSolicitudesQuery, [idEmpleado], (error, resultados) => {
        if (error) {
          console.error('Error al obtener las solicitudes:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
          return;
        }
        const resultadosyNombreSolicitante = resultados.map(solicitud => ({
          ...solicitud,
          nombre: nombreSolicitante
        }));

        res.json({ solicitudes: resultadosyNombreSolicitante });
      });
    })
  });
});

app.get('/obtenerEmpleados', (req, res) => {
  const obtenerEmpleados = `SELECT * FROM empleado WHERE area != 'Gerente'`

  conexion.query(obtenerEmpleados, (error, EmpleadosQuery) => {
    if (error) {
      console.error('Error al obtener las solicitudes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    res.json({ empleados: EmpleadosQuery });
  })
})

app.get('/obtenerEmpleadosFiltrados/:filtro/:orden', (req, res) => {
  const filtro = req.params.filtro
  const orden = req.params.orden

  const obtenerEmpleadosFiltrados = `SELECT * FROM empleado WHERE area != 'Gerente' ORDER BY ${filtro} ${orden}`

  conexion.query(obtenerEmpleadosFiltrados, (error, EmpleadosfiltradosQuery) => {
    if (error) {
      console.error('Error al obtener las solicitudes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    } 
    const fechaArray = Array.isArray(EmpleadosfiltradosQuery) ? EmpleadosfiltradosQuery : [EmpleadosfiltradosQuery];
     

    res.json({ fechas:  fechaArray});
  })
})

app.get('/obtenerFechasBloquedas', (req,res)=> {
  const fechasBloqueadasQuery = `SELECT  fecha_fin, fecha_inicio FROM calendario Where estado = 'Bloqueado'`

  conexion.query(fechasBloqueadasQuery, (error, fechasBloqueadasInicioFin) =>{
    if (error) {
      console.error('Error al obtener las solicitudes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    res.json({ fechas: fechasBloqueadasInicioFin })
  })
}) 



app.get('/obtenerSolicitudesFiltradasMisVacaciones/:filtro/:usuario', (req, res) => {

  const filtro = req.params.filtro
  const usuario = req.params.usuario

  console.log("Se recupero el filtro: ", filtro)

  const obtenerIdEmpleado = `SELECT Empleado_idEmpleado FROM credenciales WHERE usuario = ?`

  conexion.query(obtenerIdEmpleado, [usuario], (error, idEmpleadoQuery) => {
    if (error) {
      console.error('Error al obtener las solicitudes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    const idEmpleado = idEmpleadoQuery[0].Empleado_idEmpleado

    const obtenerSolicitudesAceptadasQuery = `SELECT * FROM calendario WHERE Estado = ? AND Empleado_idEmpleado = ?`;
    const values = [filtro, idEmpleado]
    conexion.query(obtenerSolicitudesAceptadasQuery, values, (error, solicitudes) => {
      if (error) {
        console.error('Error al obtener las solicitudes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
      }

      console.log("las solicitudes recupoeradas son: ", solicitudes)

      const idsEmpleados = solicitudes.map(solicitud => solicitud.Empleado_idEmpleado);

      if (idsEmpleados.length === 0) {
        res.json({ solicitudes: [] });
        console.log("hay un error:")
        // No hay empleados, retornar lista vacía
        return;
      }

      const obtenerNombresQuery = `SELECT idEmpleado, nombre FROM empleado WHERE idEmpleado IN (${idsEmpleados.join(',')})`

      conexion.query(obtenerNombresQuery, (error, resultadosNombres) => {

        if (error) {
          console.error('Error al obtener las solicitudes:', error);
          res.status(500).json({ error: 'Error interno del servidor' });
          return;
        }
        const nombreEmpleadoMap = new Map();
        resultadosNombres.forEach(nombre => {
          nombreEmpleadoMap.set(nombre.idEmpleado, nombre.nombre);
        });

        const solicitudesConNombres = solicitudes.map(solicitud => ({
          ...solicitud,
          nombreEmpleado: nombreEmpleadoMap.get(solicitud.Empleado_idEmpleado)
        }));

        res.json({ solicitudesFiltradas: solicitudesConNombres });
      })
    });
  })
});

app.get('/contarSolicitudes/:usuario', (req, res) => {
  const usuario = req.params.usuario;

  const recuperarIdEmpleadoQuery = `SELECT Empleado_idEmpleado FROM credenciales WHERE usuario = ?`;

  conexion.query(recuperarIdEmpleadoQuery, [usuario], (error, idEmpleadoResultados) => {
    if (error) {
      console.error('Error al obtener empleados:', error);
      res.status(500).json({ error: 'Error al obtener los empleados' });
      return; // Importante: salir de la función aquí para evitar respuestas adicionales.
    }
    const idEmpleado = idEmpleadoResultados[0].Empleado_idEmpleado;

    const contarSolicitudesQuery = `SELECT COUNT(*) as solicitudesEmpleadoCount FROM Calendario WHERE Empleado_idEmpleado = ? and estado = ? `;
    const values = [idEmpleado, 'Pendiente'];

    conexion.query(contarSolicitudesQuery, values, (error, resultadosContarSolicitudes) => {
      if (error) {
        console.error('Error al obtener las solicitudes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
        return; // Salir de la función para evitar respuestas adicionales.
      }
      res.json({ numeroSolicitud: resultadosContarSolicitudes[0].solicitudesEmpleadoCount });
    });
  });
});


//Abre un puerto: 
app.listen(3000, () => {
  console.log('El servidor está en ejecución en el puerto 3000');
});