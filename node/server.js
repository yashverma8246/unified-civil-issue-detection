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

/* =======================
   MIDDLEWARE
======================= */

app.use(cors());


app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* =======================
   UPLOADS SETUP
======================= */

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

/* =======================
   ROUTES
======================= */

// HEALTH CHECK (Railway / Monitoring)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});


/**
 * REPORT ISSUE
 */
app.post('/api/report_issue', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);
    const mimeType = req.file.mimetype;

    console.log(`Processing issue report for ${req.file.filename}...`);

    // Call Gemini
    const aiResult = await classifyIssue(imageBuffer, mimeType);
    console.log('Gemini Analysis:', aiResult);

    const issueData = {
      image_url_before: `/uploads/${req.file.filename}`,
      issue_type: aiResult.issue_type || 'Unknown',
      severity: aiResult.severity || 'Medium',
      department_assigned: aiResult.department || 'Admin',
      description:
        req.body.description ||
        aiResult.description ||
        'Reported by citizen',
      status: 'Reported',
      sla_due_date: calculateSLA(aiResult.severity),
      reporter_id: req.body.reporter_id || 'anonymous',
      geo_latitude: req.body.geo_latitude || null,
      geo_longitude: req.body.geo_longitude || null,
    };

    const savedIssue = await issueModel.createIssue(issueData);

    res.json({
      success: true,
      issue: savedIssue,
      analysis: aiResult,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * RESOLVE ISSUE
 */
app.post(
  '/api/resolve_issue',
  upload.single('image_after'),
  async (req, res, next) => {
    try {
      const { issue_id } = req.body;

      if (!req.file || !issue_id) {
        return res
          .status(400)
          .json({ error: 'Missing image or issue_id' });
      }

      const issue = await issueModel.getIssueById(issue_id);
      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      let beforeImagePath = issue.image_url_before;
      if (beforeImagePath.startsWith('/uploads')) {
        beforeImagePath = path.join(__dirname, beforeImagePath);
      }

      const afterImagePath = req.file.path;

      const beforeBuffer = fs.existsSync(beforeImagePath)
        ? fs.readFileSync(beforeImagePath)
        : fs.readFileSync(afterImagePath); // fallback

      const afterBuffer = fs.readFileSync(afterImagePath);

      const verificationResult = await verifyResolution(
        beforeBuffer,
        afterBuffer,
        req.file.mimetype
      );

      console.log('Gemini Verification:', verificationResult);

      if (verificationResult.resolved) {
        const imageUrlAfter = `/uploads/${req.file.filename}`;
        const updatedIssue = await issueModel.resolveIssue(
          issue_id,
          imageUrlAfter
        );

        return res.json({
          success: true,
          resolved: true,
          message: 'Issue verified and resolved!',
          issue: updatedIssue,
        });
      }

      res.json({
        success: false,
        resolved: false,
        message: 'AI determination: Issue not fully resolved.',
        explanation: verificationResult.explanation,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET ALL ISSUES
 */
app.get('/api/issues', async (req, res, next) => {
  try {
    const issues = await issueModel.getAllIssues();
    res.json(issues);
  } catch (error) {
    next(error);
  }
});

/* =======================
   ERROR HANDLER (LAST)
======================= */

app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  res.status(500).json({
    error: 'Internal Server Error',
    details:
      process.env.NODE_ENV === 'development'
        ? err.message
        : undefined,
  });
});

/* =======================
   SERVER START
======================= */

function calculateSLA(severity) {
  const now = new Date();
  if (severity === 'High')
    return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (severity === 'Medium')
    return new Date(now.getTime() + 48 * 60 * 60 * 1000);
  return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Gemini Service initialized with model: gemini-2.5-flash`);
});
