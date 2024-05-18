const express = require('express');
const { generateHashedPassword, verifyPassword } = require('../utils/PasswordEncoder');
const connection = require('../utils/MySQLConnection');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const JWT_SECRET = '2c270115ae56d4cde440388050dab6030aed0e59851d71d16b266b07a57ee49d';

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: User signup
 *     description: Creates a new user and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - lastname
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John
 *               lastname:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               curp:
 *                 type: string
 *                 example: DFKASDJFIJ314431
 *               rfc:
 *                 type: string
 *                 example: GJAFIJGSIFJ0333DAFJ01i3
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User created successfully
 *         headers:
 *           Authorization:
 *             description: Bearer token
 *             schema:
 *               type: string
 *               example: Bearer <token>
 *       400:
 *         description: Email, CURP, or RFC already exists
 *       500:
 *         description: Error during signup
 */
router.post(
  '/signup',
  [
    body('name').isString().withMessage('Name must be a string'),
    body('lastname').isString().withMessage('Lastname must be a string'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('curp').isString().withMessage('CURP must be a string'),
    body('rfc').isString().withMessage('RFC must be a string'),
    body('password').isString().withMessage('Password must be a string'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, lastname, email, curp, rfc, password } = req.body;

      // Hashear la contraseña
      const hashedPassword = generateHashedPassword(password);

      // Verificar si el correo, CURP o RFC ya existen
      const checkDuplicateQuery = 'SELECT email, curp, rfc FROM users WHERE email = ? OR rfc = ? OR curp = ?';
      connection.query(checkDuplicateQuery, [email, rfc, curp], (err, results) => {
        if (err) {
          console.error('Error checking for duplicates: ', err);
          return res.status(500).json({
            error: 'Error checking for duplicates',
          });
        }

        if (results.length > 0) {
          return res.status(400).json({
            message: 'Email, CURP, or RFC already exists',
          });
        }

        // Insertar el nuevo usuario en la base de datos
        const insertUserQuery =
          'INSERT INTO users (name, lastname, email, curp, rfc, password, salt) VALUES (?,?,?,?,?,?,?)';
        connection.query(
          insertUserQuery,
          [name, lastname, email, curp, rfc, hashedPassword.hash, hashedPassword.salt],
          (err, result) => {
            if (err) {
              console.error('Error during signup: ', err);
              return res.status(500).json({
                error: 'Error during signup',
              });
            }

            // Generar el token con JWT
            const token = jwt.sign({ email: email }, JWT_SECRET, { expiresIn: '1d' });

            // Crear el objeto de usuario sin la contraseña y el salt
            const userResponse = {
              name,
              lastname,
              email,
              curp,
              rfc,
            };

            return res.status(201).header('Authorization', `Bearer ${token}`).json({
              message: 'User created successfully',
              user: userResponse,
            });
          }
        );
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns a JWT token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         headers:
 *           Authorization:
 *             description: Bearer token
 *             schema:
 *               type: string
 *               example: Bearer <token>
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Error during login
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isString().withMessage('Password must be a string'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Verificar si el usuario existe en la base de datos
      const findUserQuery = 'SELECT * FROM users WHERE email = ?';
      connection.query(findUserQuery, [email], (err, results) => {
        if (err) {
          console.error('Error finding user: ', err);
          return res.status(500).json({
            error: 'Error finding user',
          });
        }

        if (results.length === 0) {
          return res.status(400).json({
            message: 'Invalid email or password',
          });
        }

        const user = results[0];

        // Verificar la contraseña
        if (!verifyPassword(password, user.salt, user.password)) {
          console.error('Invalid password attempt');
          return res.status(400).json({
            message: 'Invalid email or password',
          });
        }

        // Generar el token con JWT
        const token = jwt.sign({ email: email }, JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).header('Authorization', `Bearer ${token}`).json({
          message: 'User authenticated successfully',
          user: {
            name: user.name,
            lastname: user.lastname,
            email: user.email,
            curp: user.curp,
            rfc: user.rfc,
          },
        });
      });
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
);

module.exports = router;
