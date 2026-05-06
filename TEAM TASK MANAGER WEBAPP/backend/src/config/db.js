const mongoose = require('mongoose');

const connectDB = async () => {
  // Try Atlas first
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('your_username')) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.warn(`⚠️  Atlas connection failed: ${error.message}`);
      console.log('🔄 Falling back to in-memory MongoDB...');
    }
  }

  // Fallback: In-memory MongoDB for local dev
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`✅ In-Memory MongoDB started: ${conn.connection.host}`);
    console.log('⚠️  Using in-memory DB (data will not persist between restarts)');
    console.log('📝 To use real DB, set MONGODB_URI in .env');

    // Seed demo data
    setTimeout(() => seedDemoData(), 1000);
  } catch (err) {
    console.error(`❌ Fatal DB error: ${err.message}`);
    process.exit(1);
  }
};

const seedDemoData = async () => {
  try {
    const User = require('../models/User');
    const existing = await User.countDocuments();
    if (existing > 0) return;

    // Create demo users
    const admin = await User.create({ name: 'Admin User', email: 'admin@demo.com', password: 'password123', role: 'admin' });
    const member = await User.create({ name: 'Jane Member', email: 'member@demo.com', password: 'password123', role: 'member' });

    const Project = require('../models/Project');
    const project = await Project.create({
      title: 'Website Redesign',
      description: 'Redesign the company website with modern UI/UX.',
      createdBy: admin._id,
      members: [{ user: admin._id, role: 'admin' }, { user: member._id, role: 'member' }]
    });

    const Task = require('../models/Task');
    await Task.create([
      { title: 'Design mockups', description: 'Create Figma mockups', status: 'completed', priority: 'high', project: project._id, assignedTo: member._id, createdBy: admin._id, dueDate: new Date(Date.now() - 86400000 * 3) },
      { title: 'Setup React project', description: 'Initialize project with Vite', status: 'inprogress', priority: 'high', project: project._id, assignedTo: member._id, createdBy: admin._id, dueDate: new Date(Date.now() + 86400000 * 2) },
      { title: 'Implement auth', description: 'JWT authentication', status: 'todo', priority: 'medium', project: project._id, assignedTo: member._id, createdBy: admin._id, dueDate: new Date(Date.now() + 86400000 * 7) },
      { title: 'API integration', description: 'Connect frontend to backend', status: 'todo', priority: 'low', project: project._id, createdBy: admin._id }
    ]);

    console.log('🌱 Demo data seeded! Login: admin@demo.com / password123');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

module.exports = connectDB;
