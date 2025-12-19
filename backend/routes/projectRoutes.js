import express from 'express';
import auth from '../middleware/authMiddleware.js';
import { getProjects, createProject, deleteProject } from '../controllers/projectController.js';
import { getJobStatus } from '../server/queueStatus.js';

const router = express.Router();

router.get('/', auth, getProjects);
router.post('/', auth, createProject);
router.delete('/:id', auth, deleteProject);
router.get('/jobs/:id', auth, async (req, res) => {
	try {
		const status = await getJobStatus(req.params.id, req.user.id);
		if (!status) return res.status(404).json({ msg: 'Job not found' });
		if (status.unauthorized) return res.status(403).json({ msg: 'Not authorized' });
		res.json(status);
	} catch (err) {
		res.status(500).json({ msg: 'Server Error' });
	}
});

export default router;