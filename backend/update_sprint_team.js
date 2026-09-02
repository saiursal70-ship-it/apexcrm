const db = require('./config/db');

async function updateSprintTasks() {
  try {
    console.log('🔄 Checking sprint_tasks table...');
    const [tasks] = await db.query('SELECT * FROM sprint_tasks');
    console.log(`Found ${tasks.length} sprint tasks in database.`);

    // 1. Ensure assignee_avatar column exists
    const [cols] = await db.query("SHOW COLUMNS FROM sprint_tasks LIKE 'assignee_avatar'");
    if (cols.length === 0) {
      await db.query("ALTER TABLE sprint_tasks ADD COLUMN assignee_avatar VARCHAR(500) DEFAULT NULL");
      console.log("✅ Added 'assignee_avatar' column to sprint_tasks table.");
    }

    // 2. Ensure assignee_role column exists
    const [roleCols] = await db.query("SHOW COLUMNS FROM sprint_tasks LIKE 'assignee_role'");
    if (roleCols.length === 0) {
      await db.query("ALTER TABLE sprint_tasks ADD COLUMN assignee_role VARCHAR(100) DEFAULT 'Software Engineer'");
      console.log("✅ Added 'assignee_role' column to sprint_tasks table.");
    }

    // 3. Update existing task assignments to professional team members
    await db.query(`
      UPDATE sprint_tasks 
      SET assignee_name = 'Alex Rivera', 
          assignee_avatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
          assignee_role = 'Principal Cloud Architect'
      WHERE task_key LIKE '%-101' OR assignee_name = 'Admin User' OR assignee_name = 'Alex Dev'
    `);

    await db.query(`
      UPDATE sprint_tasks 
      SET assignee_name = 'Michael Vance', 
          assignee_avatar = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
          assignee_role = 'Senior Full-Stack Lead'
      WHERE task_key LIKE '%-102' OR task_key LIKE '%-217' OR task_key LIKE '%-343'
    `);

    await db.query(`
      UPDATE sprint_tasks 
      SET assignee_name = 'Elena Rostova', 
          assignee_avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          assignee_role = 'Senior UI/UX & Frontend Lead'
      WHERE task_key LIKE '%-103' OR task_key LIKE '%-205' OR task_key LIKE '%-215' OR task_key LIKE '%-336'
    `);

    await db.query(`
      UPDATE sprint_tasks 
      SET assignee_name = 'Claire Redfield', 
          assignee_avatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
          assignee_role = 'QA Lead & Security Specialist'
      WHERE task_key LIKE '%-104' OR task_key LIKE '%-216' OR task_key LIKE '%-338'
    `);

    await db.query(`
      UPDATE sprint_tasks 
      SET assignee_name = 'Sarah Jenkins', 
          assignee_avatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
          assignee_role = 'Product Lead & Scrum Master'
      WHERE task_key LIKE '%-105' OR task_key LIKE '%-208' OR task_key LIKE '%-213' OR task_key LIKE '%-346' OR task_key LIKE '%-354'
    `);

    console.log('✅ All sprint tasks updated with professional team profiles!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error updating sprint tasks:', err.message);
    process.exit(0);
  }
}

updateSprintTasks();
