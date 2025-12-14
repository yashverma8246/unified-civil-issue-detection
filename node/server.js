const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  classifyIssue,
  verifyResolution,
  chatWithCivicAssistant,
  generateIssueSuggestions,
} = require('./geminiService');
const issueModel = require('./issueModel');
const authController = require('./authController');

require('dotenv').config(); // Load env vars first

const app = express();
const port = process.env.PORT || 5000;

/* =======================
   MIDDLEWARE
======================= */

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* =======================
   AUTH ROUTES
======================= */
app.post('/api/auth/signup', authController.signup);
app.post('/api/auth/login', authController.login);

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
    timestamp: new Date(),
  });
});

/**
 * ANALYZE IMAGE (Get Suggestions)
 */
app.post('/api/analyze_image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);
    const mimeType = req.file.mimetype;

    console.log(`Generating suggestions for ${req.file.filename}...`);

    const result = await generateIssueSuggestions(imageBuffer, mimeType);

    res.json({ success: true, suggestions: result.suggestions });
  } catch (error) {
    next(error);
  }
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

    // Check if we already have the analysis from the user's selection
    const userTitle = req.body.title || '';
    let aiResult;

    if (req.body.issue_type && req.body.department && req.body.severity) {
      console.log('Using user-selected issue details (skipping re-analysis)...');
      aiResult = {
        issue_type: req.body.issue_type,
        department: req.body.department,
        severity: req.body.severity,
        description: req.body.description || 'Reported by citizen (AI Assisted Selection)',
      };
    } else {
      // Fallback: Re-analyze if no explicit selection details provided
      aiResult = await classifyIssue(imageBuffer, mimeType, userTitle);
      console.log('Gemini Analysis (Re-run):', aiResult);
    }

    const issueData = {
      image_url_before: `/uploads/${req.file.filename}`,
      issue_type: aiResult.issue_type || 'Unknown',
      severity: aiResult.severity || 'Medium',
      department_assigned: aiResult.department || 'Admin',
      description: req.body.description || aiResult.description || 'Reported by citizen',
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
app.post('/api/resolve_issue', upload.single('image_after'), async (req, res, next) => {
  try {
    const { issue_id } = req.body;

    if (!req.file || !issue_id) {
      return res.status(400).json({ error: 'Missing image or issue_id' });
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

    const verificationResult = await verifyResolution(beforeBuffer, afterBuffer, req.file.mimetype);

    console.log('Gemini Verification:', verificationResult);

    if (verificationResult.resolved) {
      const imageUrlAfter = `/uploads/${req.file.filename}`;
      const updatedIssue = await issueModel.resolveIssue(issue_id, imageUrlAfter);

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
});

/**
 * GET ALL ISSUES
 */
const authenticateToken = require('./authMiddleware');

/**
 * GET ALL ISSUES (Protected & Filtered)
 */
app.get('/api/issues', authenticateToken, async (req, res, next) => {
  try {
    const user = req.user;
    const filters = {};

    console.log('Fetching issues for user:', user);

    if (user.role === 'CITIZEN') {
      // Citizens see only their own issues (filtered by email for now as that's likely what reporter_id uses)
      // Note: In a real app, ensure reporter_id consistency (ID vs Email).
      // Current seed uses 'citizen_demo', so this might return nothing for new users unless they report something.
      // We'll use user.email as the matcher.
      filters.reporter_id = user.email; // OR user.userId if you plan to change DB schema
    } else if (user.role === 'WORKER') {
      filters.assigned_worker_id = user.email; // Assuming worker assigned by email
    } else if (user.role === 'DEPT_ADMIN') {
      if (!user.department) {
        // If Dept Admin has no department, they shouldn't see ANYTHING.
        // Prevents leakage of all issues.
        return res.json([]);
      }
      filters.department_assigned = user.department;
    } else if (user.role === 'SUPER_ADMIN') {
      // No filters, sees all
    } else {
      // Default Deny Policy: If role is not recognized, show NOTHING.
      // This prevents "fall through" leakage where unknown roles see everything.
      return res.status(403).json({ error: 'Unauthorized role for issue access' });
    }

    const issues = await issueModel.getAllIssues(filters);
    res.json(issues);
  } catch (error) {
    next(error);
  }
});

/**
 * GET WORKERS (Protected)
 */
app.get('/api/workers', authenticateToken, async (req, res, next) => {
  try {
    const user = req.user;
    let deptFilter = null;

    if (user.role === 'DEPT_ADMIN') {
      deptFilter = user.department;
    } else if (user.role === 'SUPER_ADMIN') {
      // Sees all, no filter
    } else {
      return res.status(403).json({ error: 'Unauthorized to view workers' });
    }

    const workers = await issueModel.getWorkersByDept(deptFilter);
    res.json(workers);
  } catch (error) {
    next(error);
  }
});

/**
 * ASSIGN ISSUE (Protected: Dept Admin)
 */
app.post('/api/issues/assign', authenticateToken, async (req, res, next) => {
  try {
    const { issueId, workerEmail } = req.body;
    const user = req.user;

    if (user.role !== 'DEPT_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to assign issues' });
    }

    // Optional: Verify issue belongs to Dept Admin's dept
    // For now, we trust the admin or rely on frontend not to show wrong issues.

    const updatedIssue = await issueModel.assignIssue(issueId, workerEmail);
    res.json({ success: true, issue: updatedIssue });
  } catch (error) {
    next(error);
  }
});

/**
 * CHAT WITH CIVIC ASSISTANT
 */
app.post('/api/chat', async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await chatWithCivicAssistant(message, history || []);
    res.json(response);
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
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

/* =======================
   SERVER START
======================= */

function calculateSLA(severity) {
  const now = new Date();
  if (severity === 'High') return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (severity === 'Medium') return new Date(now.getTime() + 48 * 60 * 60 * 1000);
  return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Gemini Service initialized with model: gemini-2.5-flash`);
});
