const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

// @route   GET /api/tasks
// @desc    Get tasks (admin: all, member: assigned to them)
// @access  Private
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { projectId, status, assignedTo } = req.query;
    let filter = {};

    if (req.user.role !== 'admin') {
      filter.assignedTo = req.user._id;
    } else {
      if (assignedTo) filter.assignedTo = assignedTo;
    }

    if (projectId) filter.project = projectId;
    if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .populate('project', 'title')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tasks
// @desc    Create task
// @access  Private (Admin)
router.post('/', authMiddleware, adminMiddleware, validate(schemas.createTask), async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, projectId, assignedTo } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id
    });

    const populated = await task.populate([
      { path: 'project', select: 'title' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({ success: true, task: populated });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'title members')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private (Admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, dueDate: dueDate || null, assignedTo: assignedTo || null },
      { new: true, runValidators: true }
    ).populate('project', 'title')
     .populate('assignedTo', 'name email')
     .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private (Admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/tasks/:id/status
// @desc    Update task status (member can update their own tasks)
// @access  Private
router.put('/:id/status', authMiddleware, validate(schemas.updateTaskStatus), async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Members can only update their own tasks
    if (req.user.role !== 'admin' && task.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only update your own tasks' });
    }

    task.status = status;
    await task.save();

    const populated = await task.populate([
      { path: 'project', select: 'title' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.json({ success: true, task: populated });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/tasks/assign
// @desc    Assign task to user
// @access  Private (Admin)
router.post('/assign', authMiddleware, adminMiddleware, async (req, res, next) => {
  try {
    const { taskId, userId } = req.body;

    const task = await Task.findByIdAndUpdate(
      taskId,
      { assignedTo: userId || null },
      { new: true }
    ).populate('assignedTo', 'name email')
     .populate('project', 'title');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ success: true, task });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
