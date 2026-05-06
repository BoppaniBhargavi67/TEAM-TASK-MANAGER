const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', authMiddleware, async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const userId = req.user._id;
    const now = new Date();

    let taskFilter = isAdmin ? {} : { assignedTo: userId };
    let projectFilter = isAdmin ? {} : { 'members.user': userId };

    const [totalTasks, todoTasks, inProgressTasks, completedTasks, overdueTasks, totalProjects, totalUsers] = await Promise.all([
      Task.countDocuments(taskFilter),
      Task.countDocuments({ ...taskFilter, status: 'todo' }),
      Task.countDocuments({ ...taskFilter, status: 'inprogress' }),
      Task.countDocuments({ ...taskFilter, status: 'completed' }),
      Task.countDocuments({ ...taskFilter, status: { $ne: 'completed' }, dueDate: { $lt: now, $ne: null } }),
      Project.countDocuments(projectFilter),
      isAdmin ? User.countDocuments() : Promise.resolve(null)
    ]);

    // Tasks by project (for chart)
    const tasksByProject = await Task.aggregate([
      { $match: isAdmin ? {} : { assignedTo: userId } },
      {
        $group: {
          _id: '$project',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'projects',
          localField: '_id',
          foreignField: '_id',
          as: 'project'
        }
      },
      { $unwind: '$project' },
      {
        $project: {
          projectName: '$project.title',
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    // Upcoming deadlines (next 7 days)
    const upcomingDeadlines = await Task.find({
      ...taskFilter,
      dueDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
      status: { $ne: 'completed' }
    })
    .populate('project', 'title')
    .populate('assignedTo', 'name')
    .sort({ dueDate: 1 })
    .limit(5);

    res.json({
      success: true,
      stats: {
        totalTasks,
        todoTasks,
        inProgressTasks,
        completedTasks,
        overdueTasks,
        totalProjects,
        ...(isAdmin && { totalUsers }),
        tasksByProject,
        upcomingDeadlines
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/dashboard/overdue
// @desc    Get overdue tasks
// @access  Private
router.get('/overdue', authMiddleware, async (req, res, next) => {
  try {
    const filter = {
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date(), $ne: null }
    };

    if (req.user.role !== 'admin') {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate('project', 'title')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 })
      .limit(20);

    res.json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
