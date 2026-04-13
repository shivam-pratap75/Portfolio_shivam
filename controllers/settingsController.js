const SiteSettings = require('../models/SiteSettings');

// @desc    Get settings page
// @route   GET /admin/settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne();
    
    // If no settings exist, create default
    if (!settings) {
      settings = new SiteSettings();
      await settings.save();
    }
    
    res.render('admin/settings/index', { 
      title: 'Site Settings',
      settings 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// @desc    Update profile information
// @route   POST /admin/settings/profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, title, tagline, description, email, phone, location } = req.body;
    
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      settings = new SiteSettings();
    }
    
    settings.fullName = fullName;
    settings.title = title;
    settings.tagline = tagline;
    settings.description = description;
    settings.email = email;
    settings.phone = phone;
    settings.location = location;
    settings.updatedAt = Date.now();
    
    await settings.save();
    
    req.flash('success_msg', 'Profile updated successfully');
    res.redirect('/admin/settings');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error updating profile');
    res.redirect('/admin/settings');
  }
};

// @desc    Update social links
// @route   POST /admin/settings/social
exports.updateSocial = async (req, res) => {
  try {
    const { github, linkedin, leetcode } = req.body;
    
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      settings = new SiteSettings();
    }
    
    settings.socialLinks = { github, linkedin, leetcode };
    settings.updatedAt = Date.now();
    
    await settings.save();
    
    req.flash('success_msg', 'Social links updated successfully');
    res.redirect('/admin/settings');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error updating social links');
    res.redirect('/admin/settings');
  }
};

// @desc    Update skills
// @route   POST /admin/settings/skills
exports.updateSkills = async (req, res) => {
  try {
    const { skillNames } = req.body;
    
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      settings = new SiteSettings();
    }
    
    // Parse skills from comma-separated string
    if (skillNames) {
      const skillsArray = skillNames.split(',').map(skill => skill.trim()).filter(skill => skill);
      settings.skills = skillsArray.map((skill, index) => ({
        name: skill,
        icon: getIconForSkill(skill),
        image: '', // Will be updated separately if image uploaded
        order: index
      }));
    }
    
    settings.updatedAt = Date.now();
    
    await settings.save();
    
    req.flash('success_msg', 'Skills updated successfully');
    res.redirect('/admin/settings');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error updating skills');
    res.redirect('/admin/settings');
  }
};

// @desc    Upload skill icon image
// @route   POST /admin/settings/skills/upload/:skillName
exports.uploadSkillIcon = async (req, res) => {
  try {
    const { skillName } = req.params;
    
    if (!req.file) {
      req.flash('error_msg', 'No image uploaded');
      return res.redirect('/admin/settings');
    }
    
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      req.flash('error_msg', 'Settings not found');
      return res.redirect('/admin/settings');
    }
    
    // Find and update the specific skill
    const skillIndex = settings.skills.findIndex(
      s => s.name.toLowerCase() === skillName.toLowerCase()
    );
    
    if (skillIndex === -1) {
      req.flash('error_msg', 'Skill not found');
      return res.redirect('/admin/settings');
    }
    
    settings.skills[skillIndex].image = `/images/${req.file.filename}`;
    settings.updatedAt = Date.now();
    
    await settings.save();
    
    req.flash('success_msg', 'Skill icon uploaded successfully');
    res.redirect('/admin/settings');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error uploading skill icon');
    res.redirect('/admin/settings');
  }
};

// @desc    Update about section
// @route   POST /admin/settings/about
exports.updateAbout = async (req, res) => {
  try {
    const { aboutTitle, aboutDescription, whatIDo } = req.body;
    
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      settings = new SiteSettings();
    }
    
    settings.aboutTitle = aboutTitle;
    settings.aboutDescription = aboutDescription;
    
    // Parse what I do list
    if (whatIDo) {
      const whatIDoArray = whatIDo.split('\n').map(text => text.trim()).filter(text => text);
      settings.whatIDo = whatIDoArray.map((text, index) => ({
        text,
        order: index
      }));
    }
    
    settings.updatedAt = Date.now();
    
    await settings.save();
    
    req.flash('success_msg', 'About section updated successfully');
    res.redirect('/admin/settings');
  } catch (error) {
    console.error(error);
    req.flash('error_msg', 'Error updating about section');
    res.redirect('/admin/settings');
  }
};

// Helper function to get icon class for skill
function getIconForSkill(skillName) {
  const skillIcons = {
    'node.js': 'fab fa-node-js',
    'nodejs': 'fab fa-node-js',
    'javascript': 'fab fa-js',
    'js': 'fab fa-js',
    'react': 'fab fa-react',
    'react.js': 'fab fa-react',
    'reactjs': 'fab fa-react',
    'python': 'fab fa-python',
    'py': 'fab fa-python',
    'mongodb': 'fas fa-database',
    'mongo': 'fas fa-database',
    'html5': 'fab fa-html5',
    'html': 'fab fa-html5',
    'css3': 'fab fa-css3-alt',
    'css': 'fab fa-css3-alt',
    'git': 'fab fa-git-alt',
    'github': 'fab fa-github',
    'express': 'fas fa-server',
    'express.js': 'fas fa-server',
    'expressjs': 'fas fa-server',
    'mongoose': 'fas fa-leaf',
    'ejs': 'fas fa-file-code',
    'bootstrap': 'fab fa-bootstrap',
    'tailwind': 'fas fa-wind',
    'tailwindcss': 'fas fa-wind',
    'typescript': 'fab fa-js-square',
    'ts': 'fab fa-js-square',
    'vue.js': 'fab fa-vuejs',
    'vue': 'fab fa-vuejs',
    'vuejs': 'fab fa-vuejs',
    'angular': 'fab fa-angular',
    'mysql': 'fas fa-database',
    'postgresql': 'fas fa-database',
    'postgres': 'fas fa-database',
    'docker': 'fab fa-docker',
    'aws': 'fab fa-aws',
    'firebase': 'fas fa-fire',
    'redux': 'fab fa-redux',
    'next.js': 'fas fa-n',
    'nextjs': 'fas fa-n',
    'jquery': 'fab fa-jquery',
    'sass': 'fab fa-sass',
    'webpack': 'fas fa-box-open',
    'npm': 'fab fa-npm',
    'java': 'fab fa-java',
    'c': 'fas fa-code',
    'c++': 'fas fa-code',
    'cpp': 'fas fa-code',
    'c#': 'fas fa-code',
    'csharp': 'fas fa-code',
    'php': 'fab fa-php',
    'laravel': 'fab fa-laravel',
    'django': 'fas fa-leaf',
    'flask': 'fas fa-flask',
    'graphql': 'fas fa-project-diagram',
    'rest api': 'fas fa-plug',
    'figma': 'fab fa-figma',
    'photoshop': 'fas fa-image',
    'linux': 'fab fa-linux',
    'windows': 'fab fa-windows',
    'vscode': 'fas fa-code',
    'postman': 'fas fa-paper-plane',
  };
  
  // Convert to lowercase and trim for case-insensitive matching
  const skillLower = skillName.toLowerCase().trim();
  
  return skillIcons[skillLower] || 'fas fa-code';
}
