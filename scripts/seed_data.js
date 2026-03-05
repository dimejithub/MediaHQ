// Sample data generator for TEN MediaHQ
const { MongoClient } = require('mongodb');

async function seedDatabase() {
  const client = new MongoClient(process.env.MONGO_URL || 'mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'test_database');

    console.log('Seeding sample data...');

    // Sample users
    const users = [
      {
        user_id: 'user_admin001',
        email: 'admin@churchmedia.com',
        name: 'Sarah Johnson',
        picture: 'https://images.unsplash.com/photo-1602566356438-dd36d35e989c?w=150',
        role: 'admin',
        skills: ['Camera', 'Sound', 'Lighting', 'Directing'],
        availability: 'available',
        phone: '+1234567890',
        created_at: new Date().toISOString()
      },
      {
        user_id: 'user_lead001',
        email: 'lead@churchmedia.com',
        name: 'Michael Chen',
        picture: 'https://images.unsplash.com/photo-1659100947220-48b5d5738148?w=150',
        role: 'team_lead',
        skills: ['Camera', 'Video Editing', 'Livestream'],
        availability: 'available',
        phone: '+1234567891',
        created_at: new Date().toISOString()
      },
      {
        user_id: 'user_member001',
        email: 'member1@churchmedia.com',
        name: 'Emily Rodriguez',
        picture: 'https://images.unsplash.com/photo-1720874129553-1d2e66076b16?w=150',
        role: 'member',
        skills: ['Sound', 'ProPresenter'],
        availability: 'available',
        phone: '+1234567892',
        created_at: new Date().toISOString()
      },
      {
        user_id: 'user_member002',
        email: 'member2@churchmedia.com',
        name: 'David Kim',
        picture: 'https://via.placeholder.com/150',
        role: 'member',
        skills: ['Camera', 'Lighting'],
        availability: 'available',
        phone: '+1234567893',
        created_at: new Date().toISOString()
      },
      {
        user_id: 'user_member003',
        email: 'member3@churchmedia.com',
        name: 'Jessica Thompson',
        picture: 'https://via.placeholder.com/150',
        role: 'member',
        skills: ['Graphics', 'Social Media'],
        availability: 'available',
        phone: '+1234567894',
        created_at: new Date().toISOString()
      }
    ];

    await db.collection('users').deleteMany({});
    await db.collection('users').insertMany(users);
    console.log('✓ Users seeded');

    // Sample services
    const services = [
      {
        service_id: 'service_001',
        title: 'Sunday Morning Service',
        date: '2026-02-01',
        time: '10:00',
        type: 'sunday_service',
        description: 'Regular Sunday worship service',
        created_by: 'user_admin001',
        created_at: new Date().toISOString()
      },
      {
        service_id: 'service_002',
        title: 'Worship Night',
        date: '2026-02-05',
        time: '19:00',
        type: 'worship_night',
        description: 'Evening worship and prayer service',
        created_by: 'user_admin001',
        created_at: new Date().toISOString()
      },
      {
        service_id: 'service_003',
        title: 'Sunday Morning Service',
        date: '2026-02-08',
        time: '10:00',
        type: 'sunday_service',
        description: 'Regular Sunday worship service',
        created_by: 'user_admin001',
        created_at: new Date().toISOString()
      }
    ];

    await db.collection('services').deleteMany({});
    await db.collection('services').insertMany(services);
    console.log('✓ Services seeded');

    // Sample equipment
    const equipment = [
      {
        equipment_id: 'equip_001',
        name: 'Sony A7S III Camera',
        category: 'camera',
        status: 'available',
        notes: 'Main camera for livestream',
        checked_out_by: null,
        checked_out_at: null,
        created_at: new Date().toISOString()
      },
      {
        equipment_id: 'equip_002',
        name: 'Shure SM7B Microphone',
        category: 'audio',
        status: 'available',
        notes: 'Pastor vocal microphone',
        checked_out_by: null,
        checked_out_at: null,
        created_at: new Date().toISOString()
      },
      {
        equipment_id: 'equip_003',
        name: 'ATEM Mini Pro',
        category: 'computer',
        status: 'checked_out',
        notes: 'Video switcher',
        checked_out_by: 'user_lead001',
        checked_out_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        equipment_id: 'equip_004',
        name: 'LED Panel Light',
        category: 'lighting',
        status: 'available',
        notes: 'Stage lighting',
        checked_out_by: null,
        checked_out_at: null,
        created_at: new Date().toISOString()
      }
    ];

    await db.collection('equipment').deleteMany({});
    await db.collection('equipment').insertMany(equipment);
    console.log('✓ Equipment seeded');

    // Sample rotas
    const rotas = [
      {
        rota_id: 'rota_001',
        service_id: 'service_001',
        assignments: [
          { assignment_id: 'assign_001', user_id: 'user_lead001', role: 'Camera Operator', status: 'confirmed' },
          { assignment_id: 'assign_002', user_id: 'user_member001', role: 'Sound Engineer', status: 'pending' },
          { assignment_id: 'assign_003', user_id: 'user_member002', role: 'Lighting Tech', status: 'confirmed' }
        ],
        notes: 'Regular Sunday setup',
        created_at: new Date().toISOString()
      },
      {
        rota_id: 'rota_002',
        service_id: 'service_002',
        assignments: [
          { assignment_id: 'assign_004', user_id: 'user_member001', role: 'ProPresenter Operator', status: 'pending' },
          { assignment_id: 'assign_005', user_id: 'user_member003', role: 'Social Media', status: 'confirmed' }
        ],
        notes: 'Worship night minimal setup',
        created_at: new Date().toISOString()
      }
    ];

    await db.collection('rotas').deleteMany({});
    await db.collection('rotas').insertMany(rotas);
    console.log('✓ Rotas seeded');

    // Sample checklists
    const checklists = [
      {
        checklist_id: 'checklist_001',
        service_id: 'service_001',
        title: 'Pre-Service Setup Checklist',
        items: [
          { item_id: 'item_001', text: 'Test all cameras and focus', completed: true },
          { item_id: 'item_002', text: 'Check audio levels on all mics', completed: false },
          { item_id: 'item_003', text: 'Load ProPresenter slides', completed: false },
          { item_id: 'item_004', text: 'Test livestream connection', completed: false },
          { item_id: 'item_005', text: 'Confirm all volunteers present', completed: false }
        ],
        created_at: new Date().toISOString()
      }
    ];

    await db.collection('checklists').deleteMany({});
    await db.collection('checklists').insertMany(checklists);
    console.log('✓ Checklists seeded');

    // Sample training videos
    const trainingVideos = [
      {
        video_id: 'video_001',
        title: 'Camera Operation Basics',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        category: 'camera',
        duration: '15:30',
        description: 'Learn the fundamentals of operating a video camera for church services',
        created_at: new Date().toISOString()
      },
      {
        video_id: 'video_002',
        title: 'Sound Mixing 101',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        category: 'audio',
        duration: '22:45',
        description: 'Introduction to audio mixing for live church services',
        created_at: new Date().toISOString()
      },
      {
        video_id: 'video_003',
        title: 'Lighting Setup Guide',
        youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        category: 'lighting',
        duration: '18:20',
        description: 'How to set up and adjust stage lighting',
        created_at: new Date().toISOString()
      }
    ];

    await db.collection('training_videos').deleteMany({});
    await db.collection('training_videos').insertMany(trainingVideos);
    console.log('✓ Training videos seeded');

    // Sample lead rotation
    const leadRotations = [];
    for (let week = 1; week <= 52; week++) {
      leadRotations.push({
        rotation_id: `rotation_${String(week).padStart(3, '0')}`,
        week_number: week,
        year: 2026,
        lead_user_id: week % 2 === 0 ? 'user_lead001' : 'user_admin001',
        backup_user_id: week % 3 === 0 ? 'user_member002' : null,
        notes: week === 1 ? 'First week of the year' : null
      });
    }

    await db.collection('lead_rotation').deleteMany({});
    await db.collection('lead_rotation').insertMany(leadRotations);
    console.log('✓ Lead rotation seeded');

    console.log('\\n✅ All sample data seeded successfully!');
    console.log('\\nSample credentials:');
    console.log('Admin: admin@churchmedia.com');
    console.log('Team Lead: lead@churchmedia.com');
    console.log('Member: member1@churchmedia.com');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();
