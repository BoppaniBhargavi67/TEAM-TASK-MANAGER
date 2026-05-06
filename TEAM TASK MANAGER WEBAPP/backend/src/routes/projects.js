const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// @route   GET /api/projects
// @desc    Get all projects (admin: all, member: own)
// @access  Private
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find()
        .populate('createdBy', 'name email')
        .populate('members.user', 'name email role')
        .populate('taskCount')
        .sort({ createdAt: -1 });
    } else {
      projects = await Project.find({ 'members.user': req.user._id })
        .populate('createdBy', 'name email')
        .populate('members.user', 'name email role')
        .sort({ createdAt: -1 });
    }
    res.json({ success: true, projects });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private (Admin)
router.post('/', authMiddleware, adminMiddleware, validate(schemas.createProject), async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const project = await Project.create({
      title,
      description,
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    const populated = await project.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'members.user', select: 'name email role' }
    ]);

    res.status(201).json({ success: true, project: populated });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access
    if (req.user.role !== 'admin') {
      const isMember = project.members.some(m => m.user._id.toString() === req.user._id.toString());
      if (!isMember) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { title, description, status } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, status },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email').populate('members.user', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ success: true, project });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete all tasks in this project
    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project and its tasks deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/projects/:id/members
// @desc    Add member to project
// @access  Private (Admin)
router.post('/:id/members', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const alreadyMember = project.members.some(m => m.user.toString() === userId);
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    project.members.push({ user: userId, role: role || 'member' });
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email role');

    res.json({ success: true, project: updated });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remove member from project
// @access  Private (Admin)
router.delete('/:id/members/:userId', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.members = project.members.filter(
      m => m.user.toString() !== req.params.userId
    );
    await project.save();

    const updated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email role');

    res.json({ success: true, project: updated });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
