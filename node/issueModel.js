const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Test connection on startup
pool.query('SELECT NOW()')
  .then(res => {
    console.log('✅ Database connected at:', res.rows[0].now);
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });

async function createIssue(issueData) {
  const queryText = `
    INSERT INTO issues (
      reporter_id,
      issue_type,
      severity,
      status,
      department_assigned,
      image_url_before,
      sla_due_date,
      description,
      geo_latitude,
      geo_longitude
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *;
  `;

  const values = [
    issueData.reporter_id,
    issueData.issue_type,
    issueData.severity,
    issueData.status,
    issueData.department_assigned,
    issueData.image_url_before,
    issueData.sla_due_date,
    issueData.description || '',
    issueData.geo_latitude ?? null,
    issueData.geo_longitude ?? null,
  ];

  const { rows } = await pool.query(queryText, values);
  return rows[0];
}

async function getAllIssues() {
  const { rows } = await pool.query(
    'SELECT * FROM issues ORDER BY created_at DESC'
  );
  return rows;
}

async function getIssueById(issueId) {
  const { rows } = await pool.query(
    'SELECT * FROM issues WHERE issue_id = $1',
    [issueId]
  );
  return rows[0] || null;
}

async function resolveIssue(issueId, imageUrlAfter) {
  const updateQuery = `
    UPDATE issues
    SET status = 'Resolved',
        image_url_after = $1,
        updated_at = CURRENT_TIMESTAMP
    WHERE issue_id = $2
    RETURNING *;
  `;

  const { rows } = await pool.query(updateQuery, [
    imageUrlAfter,
    issueId,
  ]);

  return rows[0] || null;
}

module.exports = {
  createIssue,
  getAllIssues,
  getIssueById,
  resolveIssue,
};
