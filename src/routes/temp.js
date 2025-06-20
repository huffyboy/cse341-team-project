import express from 'express';
import { helloWorld, getTempData } from '../controllers/temp.js';

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Hello World endpoint (Temporary)
 *     description: Simple Hello World response. This endpoint is temporary and will be removed.
 *     tags: [Temporary]
 *     responses:
 *       200:
 *         description: Hello World response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hello World!"
 */
router.get('/', helloWorld);

/**
 * @swagger
 * /db:
 *   get:
 *     summary: Get temp collection data (Temporary)
 *     description: Returns all items from the temp collection. This endpoint is temporary and will be removed.
 *     tags: [Temporary]
 *     responses:
 *       200:
 *         description: Array of temp items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   type:
 *                     type: string
 *                   value:
 *                     type: number
 *                   active:
 *                     type: boolean
 *       500:
 *         description: Database error
 */
router.get('/db', getTempData);

export default router;
