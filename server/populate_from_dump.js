import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function populateMariaDB() {
  console.log('--- 1. Populating MariaDB/MySQL Database ---');
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      multipleStatements: true
    });

    await conn.query('CREATE DATABASE IF NOT EXISTS shilpikunjo DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    await conn.changeUser({ database: 'shilpikunjo' });

    // Ensure columns exist on existing MariaDB tables
    try {
      await conn.query("ALTER TABLE ArtworkReactions ADD COLUMN reaction_type VARCHAR(20) DEFAULT 'like';");
    } catch (e) {
      // Column already exists or table not created yet
    }

    const sqlPath = path.resolve(__dirname, '../backend/phpmyadmin_dump.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await conn.query(sql);
    console.log('✓ MariaDB populated successfully!');

    const [users] = await conn.query('SELECT COUNT(*) as count FROM users');
    const [artworks] = await conn.query('SELECT COUNT(*) as count FROM artworks');
    const [courses] = await conn.query('SELECT COUNT(*) as count FROM courses');
    const [content] = await conn.query('SELECT COUNT(*) as count FROM coursecontent');
    const [challenges] = await conn.query('SELECT COUNT(*) as count FROM challenges');
    const [commissions] = await conn.query('SELECT COUNT(*) as count FROM commissions');

    console.log('MariaDB Record Verification:');
    console.log(`  • Users: ${users[0].count}`);
    console.log(`  • Artworks: ${artworks[0].count}`);
    console.log(`  • Courses: ${courses[0].count}`);
    console.log(`  • CourseContent (Lessons): ${content[0].count}`);
    console.log(`  • Challenges: ${challenges[0].count}`);
    console.log(`  • Commissions: ${commissions[0].count}`);
    await conn.end();
  } catch (err) {
    console.warn('MariaDB notice / error:', err.message);
  }
}

async function populateSQLite() {
  console.log('\n--- 2. Populating SQLite Fallback Database ---');
  const sqlitePath = path.resolve(__dirname, 'shilpikunjo.db');
  const db = new sqlite3.Database(sqlitePath);

  const runSql = (sql, params = []) => new Promise((res, rej) => db.run(sql, params, (err) => err ? rej(err) : res()));
  const execSql = (sql) => new Promise((res, rej) => db.exec(sql, (err) => err ? rej(err) : res()));

  try {
    const tables = [
      'ChallengeVotes', 'ArtworkReactions', 'CourseEnrollments', 'CourseContent',
      'Courses', 'Commissions', 'ChallengeSubmissions', 'Challenges',
      'ArtworkComments', 'Artworks', 'ArtistExpertise', 'Artists', 'Admins', 'Users'
    ];
    for (const t of tables) {
      await runSql(`DROP TABLE IF EXISTS ${t}`);
    }

    await execSql(`
      CREATE TABLE Users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        phone_number TEXT,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE Admins (
        admin_id INTEGER PRIMARY KEY,
        FOREIGN KEY (admin_id) REFERENCES Users(user_id) ON DELETE CASCADE
      );

      CREATE TABLE Artists (
        artist_id INTEGER PRIMARY KEY,
        bio TEXT,
        portfolio_links TEXT,
        availability_status TEXT DEFAULT 'Available',
        FOREIGN KEY (artist_id) REFERENCES Users(user_id) ON DELETE CASCADE
      );

      CREATE TABLE ArtistExpertise (
        artist_id INTEGER,
        expertise TEXT NOT NULL,
        PRIMARY KEY (artist_id, expertise),
        FOREIGN KEY (artist_id) REFERENCES Artists(artist_id) ON DELETE CASCADE
      );

      CREATE TABLE Artworks (
        art_id INTEGER PRIMARY KEY AUTOINCREMENT,
        artist_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        media_url TEXT NOT NULL,
        react_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (artist_id) REFERENCES Artists(artist_id) ON DELETE CASCADE
      );

      CREATE TABLE ArtworkComments (
        comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        art_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        comment_text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (art_id) REFERENCES Artworks(art_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
      );

      CREATE TABLE ArtworkReactions (
        user_id INTEGER NOT NULL,
        art_id INTEGER NOT NULL,
        reaction_type TEXT DEFAULT 'like',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, art_id),
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (art_id) REFERENCES Artworks(art_id) ON DELETE CASCADE
      );

      CREATE TABLE Challenges (
        challenge_id INTEGER PRIMARY KEY AUTOINCREMENT,
        creator_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        start_date DATE NOT NULL,
        deadline DATE NOT NULL,
        banner_url TEXT,
        participation_limit INTEGER,
        status TEXT DEFAULT 'Active',
        FOREIGN KEY (creator_id) REFERENCES Users(user_id)
      );

      CREATE TABLE ChallengeSubmissions (
        submission_id INTEGER PRIMARY KEY AUTOINCREMENT,
        challenge_id INTEGER NOT NULL,
        art_id INTEGER NOT NULL,
        artist_id INTEGER NOT NULL,
        vote_count INTEGER DEFAULT 0,
        rank INTEGER,
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (challenge_id, art_id),
        FOREIGN KEY (challenge_id) REFERENCES Challenges(challenge_id) ON DELETE CASCADE,
        FOREIGN KEY (art_id) REFERENCES Artworks(art_id) ON DELETE CASCADE,
        FOREIGN KEY (artist_id) REFERENCES Artists(artist_id) ON DELETE CASCADE
      );

      CREATE TABLE ChallengeVotes (
        submission_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (submission_id, user_id),
        FOREIGN KEY (submission_id) REFERENCES ChallengeSubmissions(submission_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
      );

      CREATE TABLE Courses (
        course_id INTEGER PRIMARY KEY AUTOINCREMENT,
        instructor_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        pricing REAL DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (instructor_id) REFERENCES Artists(artist_id) ON DELETE CASCADE
      );

      CREATE TABLE CourseContent (
        content_id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content_url TEXT NOT NULL,
        sequence_order INTEGER NOT NULL,
        FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE
      );

      CREATE TABLE CourseEnrollments (
        enrollment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        completion_status TEXT DEFAULT 'In Progress',
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (course_id, user_id),
        FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
      );

      CREATE TABLE Commissions (
        task_id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        artist_id INTEGER,
        requirements TEXT NOT NULL,
        description TEXT,
        price_offered REAL NOT NULL,
        deadline DATE NOT NULL,
        current_status TEXT DEFAULT 'Requested',
        media_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES Users(user_id),
        FOREIGN KEY (artist_id) REFERENCES Artists(artist_id)
      );
    `);

    // Insert Users
    const users = [
      [1, 'admin', 'admin@sk.com', 'password123', 'System Administrator', '+8801700000000', 'Dhaka, Bangladesh', '2026-08-22 23:19:41'],
      [2, 'rubab_sazda', 'rubab@sk.com', 'password123', 'Rubab Sazda', '+8801811112233', 'Dhanmondi, Dhaka', '2026-08-22 23:19:41'],
      [3, 'jarif', 'jarif@sk.com', 'password123', 'Jarif', '+8801711223344', 'Gulshan, Dhaka', '2026-08-22 23:19:41'],
      [4, 'fairuz', 'fairuz@sk.com', 'password123', 'Fairuz', '+8801822334455', 'Uttara, Dhaka', '2026-08-22 23:19:41'],
      [5, 'rudila', 'rudila@sk.com', 'password123', 'Rudila', '+8801933445566', 'Banani, Dhaka', '2026-08-22 23:19:41']
    ];
    for (const u of users) {
      await runSql('INSERT INTO Users (user_id, username, email, password_hash, name, phone_number, address, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', u);
    }

    // Insert Admins
    await runSql('INSERT INTO Admins (admin_id) VALUES (1)');

    // Insert Artists
    const artists = [
      [2, 'Concept Artist & Visual Storyteller. Exploring South Asian folklore, Rickshaw art aesthetics, and sci-fi worldbuilding.', 'https://artstation.com/rubab', 'Available'],
      [3, 'Digital & Traditional Concept Artist focusing on South Asian Cyberpunk, environmental storytelling, and stylized characters.', 'https://artstation.com/jarif', 'Available'],
      [4, '3D Modeler, Environment Artist & Motion Designer creating futuristic cyber-Dhaka sceneries in Blender & Unreal.', 'https://behance.net/fairuz', 'Busy'],
      [5, 'Visual Illustrator & Graphic Novelist blending folk motifs with modern fantasy aesthetics.', 'https://instagram.com/rudila_art', 'Available']
    ];
    for (const a of artists) {
      await runSql('INSERT INTO Artists (artist_id, bio, portfolio_links, availability_status) VALUES (?, ?, ?, ?)', a);
    }

    // Insert ArtistExpertise
    const expertise = [
      [2, 'Character Design'], [2, 'Concept Art'], [2, 'Digital Painting'],
      [3, 'Concept Art'], [3, 'Digital Illustration'], [3, 'Environment Design'],
      [4, '3D Modeling'], [4, 'Blender'], [4, 'Motion Graphics'],
      [5, 'Folk Art'], [5, 'Graphic Novel'], [5, 'Visual Storytelling']
    ];
    for (const exp of expertise) {
      await runSql('INSERT INTO ArtistExpertise (artist_id, expertise) VALUES (?, ?)', exp);
    }

    // Insert Artworks
    const artworks = [
      [2, 3, 'Proud Future: Autumn Scarf Kitten', 'Digital', 'Heartwarming illustration of a brave orange tabby kitten wrapped in a cozy knit scarf with an autumn maple leaf crown in the morning light by Jarif.', '/artworks/art_2.jpg', 95, '2026-08-22 23:19:41'],
      [3, 4, 'The Puzzled Bitwa', 'Animation', 'Humorous monochrome character study of a baby wearing a plaid turban headwrap with a quizzical, questioning expression by Fairuz.', '/artworks/art_3.jpg', 86, '2026-08-22 23:19:41'],
      [4, 2, 'Twilight Solitude & Lavender Fields', 'Digital', 'Atmospheric widescreen landscape featuring a silhouette oak tree overlooking a luminous field of blooming purple lavender under starlight by Rubab Sazda.', '/artworks/art_4.jpg', 112, '2026-08-22 23:19:41'],
      [5, 4, 'Boxer Kitty: Ready to Rumble', 'Animation', 'Dynamic and feisty character concept of a little kitten sporting a mini red boxing glove ready for a friendly sparring match by Fairuz.', '/artworks/art_5.jpg', 70, '2026-08-22 23:19:41'],
      [6, 5, 'Slumbering Yin-Yang Kittens', 'Hand-drawn', 'Tender and intimate study of two young calico kittens sleeping peacefully curled together in a harmonious heart-shaped embrace by Rudila.', '/artworks/art_6.jpg', 103, '2026-08-22 23:19:41'],
      [7, 3, 'Celestial Twilight & Crescent Moon', 'Hand-drawn', 'Lush nighttime landscape photography capturing a deep cobalt twilight sky with the glowing crescent moon and Venus framed by tree canopies by Jarif.', '/artworks/art_7.jpg', 88, '2026-08-22 23:19:41'],
      [8, 5, 'Pastel Dusk Over the Horizon', 'Hand-drawn', 'Serene dusk study capturing glowing pastel cumulonimbus clouds infused with delicate sunset pink and gold tones over a foliage fence by Rudila.', '/artworks/art_8.jpg', 76, '2026-08-22 23:19:41'],
      [13, 2, 'Illuminate', 'Digital', '', 'https://lh3.googleusercontent.com/d/15H467OCZl-JySER6HY1Oa1xA70kcvXOA', 0, '2026-09-01 03:59:01'],
      [15, 2, 'Illuminate', 'Digital', 'light and shadow', 'https://lh3.googleusercontent.com/d/1b_lWS8c2wMIORvTlxOavceTCuA1DzU9H', 0, '2026-09-01 04:00:09'],
      [16, 2, 'I belong', 'Digital', 'Digital art', 'https://lh3.googleusercontent.com/d/1nsTSBxCuTWT5-EvnhKRbPOwqdDu6WXhi', 0, '2026-09-01 04:00:54'],
      [17, 2, '3D donut and mug', 'Digital', 'tried blender for the first time', 'https://lh3.googleusercontent.com/d/1CHZr2Z2BCJMc2i58qSpJbUE8Qo8u_u7e', 0, '2026-09-01 04:03:28'],
      [18, 2, 'serene', 'Digital', '', 'https://lh3.googleusercontent.com/d/1EK6RNQb4HsK_h_2Cuj9KsuFPdUWh_pfW', 0, '2026-09-01 04:05:26'],
      [19, 2, 'bubbles', 'Digital', '', 'https://lh3.googleusercontent.com/d/1nMzD4WqsvNx6wTR9M9v7mA_DWJTNOYYu', 0, '2026-09-01 04:06:32'],
      [20, 2, 'lost', 'Digital', '', 'https://lh3.googleusercontent.com/d/1MyZpCOObkHFjAAbTSCD-0tcSz4-IwTld', 0, '2026-09-01 04:07:10'],
      [21, 2, 'green', 'Digital', 'greennnnnnnnnnnnnnnnnnn', 'https://lh3.googleusercontent.com/d/1HCVKi-8iWRKDcg0ssVhNG-D1ETOB_ROe', 0, '2026-09-01 04:10:38'],
      [22, 2, 'horsie', 'Digital', '', 'https://lh3.googleusercontent.com/d/1YGKWxX_KHktyhQsyKeGgpwb9itq9ymou', 0, '2026-09-01 04:14:33']
    ];
    for (const a of artworks) {
      await runSql('INSERT INTO Artworks (art_id, artist_id, title, type, description, media_url, react_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', a);
    }

    // Insert ArtworkComments
    const comments = [
      [2, 2, 4, 'The leaf crown and cozy scarf on the kitten are so wholesome, Jarif!', '2026-08-22 23:19:41'],
      [3, 3, 5, 'The expression on Bitwa is unforgettable!', '2026-08-22 23:19:41'],
      [4, 4, 3, 'The purple hues and silhouette composition under the stars are breathtaking.', '2026-08-22 23:19:41'],
      [5, 6, 2, 'They form such a perfect heart shape while sleeping, beautiful work Rudila!', '2026-08-22 23:19:41'],
      [8, 2, 2, 'cute', '2026-08-31 22:04:41'],
      [9, 3, 2, 'what is this dude', '2026-08-31 22:04:53'],
      [10, 5, 2, 'huh', '2026-08-31 22:05:25']
    ];
    for (const c of comments) {
      await runSql('INSERT INTO ArtworkComments (comment_id, art_id, user_id, comment_text, created_at) VALUES (?, ?, ?, ?, ?)', c);
    }

    // Insert ArtworkReactions
    const reactions = [
      [2, 2, 'like'],
      [2, 3, 'like'],
      [2, 5, 'like']
    ];
    for (const r of reactions) {
      await runSql('INSERT INTO ArtworkReactions (user_id, art_id, reaction_type) VALUES (?, ?, ?)', r);
    }

    // Insert Challenges
    const challenges = [
      [1, 1, 'Cyberpunk Dhaka 2088 Challenge', 'Re-imagine historic landmarks of Bangladesh infused with high-tech futurism, neon gradients, and cultural iconography.', '2026-08-01', '2026-08-30', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop', 50, 'Active'],
      [2, 1, 'Monsoon Bengal Invitational', 'Capture the mood, storms, river waves, and agricultural vitality of the Bengal rainy season using traditional & digital mediums.', '2026-08-10', '2026-09-10', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop', 30, 'Active'],
      [3, 1, 'Pahela Baishakh Visual Identity Contest', 'Design folk festival masks, owls, tigers, and floral patterns celebrating Bengali New Year.', '2026-04-01', '2026-04-20', 'https://images.unsplash.com/photo-1549887534-1541e9326642?q=80&w=950&auto=format&fit=crop', 100, 'Ended']
    ];
    for (const ch of challenges) {
      await runSql('INSERT INTO Challenges (challenge_id, creator_id, title, description, start_date, deadline, banner_url, participation_limit, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', ch);
    }

    // Insert ChallengeSubmissions
    const submissions = [
      [2, 2, 2, 3, 38, 2, '2026-08-22 23:19:41'],
      [3, 1, 3, 4, 35, 3, '2026-08-22 23:19:41'],
      [4, 3, 8, 5, 54, 1, '2026-08-22 23:19:41']
    ];
    for (const s of submissions) {
      await runSql('INSERT INTO ChallengeSubmissions (submission_id, challenge_id, art_id, artist_id, vote_count, rank, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?)', s);
    }

    // Insert Commissions
    const commissions = [
      [1, 5, 2, 'Sci-Fi Novel Cover Illustration (Print-ready 300 DPI)', 'Looking for a cyberpunk visual concept featuring Sadarghat terminal with high contrast neon lighting and character in foreground.', 250.00, '2026-09-15', 'In Progress', null, '2026-08-22 23:19:41'],
      [2, 3, 4, '3D Mascot Modeling & Rigging for Mobile Game', 'Low-poly stylized animated character with idle, run, and jump animations in Blender.', 320.00, '2026-08-25', 'Review', null, '2026-08-22 23:19:41'],
      [3, 4, 3, 'Digital Matte Concept for Short Film Backgrounds', 'Series of 2 matte paintings showcasing futuristic Dhaka skylines at twilight.', 220.00, '2026-09-20', 'Accepted', null, '2026-08-22 23:19:41'],
      [4, 1, 5, 'Cultural Festival Brand Identity & Illustrated Posters', 'Handcrafted vector and digital illustrations celebrating heritage craft fair.', 190.00, '2026-09-30', 'Requested', null, '2026-08-22 23:19:41']
    ];
    for (const cm of commissions) {
      await runSql('INSERT INTO Commissions (task_id, client_id, artist_id, requirements, description, price_offered, deadline, current_status, media_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', cm);
    }

    // Insert Courses
    const courses = [
      [1, 4, 'Absolute basics of Blender: make your own 3D model in 6 hours', '3D & Motion', 'Beginner', 30.00, '2026-08-22 23:19:41'],
      [2, 3, 'Introduction to anatomy:2D art', 'Digital Painting', 'Beginner', 25.00, '2026-08-22 23:19:41'],
      [3, 5, 'Intermediate oil painting full course', 'Traditional Painting', 'Intermediate', 45.00, '2026-08-22 23:19:41'],
      [4, 2, 'How to start digital painting', 'Digital Painting', 'Beginner', 20.00, '2026-08-22 23:19:41'],
      [5, 4, 'Learn Animation: basics', 'Animation', 'Beginner', 35.00, '2026-08-22 23:19:41'],
      [6, 4, 'Learn Animation: Advanced', 'Animation', 'Advanced', 65.00, '2026-08-22 23:19:41'],
      [7, 5, 'Airdry Clay Tutorials for beginners', 'Sculpting & Crafts', 'Beginner', 25.00, '2026-08-22 23:19:41'],
      [8, 5, 'Make your own Crochet project', 'Crafts & Textiles', 'Beginner', 20.00, '2026-08-22 23:19:41'],
      [9, 5, 'Step by step guide on Crochet', 'Crafts & Textiles', 'Intermediate', 35.00, '2026-08-22 23:19:41'],
      [10, 3, 'Learn pixel art in 2026', 'Digital Painting', 'Beginner', 30.00, '2026-08-22 23:19:41'],
      [11, 3, 'Polish your Acrylic painting skill', 'Traditional Painting', 'Intermediate', 40.00, '2026-08-22 23:19:41'],
      [12, 4, 'Explore Advanced 3D Animation', '3D & Motion', 'Advanced', 70.00, '2026-08-22 23:19:41']
    ];
    for (const cr of courses) {
      await runSql('INSERT INTO Courses (course_id, instructor_id, title, category, difficulty, pricing, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)', cr);
    }

    // Insert CourseContent (54 lessons)
    const content = [
      [1, 1, 'Lesson 1: Introduction to the 3D Viewport & Navigation', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 1],
      [2, 1, 'Lesson 2: Mesh Editing, Extrusion & Beveling Basics', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 2],
      [3, 1, 'Lesson 3: Applying Modifiers & Subdivision Surfaces', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 3],
      [4, 1, 'Lesson 4: Basic Shading, Materials & Lighting Setup', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 4],
      [5, 1, 'Lesson 5: Rendering Your First 3D Model in Cycles', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 5],
      [6, 2, 'Lesson 1: Proportions & Landmarks of the Human Figure', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 1],
      [7, 2, 'Lesson 2: Gesture Drawing & Dynamic Posing', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 2],
      [8, 2, 'Lesson 3: Head Structure & Facial Features Breakdown', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 3],
      [9, 2, 'Lesson 4: Torso, Arms & Leg Muscle Groups', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 4],
      [10, 3, 'Lesson 1: Palette Setup, Mediums & Solvent Safety', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 1],
      [11, 3, 'Lesson 2: Underpainting & Imprimatura Techniques', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 2],
      [12, 3, 'Lesson 3: Glazing, Scumbling & Value Control', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 3],
      [13, 3, 'Lesson 4: Color Temperature & Edge Control in Still Life', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 4],
      [14, 3, 'Lesson 5: Varnish Application & Preservation', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 5],
      [15, 4, 'Lesson 1: Choosing Software & Tablet Calibration', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 1],
      [16, 4, 'Lesson 2: Essential Brushes, Layers & Blending Modes', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 2],
      [17, 4, 'Lesson 3: Value Studies & Grayscale to Color Workflow', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 3],
      [18, 4, 'Lesson 4: Color Harmonies & Finishing Touches', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 4],
      [19, 5, 'Lesson 1: The 12 Principles of Animation Overview', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 1],
      [20, 5, 'Lesson 2: Timing, Spacing & The Bouncing Ball Exercise', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 2],
      [21, 5, 'Lesson 3: Squash & Stretch in 2D Space', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 3],
      [22, 5, 'Lesson 4: Anticipation, Follow-Through & Overlapping Action', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 4],
      [23, 6, 'Lesson 1: Complex Character Walks & Runs', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 1],
      [24, 6, 'Lesson 2: Weight Shifts & Dynamic Action Sequences', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 2],
      [25, 6, 'Lesson 3: Facial Animation, Lip Sync & Acting', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 3],
      [26, 6, 'Lesson 4: Secondary Motion & Cloth Dynamics', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 4],
      [27, 6, 'Lesson 5: Camera Staging & Cinematic Storyboarding', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 5],
      [28, 6, 'Lesson 6: Final Polish & Portfolio Reel Preparation', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 6],
      [29, 7, 'Lesson 1: Tools, Clay Types & Conditioning', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 1],
      [30, 7, 'Lesson 2: Pinch Pots & Basic Organic Forms', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 2],
      [31, 7, 'Lesson 3: Joining Pieces & Preventing Cracks', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 3],
      [32, 7, 'Lesson 4: Sanding, Acrylic Painting & Sealing', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 4],
      [33, 8, 'Lesson 1: Selecting Yarn, Hook Sizes & Tension', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 1],
      [34, 8, 'Lesson 2: Single Crochet & Double Crochet Stitches', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 2],
      [35, 8, 'Lesson 3: Working in the Round: Making a Coaster', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 3],
      [36, 8, 'Lesson 4: Fastening Off & Weaving in Ends', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 4],
      [37, 9, 'Lesson 1: Reading Complex Crochet Patterns & Charts', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 1],
      [38, 9, 'Lesson 2: Granny Squares & Motif Construction', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 2],
      [39, 9, 'Lesson 3: Increasing, Decreasing & Shaping Garments', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 3],
      [40, 9, 'Lesson 4: Blocking & Assembling Finished Pieces', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 4],
      [41, 9, 'Lesson 5: Adding Borders, Ribbing & Decorative Edges', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 5],
      [42, 10, 'Lesson 1: Grid Setup, Canvas Sizes & Pixel Clusters', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 1],
      [43, 10, 'Lesson 2: Color Palettes, Dithering & Index Shading', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 2],
      [44, 10, 'Lesson 3: Creating Game Sprites & Isometric Tiles', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 3],
      [45, 10, 'Lesson 4: Animating Walk Cycles in 16x16 and 32x32', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 4],
      [46, 11, 'Lesson 1: Acrylic Drying Times & Retarder Mediums', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 1],
      [47, 11, 'Lesson 2: Impasto & Palette Knife Texture Techniques', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 2],
      [48, 11, 'Lesson 3: Atmospheric Landscapes & Color Vibrancy', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 3],
      [49, 11, 'Lesson 4: Layering Transparencies & Matte Varnishing', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 4],
      [50, 12, 'Lesson 1: Rigging Architecture & Inverse Kinematics', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 1],
      [51, 12, 'Lesson 2: Realistic Weight Distribution in Creature Motion', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 2],
      [52, 12, 'Lesson 3: Combat Sequences & High-Velocity Stunts', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 3],
      [53, 12, 'Lesson 4: Graph Editor Curve Polishing & Sub-Frame Timing', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 4],
      [54, 12, 'Lesson 5: Simulating Hair, Fur & Environmental Collisions', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1', 5]
    ];
    for (const c of content) {
      await runSql('INSERT INTO CourseContent (content_id, course_id, title, content_url, sequence_order) VALUES (?, ?, ?, ?, ?)', c);
    }

    // Insert CourseEnrollments
    await runSql('INSERT INTO CourseEnrollments (enrollment_id, course_id, user_id, completion_status, enrolled_at) VALUES (1, 6, 2, "In Progress", "2026-08-31 22:06:01")');

    console.log('✓ SQLite database populated successfully!');
    db.close();
  } catch (err) {
    console.error('SQLite population error:', err);
    db.close();
  }
}

async function main() {
  await populateMariaDB();
  await populateSQLite();
  console.log('\n🎉 Database population completed successfully for all tables!');
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
