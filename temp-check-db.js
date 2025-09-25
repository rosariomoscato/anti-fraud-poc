const { db } = require('./src/lib/db');
const { insuranceClaim } = require('./src/lib/schema');
const { sql } = require('drizzle-orm');

async function checkDatabase() {
  try {
    console.log('Checking database records...');
    
    // Count total records
    const countResult = await db.select({ 
      count: sql`COUNT(*)::int` 
    }).from(insuranceClaim);
    
    console.log('Total records:', countResult[0].count);
    
    // Check date range
    const dateResult = await db.select({ 
      min: sql`MIN(incident_date)`,
      max: sql`MAX(incident_date)`
    }).from(insuranceClaim);
    
    console.log('Date range:', dateResult[0]);
    
    // Check for any records with null/invalid dates
    const invalidDates = await db.select({ 
      count: sql`COUNT(*)::int` 
    }).from(insuranceClaim)
    .where(sql`incident_date IS NULL OR incident_date = ''`);
    
    console.log('Invalid dates:', invalidDates[0].count);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabase();