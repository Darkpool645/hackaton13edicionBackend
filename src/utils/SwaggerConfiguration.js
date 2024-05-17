const swaggerJSDoc = require('swagger-jsdoc');

// Basic metadata about our API
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Medical App API',
            version: '1.0.0',
            description: "API's about medical situation in the hackaton"
        },
    },
    apis:['./src/controllers/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;