const express = require('express');
const QRcode = require('qrcode');
const router = express.Router();
const connection = require('../utils/MySQLConnection');
const { body, validationResult } = require('express-validator');

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

    const query = 'INSERT INTO appointments (estimated_date, fk_user, fk_hospital, description) VALUES (?, ?, ?, ?)';
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

module.exports = router;
