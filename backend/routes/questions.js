import express from 'express';
import { body, param, validationResult } from 'express-validator';
import * as intrebari from '../repositories/intrebari.js';
import logger from '../server/logger.js';

const router = express.Router();

// GET /api/questions
router.get('/', async (req, res, next) => {
  const log = req?.log || logger;
  try {
    const rows = await intrebari.getAll();
    res.json(rows);
  } catch (err) {
    log.error({ err }, 'Error fetching all questions');
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
    const log = req?.log || logger;
    try {
      const row = await intrebari.getById(req.params.id);
      if (!row) return res.status(404).json({ error: 'Not found' });
      res.json(row);
    } catch (err) {
      log.error({ err, questionId: req.params.id }, 'Error fetching question by ID');
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
    const log = req?.log || logger;
    try {
      const { text, id_poza, tipQ_1xR } = req.body;
      const created = await intrebari.create({ text, id_poza, tipQ_1xR });
      res.status(201).json(created);
    } catch (err) {
      log.error({ err, body: req.body }, 'Error creating question');
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
    const log = req?.log || logger;
    try {
      const updated = await intrebari.update(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      log.error({ err, questionId: req.params.id, body: req.body }, 'Error updating question');
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
    const log = req?.log || logger;
    try {
      await intrebari.delete(req.params.id);
      res.status(204).end();
    } catch (err) {
      log.error({ err, questionId: req.params.id }, 'Error deleting question');
      next(err);
    }
  }
);

export default router;
