import Project from '../models/Project.js';
import { analyzeLinks } from '../services/geminiService.js';

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

export const createProject = async (req, res) => {
  const { name, links } = req.body;
  try {
    const sanitizedLinks = (links || [])
      .map(l => (l || '').trim())
      .filter(Boolean);

    if (!sanitizedLinks.length) {
      return res.status(400).json({ msg: 'Please provide at least one valid link.' });
    }

    // 1. Create basic project
    let project = new Project({
      user: req.user.id,
      name,
      links: sanitizedLinks,
      analysis: null // Pending
    });
    
    // 2. Trigger AI Analysis
    const analysisResult = await analyzeLinks(sanitizedLinks);
    project.analysis = analysisResult;

    await project.save();
    res.json(project);
  } catch (err) {
    console.error('Error creating project / analyzing links', err);
    res.status(500).json({ msg: 'Server Error during analysis' });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Check if project belongs to user
    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Project removed' });
  } catch (err) {
    console.error('Error deleting project', err);
    res.status(500).json({ msg: 'Server Error' });
  }
};