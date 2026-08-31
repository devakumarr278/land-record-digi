const User = require('../models/User');
const { ROLES } = require('../utils/constants');

const DEFAULT_DEV_PASSWORD = 'Bhoomi@2026';

const SEED_USERS = [
  {
    userId: 'USR-FO-001',
    name: 'Karthik Subramanian (Field Operator)',
    email: 'operator@bhoomi.ai',
    password: DEFAULT_DEV_PASSWORD,
    role: ROLES.FIELD_OPERATOR,
    district: 'Coimbatore',
    taluk: 'Coimbatore North',
    office: 'Taluk Office, Coimbatore North',
  },
  {
    userId: 'USR-VO-002',
    name: 'Ananya S. Iyer (Verifying Officer)',
    email: 'verifier@bhoomi.ai',
    password: DEFAULT_DEV_PASSWORD,
    role: ROLES.VERIFYING_OFFICER,
    district: 'Coimbatore',
    taluk: 'Coimbatore North',
    office: 'Revenue Division Office, Coimbatore',
  },
  {
    userId: 'USR-DE-003',
    name: 'Dr. R. Natarajan (District Cadastral Expert)',
    email: 'expert@bhoomi.ai',
    password: DEFAULT_DEV_PASSWORD,
    role: ROLES.DISTRICT_EXPERT,
    district: 'Coimbatore',
    taluk: 'District Survey Department',
    office: 'District Collectorate, Coimbatore',
  },
  {
    userId: 'USR-DA-004',
    name: 'P. Vijayaraghavan IAS (District Admin)',
    email: 'admin@bhoomi.ai',
    password: DEFAULT_DEV_PASSWORD,
    role: ROLES.DISTRICT_ADMIN,
    district: 'Coimbatore',
    taluk: 'Collectorate',
    office: 'District Administration Headquarters, Coimbatore',
  },
  {
    userId: 'USR-CA-005',
    name: 'G. Meenakshi (Chief Auditor)',
    email: 'auditor@bhoomi.ai',
    password: DEFAULT_DEV_PASSWORD,
    role: ROLES.CHIEF_AUDITOR,
    district: 'Coimbatore',
    taluk: 'State Audit Bureau',
    office: 'State Land Audit Directorate',
  },
  {
    userId: 'USR-CZ-006',
    name: 'Muruganandham K. (Citizen / Landowner)',
    email: 'citizen@bhoomi.ai',
    password: DEFAULT_DEV_PASSWORD,
    role: ROLES.CITIZEN,
    district: 'Coimbatore',
    taluk: 'Coimbatore North',
    office: 'Public Portal',
  },
  {
    userId: 'USR-SA-007',
    name: 'Bhoomi AI SuperAdmin',
    email: 'sysadmin@bhoomi.ai',
    password: DEFAULT_DEV_PASSWORD,
    role: ROLES.SYSTEM_ADMIN,
    district: 'Statewide',
    taluk: 'State Data Center',
    office: 'TN e-Governance Agency (TNeGA)',
  },
];

const seedUsers = async () => {
  console.log('[Seed] Seeding 7 RBAC User Accounts...');
  for (const userData of SEED_USERS) {
    const existing = await User.findOne({ email: userData.email });
    if (existing) {
      existing.name = userData.name;
      existing.role = userData.role;
      existing.password = userData.password;
      existing.district = userData.district;
      existing.taluk = userData.taluk;
      existing.office = userData.office;
      await existing.save();
    } else {
      const user = new User(userData);
      await user.save();
    }
  }
  console.log('[Seed] Successfully seeded all 7 demo user accounts.');
};

module.exports = { seedUsers, SEED_USERS, DEFAULT_DEV_PASSWORD };
