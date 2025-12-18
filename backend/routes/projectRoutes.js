import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { getProjects, createProject, deleteProject } from '../controllers/projectController.js';

const router = express.Router();

router.get('/', auth, getProjects);
router.post('/', auth, createProject);
router.delete('/:id', auth, deleteProject);

export default router;