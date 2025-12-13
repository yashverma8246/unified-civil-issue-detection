const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { classifyIssue, verifyResolution } = require('./geminiService');
const issueModel = require('./issueModel');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Routes

/**
 * REPORT ISSUE
 * Receives image, calls Gemini for analysis, saves to DB.
 */
app.post('/api/report_issue', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);
    const mimeType = req.file.mimetype;

    console.log(`Processing issue report for ${req.file.filename}...`);

    // 1. Call Gemini Service
    const aiResult = await classifyIssue(imageBuffer, mimeType);
    console.log('Gemini Analysis:', aiResult);

    const issueData = {
      image_url_before: `/uploads/${req.file.filename}`,
      issue_type: aiResult.issue_type || 'Unknown',
      severity: aiResult.severity || 'Medium',
      department_assigned: aiResult.department || 'Admin',
      description: req.body.description || aiResult.description || 'Reported by citizen',
      status: 'Reported',
      sla_due_date: calculateSLA(aiResult.severity),
      reporter_id: req.body.reporter_id || 'anonymous',
    };

    // 2. Save to DB via Model
    const savedIssue = await issueModel.createIssue(issueData);

    res.json({ success: true, issue: savedIssue, analysis: aiResult });
  } catch (error) {
    console.error('Error reporting issue:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

/**
 * RESOLVE ISSUE
 * Receives after-image, verifies with Gemini, updates DB.
 */
app.post('/api/resolve_issue', upload.single('image_after'), async (req, res) => {
  try {
    const { issue_id } = req.body;
    if (!req.file || !issue_id) {
      return res.status(400).json({ error: 'Missing image or issue_id' });
    }

    // Retrieve original issue to get "before" image
    const issue = await issueModel.getIssueById(issue_id);

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Resolve paths
    // Handle both absolute and relative paths from DB
    let beforeImagePath = issue.image_url_before;
    if (beforeImagePath.startsWith('/uploads')) {
      // e.g. /uploads/filename.jpg -> d:\...\node\uploads\filename.jpg
      beforeImagePath = path.join(__dirname, beforeImagePath);
    }

    const afterImagePath = req.file.path;

    if (!fs.existsSync(beforeImagePath)) {
      console.warn('Before image missing on disk:', beforeImagePath);
    }

    const beforeBuffer = fs.existsSync(beforeImagePath)
      ? fs.readFileSync(beforeImagePath)
      : fs.readFileSync(afterImagePath); // Fallback for demo
    const afterBuffer = fs.readFileSync(afterImagePath);

    // Call Gemini
    const verificationResult = await verifyResolution(beforeBuffer, afterBuffer, req.file.mimetype);
    console.log('Gemini Verification:', verificationResult);

    if (verificationResult.resolved) {
      const imageUrlAfter = `/uploads/${req.file.filename}`;
      const updatedIssue = await issueModel.resolveIssue(issue_id, imageUrlAfter);

      res.json({
        success: true,
        resolved: true,
        message: 'Issue verified and resolved!',
        issue: updatedIssue,
      });
    } else {
      res.json({
        success: false,
        resolved: false,
        message: 'AI determination: Issue not fully resolved.',
        explanation: verificationResult.explanation,
      });
    }
  } catch (error) {
    console.error('Error resolving issue:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET ALL ISSUES (For Admin/Worker Dashboard)
 */
app.get('/api/issues', async (req, res) => {
  try {
    const issues = await issueModel.getAllIssues();
    res.json(issues);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function calculateSLA(severity) {
  const now = new Date();
  if (severity === 'High') return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h
  if (severity === 'Medium') return new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48h
  return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7d
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Gemini Service initialized with model: gemini-2.5-flash`);
});
