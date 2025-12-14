const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function seedDemoUsers() {
  try {
    const passwordHash = await bcrypt.hash('password123', 10);

    // Seed Citizen
    await pool.query(
      `INSERT INTO users (name, email, password_hash, role, department) 
       VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
      ['Demo Citizen', 'citizen@civic.com', passwordHash, 'CITIZEN', null],
    );

    // Seed Workers for each Dept
    const workers = [
      { name: 'PWD Worker', email: 'worker@civic.com', dept: 'PWD', pass: passwordHash },
      {
        name: 'Electric Worker',
        email: 'qqqq@gmail.com',
        dept: 'Electricity',
        pass: await bcrypt.hash('qqqq', 10),
      },
      {
        name: 'Nagar Nigam Worker',
        email: 'nn_worker@civic.com',
        dept: 'Nagar Nigam',
        pass: passwordHash,
      },
      { name: 'PHED Worker', email: 'phed_worker@civic.com', dept: 'PHED', pass: passwordHash },
    ];

    for (const w of workers) {
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role, department) 
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
        [w.name, w.email, w.pass, 'WORKER', w.dept],
      );
    }

    // Seed Department Admins
    const deptAdmins = [
      { name: 'PWD Admin', email: 'pwd_admin@civic.com', dept: 'PWD' },
      { name: 'Electricity Admin', email: 'electricity_admin@civic.com', dept: 'Electricity' },
      { name: 'Nagar Nigam Admin', email: 'nagarnigam_admin@civic.com', dept: 'Nagar Nigam' },
      { name: 'PHED Admin', email: 'jalvibhag_admin@civic.com', dept: 'PHED' }, // Using PHED to match Gemini
    ];

    for (const admin of deptAdmins) {
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role, department) 
         VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING`,
        [admin.name, admin.email, passwordHash, 'DEPT_ADMIN', admin.dept],
      );
    }

    console.log('✅ Demo Citizen and Worker seeded!');
    console.log('Citizen: citizen@civic.com / password123');
    console.log('Worker: worker@civic.com / password123');
  } catch (err) {
    console.error('Error seeding:', err);
  } finally {
    pool.end();
  }
}

seedDemoUsers();
