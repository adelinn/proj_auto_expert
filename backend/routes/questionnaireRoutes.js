import express from 'express';
import { param, body, validationResult } from 'express-validator';
import auth from '../middleware/authMiddleware.js';
import * as ctrl from '../controllers/questionnaireController.js';

const router = express.Router();

// GET /api/chestionare - Lista chestionarelor utilizatorului
router.get('/chestionare', auth, ctrl.getChestionare);

// POST /api/chestionare - Creează un chestionar nou
router.post('/chestionare', auth, ctrl.createChestionar);

// GET /api/chestionar/:id - Detalii chestionar cu toate întrebările
router.get(
  '/chestionar/:id',
  auth,
  param('id').isInt().withMessage('ID-ul examenului trebuie să fie un număr întreg'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  ctrl.getChestionarById
);

// POST /api/chestionar/:id/intrebare/:id_intrebare - Răspunde la o întrebare
router.post(
  '/chestionar/:id/intrebare/:id_intrebare',
  auth,
  param('id').isInt().withMessage('ID-ul examenului trebuie să fie un număr întreg'),
  param('id_intrebare').isInt().withMessage('ID-ul întrebării trebuie să fie un număr întreg'),
  body('raspunsuri')
    .isArray({ min: 1 })
    .withMessage('Răspunsurile trebuie să fie un array cu cel puțin un element'),
  body('raspunsuri.*')
    .isInt()
    .withMessage('Fiecare răspuns trebuie să fie un număr întreg'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  ctrl.answerQuestion
);

export default router;
