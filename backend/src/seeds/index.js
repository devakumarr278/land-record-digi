const mongoose = require('mongoose');
const connectDB = require('../config/database');
const { seedUsers, SEED_USERS, DEFAULT_DEV_PASSWORD } = require('./users.seed');
const { seedParcels, SEED_PARCELS } = require('./parcels.seed');
const auditService = require('../services/audit.service');
const { AUDIT_ACTIONS } = require('../utils/constants');

const runSeed = async () => {
  try {
    console.log('====================================================');
    console.log('🌱 BHOOMI AI - Master Database Seeder');
    console.log('====================================================');

    await connectDB();

    await seedUsers();
    await seedParcels();

    // Log genesis audit event if no audit logs exist
    const chainVerification = await auditService.verifyChain();
    if (chainVerification.totalEvents === 0) {
      await auditService.logEvent({
        action: AUDIT_ACTIONS.RECORD_SEALED,
        actorRole: 'SYSTEM_ADMIN',
        actorName: 'BHOOMI AI Initialization Routine',
        details: {
          event: 'SYSTEM_GENESIS',
          message: 'BHOOMI AI Land Record Digitization & Validation System Initialized.',
          timestamp: new Date().toISOString(),
        },
      });
      console.log('[Seed] Genesis Audit Block created successfully with SHA-256 provenance.');
    }

    console.log('\n====================================================');
    console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
    console.log('\n📋 DEMO USER CREDENTIALS (Password: ' + DEFAULT_DEV_PASSWORD + ' for all):');
    console.log('----------------------------------------------------');
    SEED_USERS.forEach((u) => {
      console.log(`• Role: ${u.role.padEnd(18)} | Email: ${u.email.padEnd(22)} | Name: ${u.name}`);
    });
    console.log('----------------------------------------------------');
    console.log(`\n🗺️  SEEDED PARCELS (Tamil Nadu):`);
    SEED_PARCELS.forEach((p) => {
      console.log(`• Survey #${p.surveyNumber.padEnd(8)} | ${p.village.padEnd(16)} | Area: ${p.area} ${p.areaUnit} | Owner: ${p.ownerName}`);
    });
    console.log('====================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during database seeding:', error);
    process.exit(1);
  }
};

runSeed();
