const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'hackaton13edicion'
});

connection.connect((err) => {
    if(err) {
        console.error('Error trying connect to database: ',err.stack);
        return;
    }
    console.log('Connection to database successfully');
});

module.exports = connection;