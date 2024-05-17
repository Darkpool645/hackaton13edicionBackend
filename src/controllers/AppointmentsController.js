const express = require('express');
const QRcode = require('qrcode');
const router = express.Router();
const connection = require('../utils/MySQLConnection')

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

router.post('/generate', (req, res) => {
    const { fk_user, fk_hospital } = req.body;
    const currentDate = new Date();

    const query = 'INSERT INTO appointments (estimated_date, fk_user, fk_hospital) VALUES (?, ?, ?)';
    const values = [currentDate, fk_user, fk_hospital];

    connection.query(query, values, (error, results) => {
        if (error) {
            console.log("No jala esta madre:",error);
            return res.status(500).json({ message: 'Error creating appointment' });
        }

        const appointmentId = results.insertId;

        const appointmentDetails = {
            appointment_id: appointmentId,
            currentDate,
            fk_user,
            fk_hospital
        };

        QRcode.toDataURL(JSON.stringify(appointmentDetails), (err, url) => {
            if (err) {
                return res.status(500).json({ message: 'Error generating QR code' });
            }

            res.status(201).json({
                appointment_id: appointmentId,
                qrCode: url
            });
        });
    });
});

module.exports = router;
