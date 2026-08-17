import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { queryAll, queryOne, run, initDb } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/artworks', express.static(path.join(__dirname, '../public/artworks')));
app.use(express.static(path.join(__dirname, '../public')));

// Initialize DB schema on startup
initDb().then(() => console.log('MariaDB tables initialized.')).catch(console.error);

// ----------------------------------------------------
// 1. AUTHENTICATION & USERS
// ----------------------------------------------------

// Login route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await queryOne(
      `SELECT u.*, a.admin_id, ar.bio, ar.portfolio_links, ar.availability_status
       FROM Users u
       LEFT JOIN Admins a ON u.user_id = a.admin_id
       LEFT JOIN Artists ar ON u.user_id = ar.artist_id
       WHERE (u.username = ? OR u.email = ?)`,
      [username, username]
    );

    if (!user || user.password_hash !== password) {
      return res.status(401).json({ error: 'Invalid username/email or password.' });
    }

    const isArtist = !!user.bio || !!user.availability_status;
    const isAdmin = !!user.admin_id;

    let expertise = [];
    if (isArtist) {
      const expRows = await queryAll(`SELECT expertise FROM ArtistExpertise WHERE artist_id = ?`, [user.user_id]);
      expertise = expRows.map(r => r.expertise);
    }

    res.json({
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        name: user.name,
        phone_number: user.phone_number,
        address: user.address,
        is_artist: isArtist,
        is_admin: isAdmin,
        artist_bio: user.bio || '',
        portfolio_links: user.portfolio_links || '',
        availability_status: user.availability_status || 'Available',
        expertise
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register route (Predefined as Artist role)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, name, phone_number, address, bio, portfolio_links, expertise } = req.body;

    const existing = await queryOne(`SELECT user_id FROM Users WHERE username = ? OR email = ?`, [username, email]);
    if (existing) {
      return res.status(400).json({ error: 'Username or email already registered' });
    }

    const result = await run(
      `INSERT INTO Users (username, email, password_hash, name, phone_number, address) VALUES (?, ?, ?, ?, ?, ?)`,
      [username, email, password, name, phone_number || '', address || '']
    );

    const userId = result.lastID;

    // Predefined Role: Everyone registered is an Artist
    await run(
      `INSERT INTO Artists (artist_id, bio, portfolio_links, availability_status) VALUES (?, ?, ?, 'Available')`,
      [userId, bio || 'Creative Visual Artist', portfolio_links || '']
    );

    const defaultExpertise = (expertise && Array.isArray(expertise) && expertise.length > 0)
      ? expertise
      : ['Digital Painting', 'Concept Art'];

    for (const exp of defaultExpertise) {
      if (exp.trim()) {
        await run(`INSERT INTO ArtistExpertise (artist_id, expertise) VALUES (?, ?)`, [userId, exp.trim()]);
      }
    }

    res.status(201).json({
      user: {
        user_id: userId,
        username,
        email,
        name,
        is_artist: true,
        is_admin: false,
        artist_bio: bio || 'Creative Visual Artist',
        portfolio_links: portfolio_links || '',
        availability_status: 'Available',
        expertise: defaultExpertise
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get User Profile & Activity Summary (Consistent Artist Profile for All)
app.get('/api/users/:id/profile', async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await queryOne(
      `SELECT u.user_id, u.username, u.email, u.name, u.phone_number, u.address, u.created_at,
              a.admin_id, ar.bio, ar.portfolio_links, ar.availability_status
       FROM Users u
       LEFT JOIN Admins a ON u.user_id = a.admin_id
       LEFT JOIN Artists ar ON u.user_id = ar.artist_id
       WHERE u.user_id = ?`,
      [userId]
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Auto-provision Artists record if missing
    if (!user.bio && !user.availability_status) {
      await run(
        `INSERT IGNORE INTO Artists (artist_id, bio, portfolio_links, availability_status) VALUES (?, 'Creative Visual Artist', '', 'Available')`,
        [userId]
      );
      await run(
        `INSERT IGNORE INTO ArtistExpertise (artist_id, expertise) VALUES (?, 'Digital Art')`,
        [userId]
      );
      user.bio = 'Creative Visual Artist';
      user.availability_status = 'Available';
    }

    const expertiseRows = await queryAll(`SELECT expertise FROM ArtistExpertise WHERE artist_id = ?`, [userId]);
    const artworks = await queryAll(`SELECT * FROM Artworks WHERE artist_id = ? ORDER BY created_at DESC`, [userId]);
    const commissions = await queryAll(
      `SELECT c.*, 
              uc.name as client_name, uc.username as client_username,
              ua.name as artist_name, ua.username as artist_username
       FROM Commissions c 
       JOIN Users uc ON c.client_id = uc.user_id 
       LEFT JOIN Artists a ON c.artist_id = a.artist_id
       LEFT JOIN Users ua ON a.artist_id = ua.user_id
       WHERE c.artist_id = ? OR c.client_id = ? 
       ORDER BY c.created_at DESC`,
      [userId, userId]
    );
    const submissions = await queryAll(
      `SELECT cs.*, ch.title as challenge_title, a.title as art_title, a.media_url
       FROM ChallengeSubmissions cs
       JOIN Challenges ch ON cs.challenge_id = ch.challenge_id
       JOIN Artworks a ON cs.art_id = a.art_id
       WHERE cs.artist_id = ?`,
      [userId]
    );

    res.json({
      user: {
        ...user,
        is_artist: true,
        is_admin: !!user.admin_id,
        expertise: expertiseRows.map(r => r.expertise),
        artworks,
        commissions,
        submissions
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Update Profile
app.put('/api/users/:id/profile', async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, phone_number, address, bio, portfolio_links, availability_status, expertise } = req.body;

    await run(
      `UPDATE Users SET name = ?, phone_number = ?, address = ? WHERE user_id = ?`,
      [name, phone_number || '', address || '', userId]
    );

    // Check if user is artist
    const isArtist = await queryOne(`SELECT artist_id FROM Artists WHERE artist_id = ?`, [userId]);
    if (isArtist) {
      await run(
        `UPDATE Artists SET bio = ?, portfolio_links = ?, availability_status = ? WHERE artist_id = ?`,
        [bio || '', portfolio_links || '', availability_status || 'Available', userId]
      );

      if (expertise && Array.isArray(expertise)) {
        await run(`DELETE FROM ArtistExpertise WHERE artist_id = ?`, [userId]);
        for (const exp of expertise) {
          if (exp.trim()) {
            await run(`INSERT INTO ArtistExpertise (artist_id, expertise) VALUES (?, ?)`, [userId, exp.trim()]);
          }
        }
      }
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 2. FEED & ARTWORKS (PURE SHOWCASE - NO PRICING)
// ----------------------------------------------------

// Get Feed Artworks
app.get('/api/artworks', async (req, res) => {
  try {
    const { type, search, artist_id } = req.query;
    let sql = `
      SELECT a.art_id, a.artist_id, a.title, a.type, a.description, a.media_url, a.react_count, a.created_at,
             u.name as artist_name, u.username as artist_username, ar.bio as artist_bio,
             (SELECT COUNT(*) FROM ArtworkComments ac WHERE ac.art_id = a.art_id) as comments_count
      FROM Artworks a
      JOIN Artists ar ON a.artist_id = ar.artist_id
      JOIN Users u ON a.artist_id = u.user_id
      WHERE 1=1
    `;
    const params = [];

    if (type && type !== 'All') {
      sql += ` AND a.type = ?`;
      params.push(type);
    }
    if (search) {
      sql += ` AND (a.title LIKE ? OR a.description LIKE ? OR u.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (artist_id) {
      sql += ` AND a.artist_id = ?`;
      params.push(artist_id);
    }

    sql += ` ORDER BY a.created_at DESC`;
    const rows = await queryAll(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to convert Google Drive sharing links to direct image stream URLs
function formatDriveImageUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  const driveMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  return trimmed;
}

// Post new Artwork to Feed
app.post('/api/artworks', async (req, res) => {
  try {
    const { artist_id, title, type, description, media_url } = req.body;
    if (!artist_id || !title || !media_url) {
      return res.status(400).json({ error: 'Missing required artwork fields' });
    }

    const sanitizedMediaUrl = formatDriveImageUrl(media_url);

    // Ensure artist exists
    const artist = await queryOne(`SELECT artist_id FROM Artists WHERE artist_id = ?`, [artist_id]);
    if (!artist) {
      await run(`INSERT INTO Artists (artist_id, bio, portfolio_links, availability_status) VALUES (?, 'Visual Creator', '', 'Available')`, [artist_id]);
    }

    const result = await run(
      `INSERT INTO Artworks (artist_id, title, type, description, media_url, react_count) VALUES (?, ?, ?, ?, ?, 0)`,
      [artist_id, title, type || 'Digital', description || '', sanitizedMediaUrl]
    );

    res.status(201).json({ art_id: result.lastID, message: 'Artwork published successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit / Update Artwork (Owner or Admin only)
app.put('/api/artworks/:id', async (req, res) => {
  try {
    const artId = req.params.id;
    const { user_id, title, type, description, media_url } = req.body;
    if (!title || !media_url) {
      return res.status(400).json({ error: 'Artwork title and image URL are required' });
    }

    const artwork = await queryOne(`SELECT * FROM Artworks WHERE art_id = ?`, [artId]);
    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    // Check permission
    const user = await queryOne(
      `SELECT u.user_id, a.admin_id FROM Users u LEFT JOIN Admins a ON u.user_id = a.admin_id WHERE u.user_id = ?`,
      [user_id]
    );
    if (artwork.artist_id !== Number(user_id) && !user?.admin_id) {
      return res.status(403).json({ error: 'Permission denied: Only the author or an admin can edit this artwork.' });
    }

    const sanitizedMediaUrl = formatDriveImageUrl(media_url);

    await run(
      `UPDATE Artworks SET title = ?, type = ?, description = ?, media_url = ? WHERE art_id = ?`,
      [title, type || 'Digital', description || '', sanitizedMediaUrl, artId]
    );

    const updated = await queryOne(
      `SELECT a.art_id, a.artist_id, a.title, a.type, a.description, a.media_url, a.react_count, a.created_at,
              u.name as artist_name, u.username as artist_username, ar.bio as artist_bio
       FROM Artworks a
       JOIN Artists ar ON a.artist_id = ar.artist_id
       JOIN Users u ON a.artist_id = u.user_id
       WHERE a.art_id = ?`,
      [artId]
    );

    res.json({ success: true, message: 'Artwork updated successfully', artwork: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Artwork (Owner or Admin only)
app.delete('/api/artworks/:id', async (req, res) => {
  try {
    const artId = req.params.id;
    const userId = req.query.user_id || req.body?.user_id;

    const artwork = await queryOne(`SELECT * FROM Artworks WHERE art_id = ?`, [artId]);
    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    // Check permission
    const user = await queryOne(
      `SELECT u.user_id, a.admin_id FROM Users u LEFT JOIN Admins a ON u.user_id = a.admin_id WHERE u.user_id = ?`,
      [userId]
    );
    if (artwork.artist_id !== Number(userId) && !user?.admin_id) {
      return res.status(403).json({ error: 'Permission denied: Only the author or an admin can delete this artwork.' });
    }

    // Cascade delete linked entities
    await run(`DELETE FROM ArtworkReactions WHERE art_id = ?`, [artId]);
    await run(`DELETE FROM ArtworkComments WHERE art_id = ?`, [artId]);
    await run(`DELETE FROM ChallengeSubmissions WHERE art_id = ?`, [artId]);
    await run(`DELETE FROM Artworks WHERE art_id = ?`, [artId]);

    res.json({ success: true, message: 'Artwork deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like / React to Artwork
app.post('/api/artworks/:id/react', async (req, res) => {
  try {
    const artId = req.params.id;
    const { user_id, reaction_type = 'like' } = req.body;

    const existing = await queryOne(`SELECT * FROM ArtworkReactions WHERE user_id = ? AND art_id = ?`, [user_id, artId]);
    if (existing) {
      await run(`DELETE FROM ArtworkReactions WHERE user_id = ? AND art_id = ?`, [user_id, artId]);
      await run(`UPDATE Artworks SET react_count = GREATEST(0, react_count - 1) WHERE art_id = ?`, [artId]);
      return res.json({ reacted: false });
    } else {
      await run(`INSERT INTO ArtworkReactions (user_id, art_id, reaction_type) VALUES (?, ?, ?)`, [user_id, artId, reaction_type]);
      await run(`UPDATE Artworks SET react_count = react_count + 1 WHERE art_id = ?`, [artId]);
      return res.json({ reacted: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Comments for Artwork
app.get('/api/artworks/:id/comments', async (req, res) => {
  try {
    const artId = req.params.id;
    const comments = await queryAll(
      `SELECT ac.comment_id, ac.art_id, ac.user_id, ac.comment_text, ac.created_at, u.name as user_name, u.username
       FROM ArtworkComments ac
       JOIN Users u ON ac.user_id = u.user_id
       WHERE ac.art_id = ?
       ORDER BY ac.created_at ASC`,
      [artId]
    );
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post Comment on Artwork
app.post('/api/artworks/:id/comments', async (req, res) => {
  try {
    const artId = req.params.id;
    const { user_id, comment_text } = req.body;
    if (!user_id || !comment_text) return res.status(400).json({ error: 'Missing comment text' });

    const result = await run(
      `INSERT INTO ArtworkComments (art_id, user_id, comment_text) VALUES (?, ?, ?)`,
      [artId, user_id, comment_text]
    );
    res.status(201).json({ comment_id: result.lastID, message: 'Comment added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 3. COURSES & CURRICULUM
// ----------------------------------------------------

// Get Course Catalog
app.get('/api/courses', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    let sql = `
      SELECT c.*, u.name as instructor_name, u.username as instructor_username,
             (SELECT COUNT(*) FROM CourseContent cc WHERE cc.course_id = c.course_id) as lesson_count,
             (SELECT COUNT(*) FROM CourseEnrollments ce WHERE ce.course_id = c.course_id) as student_count
      FROM Courses c
      JOIN Artists ar ON c.instructor_id = ar.artist_id
      JOIN Users u ON c.instructor_id = u.user_id
      WHERE 1=1
    `;
    const params = [];
    if (category && category !== 'All') {
      sql += ` AND c.category = ?`;
      params.push(category);
    }
    if (difficulty && difficulty !== 'All') {
      sql += ` AND c.difficulty = ?`;
      params.push(difficulty);
    }
    sql += ` ORDER BY c.created_at DESC`;
    const courses = await queryAll(sql, params);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Course Details & Sequential Lessons
app.get('/api/courses/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const course = await queryOne(
      `SELECT c.*, u.name as instructor_name, u.username as instructor_username, ar.bio as instructor_bio
       FROM Courses c
       JOIN Artists ar ON c.instructor_id = ar.artist_id
       JOIN Users u ON c.instructor_id = u.user_id
       WHERE c.course_id = ?`,
      [courseId]
    );
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const lessons = await queryAll(
      `SELECT * FROM CourseContent WHERE course_id = ? ORDER BY sequence_order ASC`,
      [courseId]
    );

    res.json({ ...course, lessons });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Enroll in Course
app.post('/api/courses/:id/enroll', async (req, res) => {
  try {
    const courseId = req.params.id;
    const { user_id } = req.body;

    const existing = await queryOne(`SELECT * FROM CourseEnrollments WHERE course_id = ? AND user_id = ?`, [courseId, user_id]);
    if (existing) return res.json({ alreadyEnrolled: true, message: 'Already enrolled in this course' });

    await run(`INSERT INTO CourseEnrollments (course_id, user_id, completion_status) VALUES (?, ?, 'In Progress')`, [courseId, user_id]);
    res.status(201).json({ success: true, message: 'Enrolled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 4. FREELANCE COMMISSIONS & JOB BOARD
// ----------------------------------------------------

// Get Commission Job Board (Deterministic Newest First)
app.get('/api/commissions', async (req, res) => {
  try {
    const { status, search } = req.query;
    let sql = `
      SELECT c.*, u.name as client_name, u.username as client_username,
             ua.name as artist_name, ua.username as artist_username
      FROM Commissions c
      JOIN Users u ON c.client_id = u.user_id
      LEFT JOIN Artists a ON c.artist_id = a.artist_id
      LEFT JOIN Users ua ON a.artist_id = ua.user_id
      WHERE 1=1
    `;
    const params = [];
    if (status && status !== 'All') {
      sql += ` AND c.current_status = ?`;
      params.push(status);
    }
    if (search) {
      sql += ` AND (c.requirements LIKE ? OR c.description LIKE ? OR u.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY c.created_at DESC`;
    const rows = await queryAll(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a New Freelance Commission Task
app.post('/api/commissions', async (req, res) => {
  try {
    const { client_id, artist_id, requirements, description, price_offered, deadline } = req.body;
    if (!client_id || !requirements || !price_offered || !deadline) {
      return res.status(400).json({ error: 'Missing required commission fields' });
    }

    const result = await run(
      `INSERT INTO Commissions (client_id, artist_id, requirements, description, price_offered, deadline, current_status)
       VALUES (?, ?, ?, ?, ?, ?, 'Requested')`,
      [client_id, artist_id || null, requirements, description || '', price_offered, deadline]
    );

    res.status(201).json({ task_id: result.lastID, message: 'Commission brief posted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Apply or Update Status on Commission
app.patch('/api/commissions/:id/status', async (req, res) => {
  try {
    const taskId = req.params.id;
    const { current_status, artist_id } = req.body;

    let sql = `UPDATE Commissions SET current_status = ?`;
    const params = [current_status];

    if (artist_id) {
      sql += `, artist_id = ?`;
      params.push(artist_id);
    }
    sql += ` WHERE task_id = ?`;
    params.push(taskId);

    await run(sql, params);
    res.json({ success: true, message: 'Status updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// 5. CHALLENGES & CONTEST SUBMISSIONS (WITH MASONRY GALLERY)
// ----------------------------------------------------

// Get All Contests
app.get('/api/challenges', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `
      SELECT ch.*, u.name as creator_name,
             (SELECT COUNT(*) FROM ChallengeSubmissions cs WHERE cs.challenge_id = ch.challenge_id) as entry_count
      FROM Challenges ch
      JOIN Users u ON ch.creator_id = u.user_id
      WHERE 1=1
    `;
    const params = [];
    if (status && status !== 'All') {
      sql += ` AND ch.status = ?`;
      params.push(status);
    }
    sql += ` ORDER BY (ch.status = 'Active') DESC, ch.deadline ASC`;
    const rows = await queryAll(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Contest Details & Masonry Submissions
app.get('/api/challenges/:id/submissions', async (req, res) => {
  try {
    const challengeId = req.params.id;
    const challenge = await queryOne(`SELECT * FROM Challenges WHERE challenge_id = ?`, [challengeId]);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found' });

    const submissions = await queryAll(
      `SELECT cs.submission_id, cs.challenge_id, cs.art_id, cs.artist_id, cs.vote_count, cs.rank, cs.submitted_at,
              a.title as artwork_title, a.type as artwork_type, a.description as artwork_desc, a.media_url,
              u.name as artist_name, u.username as artist_username, ar.bio as artist_bio
       FROM ChallengeSubmissions cs
       JOIN Artworks a ON cs.art_id = a.art_id
       JOIN Artists ar ON cs.artist_id = ar.artist_id
       JOIN Users u ON cs.artist_id = u.user_id
       WHERE cs.challenge_id = ?
       ORDER BY cs.vote_count DESC, cs.submitted_at ASC`,
      [challengeId]
    );

    res.json({ challenge, submissions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit Artwork Entry to Contest
app.post('/api/challenges/:id/submit', async (req, res) => {
  try {
    const challengeId = req.params.id;
    const { art_id, artist_id } = req.body;

    const existing = await queryOne(`SELECT submission_id FROM ChallengeSubmissions WHERE challenge_id = ? AND art_id = ?`, [challengeId, art_id]);
    if (existing) {
      return res.status(400).json({ error: 'This artwork has already been submitted to this contest' });
    }

    const result = await run(
      `INSERT INTO ChallengeSubmissions (challenge_id, art_id, artist_id, vote_count, rank) VALUES (?, ?, ?, 0, NULL)`,
      [challengeId, art_id, artist_id]
    );

    res.status(201).json({ submission_id: result.lastID, message: 'Artwork entered into contest successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Vote for Contest Entry
app.post('/api/challenges/submissions/:id/vote', async (req, res) => {
  try {
    const submissionId = req.params.id;
    await run(`UPDATE ChallengeSubmissions SET vote_count = vote_count + 1 WHERE submission_id = ?`, [submissionId]);
    res.json({ success: true, message: 'Vote recorded!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`ShilpiKunjo MariaDB Backend Server listening on http://localhost:${PORT}`);
});
