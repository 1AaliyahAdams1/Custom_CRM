const sql = require("mssql");
const { dbConfig } = require("./dbConfig");

async function testTeams() {
  try {
    console.log('🔍 Testing team functionality...');
    
    // Connect to database
    const pool = await sql.connect(dbConfig);
    console.log('✅ Connected to database');
    
    // Check if Team table exists and has data
    const checkQuery = `
      SELECT COUNT(*) as teamCount 
      FROM dbo.Team 
      WHERE Active = 1
    `;
    
    const countResult = await pool.request().query(checkQuery);
    const teamCount = countResult.recordset[0].teamCount;
    console.log(`📊 Found ${teamCount} active teams in database`);
    
    if (teamCount === 0) {
      console.log('📝 No teams found, inserting sample data...');
      
      // Insert sample teams
      const insertQuery = `
        INSERT INTO dbo.Team (TeamName, ManagerID, CreatedAt, Active)
        VALUES 
          ('Development Team', 1, GETDATE(), 1),
          ('Marketing Team', 2, GETDATE(), 1),
          ('Sales Team', 3, GETDATE(), 1),
          ('Support Team', 4, GETDATE(), 1)
      `;
      
      await pool.request().query(insertQuery);
      console.log('✅ Sample teams inserted successfully');
      
      // Verify insertion
      const verifyResult = await pool.request().query(checkQuery);
      const newTeamCount = verifyResult.recordset[0].teamCount;
      console.log(`📊 Now found ${newTeamCount} active teams in database`);
    }
    
    // Test the actual query used by the repository
    const testQuery = `
      SELECT 
        TeamID,
        TeamName,
        ManagerID,
        CreatedAt,
        Active
      FROM dbo.Team 
      WHERE Active = 1
      ORDER BY TeamName ASC
    `;
    
    const result = await pool.request().query(testQuery);
    console.log('📋 Teams data:');
    console.log(JSON.stringify(result.recordset, null, 2));
    
    await pool.close();
    console.log('✅ Test completed successfully');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('❌ Error details:', error.message);
  }
}

testTeams();
