const express = require('express');
const QRcode = require('qrcode');
const router = express.Router();
const connection = require('../utils/MySQLConnection');
const { body, query, validationResult } = require('express-validator');

/**
 * @swagger
 * /api/appointments/generate:
 *   post:
 *     summary: Create an appointment and generate a QR code
 *     description: Creates an appointment and generates a QR code containing the appointment details.
 *     tags:
 *       - Appointments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fk_user:
 *                 type: integer
 *                 example: 1
 *               fk_hospital:
 *                 type: integer
 *                 example: 1
 *               estimated_date:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-05-17T10:00:00.000Z"
 *               description:
 *                 type: string
 *                 example: "Consulta médica general"
 *     responses:
 *       201:
 *         description: Appointment created and QR code generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appointment_id:
 *                   type: integer
 *                   example: 1
 *                 qrCode:
 *                   type: string
 *                   example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA..."
 *       500:
 *         description: Error creating appointment or generating QR code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating appointment or generating QR code"
 */

router.post(
  '/generate',
  [
    body('fk_user').isInt().withMessage('fk_user must be an integer'),
    body('fk_hospital').isInt().withMessage('fk_hospital must be an integer'),
    body('estimated_date').isISO8601().toDate().withMessage('estimated_date must be a valid date-time'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fk_user, fk_hospital, estimated_date, description } = req.body;

    const query = 'INSERT INTO appointments (estimated_date, fk_user, fk_hospital, description, fk_status) VALUES (?, ?, ?, ?, 1)';
    const values = [estimated_date, fk_user, fk_hospital, description];

    connection.query(query, values, (error, results) => {
      if (error) {
        console.error('Error creating appointment:', error);
        return res.status(500).json({ message: 'Error creating appointment' });
      }

      const appointmentId = results.insertId;

      const appointmentDetails = {
        appointment_id: appointmentId,
        estimated_date,
        fk_user,
        fk_hospital,
        description,
      };

      QRcode.toDataURL(JSON.stringify(appointmentDetails), (err, url) => {
        if (err) {
          console.error('Error generating QR code:', err);
          return res.status(500).json({ message: 'Error generating QR code' });
        }

        res.status(201).json({
          appointment_id: appointmentId,
          qrCode: url,
        });
      });
    });
  }
);

/**
 * @swagger
 * /api/appointments/by-user:
 *   get:
 *     summary: Get appointments by user ID
 *     description: Retrieves all appointments for a specific user by their user ID.
 *     tags:
 *       - Appointments
 *     parameters:
 *       - in: query
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Appointments found
 *                 appointments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       appointment_id:
 *                         type: integer
 *                         example: 1
 *                       estimated_date:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-05-17T10:00:00.000Z"
 *                       fk_user:
 *                         type: integer
 *                         example: 1
 *                       fk_hospital:
 *                         type: integer
 *                         example: 1
 *                       description:
 *                         type: string
 *                         example: "Consulta médica general"
 *       404:
 *         description: No appointments found
 *       500:
 *         description: Error retrieving appointments
 */
router.get('/by-user',
  query('user_id').isInt().withMessage('user_id must be an integer'),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id } = req.query;

    const queryStr = "SELECT * FROM appointments WHERE fk_user = ?";
    connection.query(queryStr, [user_id], (error, response) => {
      if (error) {
        console.error("Error retrieving appointments:", error);
        return res.status(500).json({
          message: 'Error retrieving appointments'
        });
      }

      if (response.length === 0) {
        return res.status(404).json({
          message: 'No appointments found'
        });
      }

      return res.status(200).json({
        message: 'Appointments found',
        appointments: response
      });
    });
  }
);

module.exports = router;
