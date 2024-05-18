const express = require('express');
const connection = require('../utils/MySQLConnection');
const { body, validationResult, param } = require('express-validator');
const router = express.Router();

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the profile of a user by user_id.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User found
 *                 user:
 *                   type: object
 *                   example: { user_id: 1, name: 'John', lastname: 'Doe', email: 'john.doe@example.com', curp: 'DFKASDJFIJ314431', rfc: 'GJAFIJGSIFJ0333DAFJ01i3' }
 *       404:
 *         description: User not found
 *       500:
 *         description: Error during profile retrieval
 */
router.get('/profile',
//   param('id').isInt().withMessage('id must be an integer'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;

    const query = "SELECT * FROM users WHERE user_id = ?";
    connection.query(query, id, (error, response) => {
      if (error) {
        console.error("Bad request during get Profile:", error);
        return res.status(500).json({
          message: 'Error during get profile' 
        });
      }

      if (response.length === 0) {
        console.log()

        return res.status(404).json({

          message: 'User not found'
        });
      }

      return res.status(200).json({
        message: 'User found',
        user: response[0]
      });
    });
  }
);

/**
 * @swagger
 * /api/user/editProfile:
 *   put:
 *     summary: Edit user profile
 *     description: Edits the profile of a user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *               - lastname
 *               - email
 *               - curp
 *               - rfc
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
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
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Error during profile update
 */
router.put('/editProfile',
  [
    body('id').isInt().withMessage('id must be an integer'),
    body('name').isString().withMessage('name must be a string'),
    body('lastname').isString().withMessage('lastname must be a string'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('curp').isString().withMessage('CURP must be a string'),
    body('rfc').isString().withMessage('RFC must be a string')
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id, name, lastname, email, curp, rfc } = req.body;

      const query = "UPDATE users SET name = ?, lastname = ?, email = ?, curp = ?, rfc = ? WHERE user_id = ?";
      connection.query(query, [name, lastname, email, curp, rfc, id], (error, response) => {
        if (error) {
          console.error("Error during edit profile:", error);
          return res.status(500).json({
            message: 'Error during profile update'
          });
        }

        return res.status(200).json({
          message: 'User profile updated successfully'
        });
      });
    } catch (error) {
      console.error("Internal Server Error during edit profile:", error);
      return res.status(500).json({
        message: 'Internal server error during profile update'
      });
    }
  }
);

module.exports = router;
