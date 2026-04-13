const Project = require('../models/Project');
const path = require('path');
const multer = require('multer');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'project-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// @desc    Show all projects in admin panel
// @route   GET /admin/projects
exports.getAdminProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.render('admin/projects/index', { 
      title: 'Manage Projects',
      projects 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// @desc    Show create project form
// @route   GET /admin/projects/new
exports.getNewProject = (req, res) => {
  res.render('admin/projects/form', { 
    title: 'Add New Project',
    project: null,
    error: null 
  });
};

// @desc    Create new project
// @route   POST /admin/projects
exports.createProject = async (req, res) => {
  try {
    upload.single('image')(req, res, async function (err) {
      if (err) {
        return res.render('admin/projects/form', { 
          title: 'Add New Project',
          project: null,
          error: err.message 
        });
      }

      const { title, description, technologies, projectUrl, githubUrl, featured, order } = req.body;
      
      const projectData = {
        title,
        description,
        technologies: technologies ? technologies.split(',').map(t => t.trim()) : [],
        projectUrl,
        githubUrl,
        featured: featured === 'on',
        order: order || 0,
        image: '/images/default_projectImage.png' // Default image
      };

      if (req.file) {
        projectData.image = `/uploads/${req.file.filename}`;
      }

      const project = new Project(projectData);
      await project.save();

      res.redirect('/admin/projects');
    });
  } catch (error) {
    console.error(error);
    res.render('admin/projects/form', { 
      title: 'Add New Project',
      project: null,
      error: 'Error creating project' 
    });
  }
};

// @desc    Show edit project form
// @route   GET /admin/projects/:id/edit
exports.getEditProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).send('Project not found');
    }
    res.render('admin/projects/form', { 
      title: 'Edit Project',
      project,
      error: null 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// @desc    Update project
// @route   PUT /admin/projects/:id
exports.updateProject = async (req, res) => {
  try {
    upload.single('image')(req, res, async function (err) {
      if (err) {
        const project = await Project.findById(req.params.id);
        return res.render('admin/projects/form', { 
          title: 'Edit Project',
          project,
          error: err.message 
        });
      }

      const { title, description, technologies, projectUrl, githubUrl, featured, order } = req.body;
      
      const projectData = {
        title,
        description,
        technologies: technologies ? technologies.split(',').map(t => t.trim()) : [],
        projectUrl,
        githubUrl,
        featured: featured === 'on',
        order: order || 0
      };

      if (req.file) {
        projectData.image = `/uploads/${req.file.filename}`;
      }

      const project = await Project.findByIdAndUpdate(
        req.params.id,
        projectData,
        { new: true, runValidators: true }
      );

      if (!project) {
        return res.status(404).send('Project not found');
      }

      res.redirect('/admin/projects');
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// @desc    Delete project
// @route   DELETE /admin/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).send('Project not found');
    }
    res.redirect('/admin/projects');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};
