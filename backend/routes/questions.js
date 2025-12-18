import express from 'express';
import { body, param, validationResult } from 'express-validator';
import * as svc from '../services/intrebari.js';

const router = express.Router();

// GET /api/questions
router.get('/', async (req, res, next) => {
  try {
    const rows = await svc.getAllIntrebari();
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/questions/:id
router.get(
  '/:id',
  param('id').isInt().withMessage('id must be an integer'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const row = await svc.getIntrebareById(req.params.id);
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json(row);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/questions
router.post(
  '/',
  body('text').isString().isLength({ min: 1, max: 255 }).withMessage('text is required (max 255 chars)'),
  body('id_poza').optional().isInt().withMessage('id_poza must be integer'),
  body('tipQ_1xR').optional().isInt({ min: 0 }).withMessage('tipQ_1xR must be integer'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { text, id_poza, tipQ_1xR } = req.body;
      const created = await svc.createQuestion({ text, id_poza, tipQ_1xR });
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/questions/:id
router.put(
  '/:id',
  param('id').isInt().withMessage('id must be an integer'),
  body('text').optional().isString().isLength({ max: 255 }),
  body('id_poza').optional().isInt(),
  body('tipQ_1xR').optional().isInt({ min: 0 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const updated = await svc.updateIntrebare(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/questions/:id
router.delete(
  '/:id',
  param('id').isInt().withMessage('id must be an integer'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      await svc.deleteIntrebare(req.params.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }
);

export default router;
