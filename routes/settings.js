const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { isAuthenticated } = require('../middleware/auth');
const settingsController = require('../controllers/settingsController');

// Configure multer for skill icon uploads
const skillIconStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'skill-icon-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const skillIconUpload = multer({ 
  storage: skillIconStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// All routes are protected
router.use(isAuthenticated);

// @route   GET /admin/settings
router.get('/', settingsController.getSettings);

// @route   POST /admin/settings/profile
router.post('/profile', settingsController.updateProfile);

// @route   POST /admin/settings/social
router.post('/social', settingsController.updateSocial);

// @route   POST /admin/settings/skills
router.post('/skills', settingsController.updateSkills);

// @route   POST /admin/settings/skills/upload/:skillName
router.post('/skills/upload/:skillName', skillIconUpload.single('skillIcon'), settingsController.uploadSkillIcon);

// @route   POST /admin/settings/about
router.post('/about', settingsController.updateAbout);

module.exports = router;
