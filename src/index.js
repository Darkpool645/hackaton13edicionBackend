const express = require('express');
const connection = require('./utils/MySQLConnection');
const AuthController = require('./controllers/AuthController');
const swaggerSpec = require('./utils/SwaggerConfiguration')
const swaggerUi = require('swagger-ui-express');
const HospitalController = require('./controllers/HospitalController');
const AuthMiddleware = require('./middleware/AuthMiddleware');
const cors = require('cors');
const AppointmentController = require("./controllers/AppointmentsController");

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api-docs',swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;

app.use('/api/auth',AuthController);
app.use('/api/hospital', HospitalController);
app.use('/api/appointments', AppointmentController);

app.listen(PORT,() => {
    console.log(`Server Running at port ${PORT}`);
    console.log(`To see all the endpoints, look for http://localhost:${PORT}/api-docs`)
})
