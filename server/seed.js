import { initDb, run, queryAll, isSqlite } from './db.js';
import { hashPassword } from './authUtils.js';

async function seed() {
  console.log('--- Initializing Database Schema ---');
  await initDb();

  console.log('--- Clearing Existing Records ---');
  if (isSqlite()) {
    await run('PRAGMA foreign_keys = OFF');
  } else {
    await run('SET FOREIGN_KEY_CHECKS = 0');
  }
  const tables = [
    'Commissions',
    'CourseEnrollments', 'CourseContent', 'Courses', 'ChallengeSubmissions',
    'Challenges', 'ArtworkComments', 'Artworks',
    'ArtistExpertise', 'Artists', 'Admins', 'Users'
  ];
  for (const t of tables) {
    await run(`DELETE FROM ${t}`);
  }
  if (isSqlite()) {
    await run('PRAGMA foreign_keys = ON');
  } else {
    await run('SET FOREIGN_KEY_CHECKS = 1');
  }

  console.log('--- Seeding ShilpiKunjo Data ---');

  // 1. Users (All emails using domain @sk.com)
  const users = [
    { id: 1, u: 'admin', e: 'admin@sk.com', p: 'password123', n: 'System Administrator', ph: '+8801700000000', a: 'Dhaka, Bangladesh' },
    { id: 2, u: 'rubab_sazda', e: 'rubab@sk.com', p: 'password123', n: 'Rubab Sazda', ph: '+8801811112233', a: 'Dhanmondi, Dhaka' },
    { id: 3, u: 'jarif', e: 'jarif@sk.com', p: 'password123', n: 'Jarif', ph: '+8801711223344', a: 'Gulshan, Dhaka' },
    { id: 4, u: 'fairuz', e: 'fairuz@sk.com', p: 'password123', n: 'Fairuz', ph: '+8801822334455', a: 'Uttara, Dhaka' },
    { id: 5, u: 'rudila', e: 'rudila@sk.com', p: 'password123', n: 'Rudila', ph: '+8801933445566', a: 'Banani, Dhaka' }
  ];

  for (const u of users) {
    await run(
      `INSERT INTO Users (user_id, username, email, password_hash, name, phone_number, address) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.u, u.e, hashPassword(u.p), u.n, u.ph, u.a]
    );
  }

  // 2. Admins
  await run(`INSERT INTO Admins (admin_id) VALUES (1)`);

  // 3. Artists
  const artists = [
    { id: 2, bio: 'Concept Artist & Visual Storyteller. Exploring South Asian folklore, Rickshaw art aesthetics, and sci-fi worldbuilding.', links: 'https://artstation.com/rubab', status: 'Available' },
    { id: 3, bio: 'Digital & Traditional Concept Artist focusing on South Asian Cyberpunk, environmental storytelling, and stylized characters.', links: 'https://artstation.com/jarif', status: 'Available' },
    { id: 4, bio: '3D Modeler, Environment Artist & Motion Designer creating futuristic cyber-Dhaka sceneries in Blender & Unreal.', links: 'https://behance.net/fairuz', status: 'Busy' },
    { id: 5, bio: 'Visual Illustrator & Graphic Novelist blending folk motifs with modern fantasy aesthetics.', links: 'https://instagram.com/rudila_art', status: 'Available' }
  ];

  for (const a of artists) {
    await run(
      `INSERT INTO Artists (artist_id, bio, portfolio_links, availability_status) VALUES (?, ?, ?, ?)`,
      [a.id, a.bio, a.links, a.status]
    );
  }

  // 4. ArtistExpertise (Multi-valued attribute normalization)
  const expertiseList = [
    { id: 2, exp: 'Digital Painting' },
    { id: 2, exp: 'Concept Art' },
    { id: 2, exp: 'Character Design' },
    { id: 3, exp: 'Digital Illustration' },
    { id: 3, exp: 'Concept Art' },
    { id: 3, exp: 'Environment Design' },
    { id: 4, exp: '3D Modeling' },
    { id: 4, exp: 'Blender' },
    { id: 4, exp: 'Motion Graphics' },
    { id: 5, exp: 'Folk Art' },
    { id: 5, exp: 'Graphic Novel' },
    { id: 5, exp: 'Visual Storytelling' }
  ];

  for (const exp of expertiseList) {
    await run(`INSERT INTO ArtistExpertise (artist_id, expertise) VALUES (?, ?)`, [exp.id, exp.exp]);
  }

  // 5. Artworks (Showcase Feed items - No pricing!)
  const artworks = [
    {
      id: 1,
      artist_id: 2,
      title: "Life Update: I'm Up Again",
      type: 'Digital',
      desc: 'Playful and iconic portrait of a cool baby donning dark shades and a crimson hoodie, radiating unbreakable energy and swagger by Rubab Sazda.',
      url: '/artworks/art_1.jpg',
      reacts: 78
    },
    {
      id: 2,
      artist_id: 3,
      title: 'Proud Future: Autumn Scarf Kitten',
      type: 'Digital',
      desc: 'Heartwarming illustration of a brave orange tabby kitten wrapped in a cozy knit scarf with an autumn maple leaf crown in the morning light by Jarif.',
      url: '/artworks/art_2.jpg',
      reacts: 94
    },
    {
      id: 3,
      artist_id: 4,
      title: 'The Puzzled Bitwa',
      type: 'Animation',
      desc: 'Humorous monochrome character study of a baby wearing a plaid turban headwrap with a quizzical, questioning expression by Fairuz.',
      url: '/artworks/art_3.jpg',
      reacts: 85
    },
    {
      id: 4,
      artist_id: 2,
      title: 'Twilight Solitude & Lavender Fields',
      type: 'Digital',
      desc: 'Atmospheric widescreen landscape featuring a silhouette oak tree overlooking a luminous field of blooming purple lavender under starlight by Rubab Sazda.',
      url: '/artworks/art_4.jpg',
      reacts: 112
    },
    {
      id: 5,
      artist_id: 4,
      title: 'Boxer Kitty: Ready to Rumble',
      type: 'Animation',
      desc: 'Dynamic and feisty character concept of a little kitten sporting a mini red boxing glove ready for a friendly sparring match by Fairuz.',
      url: '/artworks/art_5.jpg',
      reacts: 69
    },
    {
      id: 6,
      artist_id: 5,
      title: 'Slumbering Yin-Yang Kittens',
      type: 'Hand-drawn',
      desc: 'Tender and intimate study of two young calico kittens sleeping peacefully curled together in a harmonious heart-shaped embrace by Rudila.',
      url: '/artworks/art_6.jpg',
      reacts: 103
    },
    {
      id: 7,
      artist_id: 3,
      title: 'Celestial Twilight & Crescent Moon',
      type: 'Hand-drawn',
      desc: 'Lush nighttime landscape photography capturing a deep cobalt twilight sky with the glowing crescent moon and Venus framed by tree canopies by Jarif.',
      url: '/artworks/art_7.jpg',
      reacts: 88
    },
    {
      id: 8,
      artist_id: 5,
      title: 'Pastel Dusk Over the Horizon',
      type: 'Hand-drawn',
      desc: 'Serene dusk study capturing glowing pastel cumulonimbus clouds infused with delicate sunset pink and gold tones over a foliage fence by Rudila.',
      url: '/artworks/art_8.jpg',
      reacts: 76
    },
    {
      id: 9,
      artist_id: 2,
      title: 'Retro Pop Commander',
      type: 'Digital',
      desc: 'Surreal pop-art digital collage remix featuring colorful retro cartoon sticker elements over a cinematic battlefield setting by Rubab Sazda.',
      url: 'https://lh3.googleusercontent.com/d/16VDnfv6VbfXHMZ-ONnMsdL1EU3oM1F6U',
      reacts: 65
    }
  ];

  for (const art of artworks) {
    await run(
      `INSERT INTO Artworks (art_id, artist_id, title, type, description, media_url, react_count) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [art.id, art.artist_id, art.title, art.type, art.desc, art.url, art.reacts]
    );
  }

  // 6. Artwork Comments
  const comments = [
    { art_id: 1, user_id: 3, text: 'That confident look and shades are legendary, Rubab!' },
    { art_id: 2, user_id: 4, text: 'The leaf crown and cozy scarf on the kitten are so wholesome, Jarif!' },
    { art_id: 3, user_id: 5, text: 'The expression on Bitwa is unforgettable!' },
    { art_id: 4, user_id: 3, text: 'The purple hues and silhouette composition under the stars are breathtaking.' },
    { art_id: 6, user_id: 2, text: 'They form such a perfect heart shape while sleeping, beautiful work Rudila!' },
    { art_id: 9, user_id: 3, text: 'The pop-art sunglasses and sticker aesthetics add such a hilarious punch!' }
  ];

  for (const c of comments) {
    await run(`INSERT INTO ArtworkComments (art_id, user_id, comment_text) VALUES (?, ?, ?)`, [c.art_id, c.user_id, c.text]);
  }

  // 7. Challenges (Contests)
  const challenges = [
    {
      id: 1,
      creator_id: 1,
      title: 'Cyberpunk Dhaka 2088 Challenge',
      desc: 'Re-imagine historic landmarks of Bangladesh infused with high-tech futurism, neon gradients, and cultural iconography.',
      start: '2026-08-01',
      deadline: '2026-08-30',
      banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
      limit: 50,
      status: 'Active'
    },
    {
      id: 2,
      creator_id: 1,
      title: 'Monsoon Bengal Invitational',
      desc: 'Capture the mood, storms, river waves, and agricultural vitality of the Bengal rainy season using traditional & digital mediums.',
      start: '2026-08-10',
      deadline: '2026-09-10',
      banner: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop',
      limit: 30,
      status: 'Active'
    },
    {
      id: 3,
      creator_id: 1,
      title: 'Pahela Baishakh Visual Identity Contest',
      desc: 'Design folk festival masks, owls, tigers, and floral patterns celebrating Bengali New Year.',
      start: '2026-04-01',
      deadline: '2026-04-20',
      banner: 'https://images.unsplash.com/photo-1549887534-1541e9326642?q=80&w=950&auto=format&fit=crop',
      limit: 100,
      status: 'Ended'
    }
  ];

  for (const ch of challenges) {
    await run(
      `INSERT INTO Challenges (challenge_id, creator_id, title, description, start_date, deadline, banner_url, participation_limit, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ch.id, ch.creator_id, ch.title, ch.desc, ch.start, ch.deadline, ch.banner, ch.limit, ch.status]
    );
  }

  // 8. Challenge Submissions (Contest Entries)
  const submissions = [
    { id: 1, ch_id: 1, art_id: 1, artist_id: 2, votes: 42, rank: 1 },
    { id: 2, ch_id: 2, art_id: 2, artist_id: 3, votes: 38, rank: 2 },
    { id: 3, ch_id: 1, art_id: 3, artist_id: 4, votes: 35, rank: 3 },
    { id: 4, ch_id: 3, art_id: 8, artist_id: 5, votes: 54, rank: 1 }
  ];

  for (const s of submissions) {
    await run(
      `INSERT INTO ChallengeSubmissions (submission_id, challenge_id, art_id, artist_id, vote_count, rank) VALUES (?, ?, ?, ?, ?, ?)`,
      [s.id, s.ch_id, s.art_id, s.artist_id, s.votes, s.rank]
    );
  }

  // 9. Courses & Curriculum Content
  const ytUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1';

  const courses = [
    {
      id: 1,
      inst_id: 4,
      title: 'Absolute basics of Blender: make your own 3D model in 6 hours',
      cat: '3D & Motion',
      diff: 'Beginner',
      price: 30.00
    },
    {
      id: 2,
      inst_id: 3,
      title: 'Introduction to anatomy:2D art',
      cat: 'Digital Painting',
      diff: 'Beginner',
      price: 25.00
    },
    {
      id: 3,
      inst_id: 5,
      title: 'Intermediate oil painting full course',
      cat: 'Traditional Painting',
      diff: 'Intermediate',
      price: 45.00
    },
    {
      id: 4,
      inst_id: 2,
      title: 'How to start digital painting',
      cat: 'Digital Painting',
      diff: 'Beginner',
      price: 20.00
    },
    {
      id: 5,
      inst_id: 4,
      title: 'Learn Animation: basics',
      cat: 'Animation',
      diff: 'Beginner',
      price: 35.00
    },
    {
      id: 6,
      inst_id: 4,
      title: 'Learn Animation: Advanced',
      cat: 'Animation',
      diff: 'Advanced',
      price: 65.00
    },
    {
      id: 7,
      inst_id: 5,
      title: 'Airdry Clay Tutorials for beginners',
      cat: 'Sculpting & Crafts',
      diff: 'Beginner',
      price: 25.00
    },
    {
      id: 8,
      inst_id: 5,
      title: 'Make your own Crochet project',
      cat: 'Crafts & Textiles',
      diff: 'Beginner',
      price: 20.00
    },
    {
      id: 9,
      inst_id: 5,
      title: 'Step by step guide on Crochet',
      cat: 'Crafts & Textiles',
      diff: 'Intermediate',
      price: 35.00
    },
    {
      id: 10,
      inst_id: 3,
      title: 'Learn pixel art in 2026',
      cat: 'Digital Painting',
      diff: 'Beginner',
      price: 30.00
    },
    {
      id: 11,
      inst_id: 3,
      title: 'Polish your Acrylic painting skill',
      cat: 'Traditional Painting',
      diff: 'Intermediate',
      price: 40.00
    },
    {
      id: 12,
      inst_id: 4,
      title: 'Explore Advanced 3D Animation',
      cat: '3D & Motion',
      diff: 'Advanced',
      price: 70.00
    }
  ];

  for (const co of courses) {
    await run(
      `INSERT INTO Courses (course_id, instructor_id, title, category, difficulty, pricing) VALUES (?, ?, ?, ?, ?, ?)`,
      [co.id, co.inst_id, co.title, co.cat, co.diff, co.price]
    );
  }

  const courseLessons = [
    // Course 1: Absolute basics of Blender
    { c_id: 1, title: 'Lesson 1: Introduction to the 3D Viewport & Navigation', url: ytUrl, seq: 1 },
    { c_id: 1, title: 'Lesson 2: Mesh Editing, Extrusion & Beveling Basics', url: ytUrl, seq: 2 },
    { c_id: 1, title: 'Lesson 3: Applying Modifiers & Subdivision Surfaces', url: ytUrl, seq: 3 },
    { c_id: 1, title: 'Lesson 4: Basic Shading, Materials & Lighting Setup', url: ytUrl, seq: 4 },
    { c_id: 1, title: 'Lesson 5: Rendering Your First 3D Model in Cycles', url: ytUrl, seq: 5 },

    // Course 2: Introduction to anatomy:2D art
    { c_id: 2, title: 'Lesson 1: Proportions & Landmarks of the Human Figure', url: ytUrl, seq: 1 },
    { c_id: 2, title: 'Lesson 2: Gesture Drawing & Dynamic Posing', url: ytUrl, seq: 2 },
    { c_id: 2, title: 'Lesson 3: Head Structure & Facial Features Breakdown', url: ytUrl, seq: 3 },
    { c_id: 2, title: 'Lesson 4: Torso, Arms & Leg Muscle Groups', url: ytUrl, seq: 4 },

    // Course 3: Intermediate oil painting full course
    { c_id: 3, title: 'Lesson 1: Palette Setup, Mediums & Solvent Safety', url: ytUrl, seq: 1 },
    { c_id: 3, title: 'Lesson 2: Underpainting & Imprimatura Techniques', url: ytUrl, seq: 2 },
    { c_id: 3, title: 'Lesson 3: Glazing, Scumbling & Value Control', url: ytUrl, seq: 3 },
    { c_id: 3, title: 'Lesson 4: Color Temperature & Edge Control in Still Life', url: ytUrl, seq: 4 },
    { c_id: 3, title: 'Lesson 5: Varnish Application & Preservation', url: ytUrl, seq: 5 },

    // Course 4: How to start digital painting
    { c_id: 4, title: 'Lesson 1: Choosing Software & Tablet Calibration', url: ytUrl, seq: 1 },
    { c_id: 4, title: 'Lesson 2: Essential Brushes, Layers & Blending Modes', url: ytUrl, seq: 2 },
    { c_id: 4, title: 'Lesson 3: Value Studies & Grayscale to Color Workflow', url: ytUrl, seq: 3 },
    { c_id: 4, title: 'Lesson 4: Color Harmonies & Finishing Touches', url: ytUrl, seq: 4 },

    // Course 5: Learn Animation: basics
    { c_id: 5, title: 'Lesson 1: The 12 Principles of Animation Overview', url: ytUrl, seq: 1 },
    { c_id: 5, title: 'Lesson 2: Timing, Spacing & The Bouncing Ball Exercise', url: ytUrl, seq: 2 },
    { c_id: 5, title: 'Lesson 3: Squash & Stretch in 2D Space', url: ytUrl, seq: 3 },
    { c_id: 5, title: 'Lesson 4: Anticipation, Follow-Through & Overlapping Action', url: ytUrl, seq: 4 },

    // Course 6: Learn Animation: Advanced
    { c_id: 6, title: 'Lesson 1: Complex Character Walks & Runs', url: ytUrl, seq: 1 },
    { c_id: 6, title: 'Lesson 2: Weight Shifts & Dynamic Action Sequences', url: ytUrl, seq: 2 },
    { c_id: 6, title: 'Lesson 3: Facial Animation, Lip Sync & Acting', url: ytUrl, seq: 3 },
    { c_id: 6, title: 'Lesson 4: Secondary Motion & Cloth Dynamics', url: ytUrl, seq: 4 },
    { c_id: 6, title: 'Lesson 5: Camera Staging & Cinematic Storyboarding', url: ytUrl, seq: 5 },
    { c_id: 6, title: 'Lesson 6: Final Polish & Portfolio Reel Preparation', url: ytUrl, seq: 6 },

    // Course 7: Airdry Clay Tutorials for beginners
    { c_id: 7, title: 'Lesson 1: Tools, Clay Types & Conditioning', url: ytUrl, seq: 1 },
    { c_id: 7, title: 'Lesson 2: Pinch Pots & Basic Organic Forms', url: ytUrl, seq: 2 },
    { c_id: 7, title: 'Lesson 3: Joining Pieces & Preventing Cracks', url: ytUrl, seq: 3 },
    { c_id: 7, title: 'Lesson 4: Sanding, Acrylic Painting & Sealing', url: ytUrl, seq: 4 },

    // Course 8: Make your own Crochet project
    { c_id: 8, title: 'Lesson 1: Selecting Yarn, Hook Sizes & Tension', url: ytUrl, seq: 1 },
    { c_id: 8, title: 'Lesson 2: Single Crochet & Double Crochet Stitches', url: ytUrl, seq: 2 },
    { c_id: 8, title: 'Lesson 3: Working in the Round: Making a Coaster', url: ytUrl, seq: 3 },
    { c_id: 8, title: 'Lesson 4: Fastening Off & Weaving in Ends', url: ytUrl, seq: 4 },

    // Course 9: Step by step guide on Crochet
    { c_id: 9, title: 'Lesson 1: Reading Complex Crochet Patterns & Charts', url: ytUrl, seq: 1 },
    { c_id: 9, title: 'Lesson 2: Granny Squares & Motif Construction', url: ytUrl, seq: 2 },
    { c_id: 9, title: 'Lesson 3: Increasing, Decreasing & Shaping Garments', url: ytUrl, seq: 3 },
    { c_id: 9, title: 'Lesson 4: Blocking & Assembling Finished Pieces', url: ytUrl, seq: 4 },
    { c_id: 9, title: 'Lesson 5: Adding Borders, Ribbing & Decorative Edges', url: ytUrl, seq: 5 },

    // Course 10: Learn pixel art in 2026
    { c_id: 10, title: 'Lesson 1: Grid Setup, Canvas Sizes & Pixel Clusters', url: ytUrl, seq: 1 },
    { c_id: 10, title: 'Lesson 2: Color Palettes, Dithering & Index Shading', url: ytUrl, seq: 2 },
    { c_id: 10, title: 'Lesson 3: Creating Game Sprites & Isometric Tiles', url: ytUrl, seq: 3 },
    { c_id: 10, title: 'Lesson 4: Animating Walk Cycles in 16x16 and 32x32', url: ytUrl, seq: 4 },

    // Course 11: Polish your Acrylic painting skill
    { c_id: 11, title: 'Lesson 1: Acrylic Drying Times & Retarder Mediums', url: ytUrl, seq: 1 },
    { c_id: 11, title: 'Lesson 2: Impasto & Palette Knife Texture Techniques', url: ytUrl, seq: 2 },
    { c_id: 11, title: 'Lesson 3: Atmospheric Landscapes & Color Vibrancy', url: ytUrl, seq: 3 },
    { c_id: 11, title: 'Lesson 4: Layering Transparencies & Matte Varnishing', url: ytUrl, seq: 4 },

    // Course 12: Explore Advanced 3D Animation
    { c_id: 12, title: 'Lesson 1: Rigging Architecture & Inverse Kinematics', url: ytUrl, seq: 1 },
    { c_id: 12, title: 'Lesson 2: Realistic Weight Distribution in Creature Motion', url: ytUrl, seq: 2 },
    { c_id: 12, title: 'Lesson 3: Combat Sequences & High-Velocity Stunts', url: ytUrl, seq: 3 },
    { c_id: 12, title: 'Lesson 4: Graph Editor Curve Polishing & Sub-Frame Timing', url: ytUrl, seq: 4 },
    { c_id: 12, title: 'Lesson 5: Simulating Hair, Fur & Environmental Collisions', url: ytUrl, seq: 5 }
  ];

  for (const l of courseLessons) {
    await run(
      `INSERT INTO CourseContent (course_id, title, content_url, sequence_order) VALUES (?, ?, ?, ?)`,
      [l.c_id, l.title, l.url, l.seq]
    );
  }

  // 10. Commissions (Freelance Job Board & Tracking)
  const commissions = [
    {
      id: 1,
      client_id: 5,
      artist_id: 2,
      req: 'Sci-Fi Novel Cover Illustration (Print-ready 300 DPI)',
      desc: 'Looking for a cyberpunk visual concept featuring Sadarghat terminal with high contrast neon lighting and character in foreground.',
      price: 250.00,
      deadline: '2026-09-15',
      status: 'In Progress'
    },
    {
      id: 2,
      client_id: 3,
      artist_id: 4,
      req: '3D Mascot Modeling & Rigging for Mobile Game',
      desc: 'Low-poly stylized animated character with idle, run, and jump animations in Blender.',
      price: 320.00,
      deadline: '2026-08-25',
      status: 'Review'
    },
    {
      id: 3,
      client_id: 4,
      artist_id: 3,
      req: 'Digital Matte Concept for Short Film Backgrounds',
      desc: 'Series of 2 matte paintings showcasing futuristic Dhaka skylines at twilight.',
      price: 220.00,
      deadline: '2026-09-20',
      status: 'Accepted'
    },
    {
      id: 4,
      client_id: 1,
      artist_id: 5,
      req: 'Cultural Festival Brand Identity & Illustrated Posters',
      desc: 'Handcrafted vector and digital illustrations celebrating heritage craft fair.',
      price: 190.00,
      deadline: '2026-09-30',
      status: 'Requested'
    }
  ];

  for (const cm of commissions) {
    await run(
      `INSERT INTO Commissions (task_id, client_id, artist_id, requirements, description, price_offered, deadline, current_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [cm.id, cm.client_id, cm.artist_id, cm.req, cm.desc, cm.price, cm.deadline, cm.status]
    );
  }

  console.log('--- MariaDB Database Successfully Populated! ---');
  process.exit(0);
}

seed().catch(err => {
  console.error('MariaDB Seed Error:', err);
  process.exit(1);
});
