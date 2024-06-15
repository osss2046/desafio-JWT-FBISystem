const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { results } = require('./agentes');

const app = express();
const SECRET_KEY = 'your_secret_key'; // Cambiar por una clave secreta segura

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Ruta de autenticación
app.post('/SignIn', (req, res) => {
  const { email, password } = req.body;
  const agent = results.find(agent => agent.email === email && agent.password === password);

  if (agent) {
    const token = jwt.sign({
      exp: Math.floor(Date.now() / 1000) + 120,
      email: agent.email
    }, SECRET_KEY);
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>FBI System</title>
          <link
            rel="stylesheet"
            href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
          />
        </head>
        <body>
          <div class="container mt-5">
            <h1>Bienvenido, agente autorizado</h1>
            <p>Email autorizado: ${agent.email}</p>
            <a href="/restricted" class="btn btn-primary">Ir a la ruta restringida</a>
          </div>
          <script>
            sessionStorage.setItem('token', '${token}');
          </script>
        </body>
      </html>
    `);
  } else {
    res.status(401).send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>FBI System</title>
          <link
            rel="stylesheet"
            href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
          />
        </head>
        <body>
          <div class="container mt-5">
            <h1>Acceso denegado</h1>
            <p>Credenciales inválidas</p>
            <a href="/" class="btn btn-primary">Volver al inicio</a>
          </div>
        </body>
      </html>
    `);
  }
});

// Ruta restringida
app.get('/restricted', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send('Acceso no autorizado: No se proporcionó un token.');
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.send(`Bienvenido, agente autorizado: ${decoded.email}`);
  } catch (err) {
    res.status(401).send('Acceso no autorizado: Token inválido o expirado.');
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
