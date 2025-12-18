import express from 'express';
import auth from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';
import { getAllowedDomains, addAllowedDomain, removeAllowedDomain } from '../server/allowedDomainsService.js';

const router = express.Router();

// GET /api/admin/allowed-domains
router.get('/allowed-domains', auth, admin, async (req, res) => {
  try {
    const rows = await getAllowedDomains();
    res.json(rows);
  } catch (err) {
    req.log?.error({ err }, 'Error fetching allowed domains');
    res.status(500).json({ msg: 'Server Error' });
  }
});

// POST /api/admin/allowed-domains { domain }
router.post('/allowed-domains', auth, admin, async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain || typeof domain !== 'string') return res.status(400).json({ msg: 'domain is required' });
    // basic domain sanity check
    const hostname = domain.trim().toLowerCase();
    if (hostname.length < 3 || hostname.length > 255) return res.status(400).json({ msg: 'domain looks invalid' });

    const existing = await import('../server/allowedDomainsService.js').then(m => m.findDomain(hostname));
    if (existing) return res.status(409).json({ msg: 'Domain already exists' });

    const result = await addAllowedDomain(hostname, req.user?.id || null);
    res.status(201).json(result);
  } catch (err) {
    req.log?.error({ err }, 'Error adding allowed domain');
    res.status(500).json({ msg: 'Server Error' });
  }
});

// DELETE /api/admin/allowed-domains/:id
router.delete('/allowed-domains/:id', auth, admin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ msg: 'Invalid id' });
    await removeAllowedDomain(id);
    res.json({ msg: 'Removed' });
  } catch (err) {
    req.log?.error({ err }, 'Error removing allowed domain');
    res.status(500).json({ msg: 'Server Error' });
  }
});

export default router;