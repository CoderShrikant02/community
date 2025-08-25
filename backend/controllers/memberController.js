const { pool } = require('../config/database');
const XLSX = require('xlsx');

// Get all members (admin only)
const getAllMembers = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT m.*, u.full_name as user_full_name, u.email as user_email 
      FROM members m 
      LEFT JOIN users u ON m.user_id = u.user_id 
      ORDER BY m.created_at DESC
    `);
    
    res.json({
      success: true,
      message: 'Members retrieved successfully',
      data: rows,
      total: rows.length
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch members',
      error: error.message
    });
  }
};

// Get member by ID
const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(`
      SELECT m.*, u.full_name as user_full_name, u.email as user_email 
      FROM members m 
      LEFT JOIN users u ON m.user_id = u.user_id 
      WHERE m.id = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Member retrieved successfully',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch member',
      error: error.message
    });
  }
};

// Get members by user ID
const getMembersByUserId = async (req, res) => {
  try {
    const userId = req.user.user_id; // From auth middleware
    
    const [rows] = await pool.execute(`
      SELECT * FROM members WHERE user_id = ? ORDER BY created_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      message: 'User members retrieved successfully',
      data: rows
    });
  } catch (error) {
    console.error('Error fetching user members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user members',
      error: error.message
    });
  }
};

// Create new member
const createMember = async (req, res) => {
  try {
    const userId = req.user ? req.user.user_id : null; // Optional for guests
    
    const {
      family_share,
      name,
      address,
      email,
      mobile_no,
      service_address,
      current_city,
      current_state,
      current_address,
      age,
      swa_gotra,
      mame_gotra,
      home_town_address,
      qualification,
      specialization,
      other_info
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }
    }

    // Validate age if provided
    if (age && (age < 0 || age > 150)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid age'
      });
    }

    // Convert undefined values to null for database
    const cleanData = {
      user_id: userId || null,
      family_share: family_share || null,
      name: name || null,
      address: address || null,
      email: email || null,
      mobile_no: mobile_no || null,
      service_address: service_address || null,
      current_city: current_city || null,
      current_state: current_state || null,
      current_address: current_address || null,
      age: age ? parseInt(age) : null,
      swa_gotra: swa_gotra || null,
      mame_gotra: mame_gotra || null,
      home_town_address: home_town_address || null,
      qualification: qualification || null,
      specialization: specialization || null,
      other_info: other_info || null
    };

    const [result] = await pool.execute(`
      INSERT INTO members (
        user_id, family_share, name, address, email, mobile_no, 
        service_address, current_city, current_state, current_address, 
        age, swa_gotra, mame_gotra, home_town_address, qualification, 
        specialization, other_info
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      cleanData.user_id, cleanData.family_share, cleanData.name, cleanData.address, 
      cleanData.email, cleanData.mobile_no, cleanData.service_address, cleanData.current_city, 
      cleanData.current_state, cleanData.current_address, cleanData.age, cleanData.swa_gotra, 
      cleanData.mame_gotra, cleanData.home_town_address, cleanData.qualification,
      cleanData.specialization, cleanData.other_info
    ]);

    // Get the created member
    const [newMember] = await pool.execute(
      'SELECT * FROM members WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: newMember[0]
    });
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create member',
      error: error.message
    });
  }
};

// Update member
const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const userRole = req.user.role;
    
    // Check if member exists and user has permission
    const [existingMember] = await pool.execute(
      'SELECT * FROM members WHERE id = ?',
      [id]
    );
    
    if (existingMember.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    // Only admin or the user who created the member can update
    if (userRole !== 'admin' && existingMember[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    const {
      family_share,
      name,
      address,
      email,
      mobile_no,
      service_address,
      current_city,
      current_state,
      current_address,
      age,
      swa_gotra,
      mame_gotra,
      home_town_address,
      qualification,
      specialization,
      other_info
    } = req.body;

    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }
    }

    // Convert undefined values to null for database
    const cleanData = {
      family_share: family_share || null,
      name: name || null,
      address: address || null,
      email: email || null,
      mobile_no: mobile_no || null,
      service_address: service_address || null,
      current_city: current_city || null,
      current_state: current_state || null,
      current_address: current_address || null,
      age: age ? parseInt(age) : null,
      swa_gotra: swa_gotra || null,
      mame_gotra: mame_gotra || null,
      home_town_address: home_town_address || null,
      qualification: qualification || null,
      specialization: specialization || null,
      other_info: other_info || null
    };

    await pool.execute(`
      UPDATE members SET 
        family_share = ?, name = ?, address = ?, email = ?, mobile_no = ?,
        service_address = ?, current_city = ?, current_state = ?, current_address = ?,
        age = ?, swa_gotra = ?, mame_gotra = ?, home_town_address = ?,
        qualification = ?, specialization = ?, other_info = ?
      WHERE id = ?
    `, [
      cleanData.family_share, cleanData.name, cleanData.address, cleanData.email, cleanData.mobile_no,
      cleanData.service_address, cleanData.current_city, cleanData.current_state, cleanData.current_address,
      cleanData.age, cleanData.swa_gotra, cleanData.mame_gotra, cleanData.home_town_address,
      cleanData.qualification, cleanData.specialization, cleanData.other_info, id
    ]);

    // Get updated member
    const [updatedMember] = await pool.execute(
      'SELECT * FROM members WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Member updated successfully',
      data: updatedMember[0]
    });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update member',
      error: error.message
    });
  }
};

// Delete member (admin only)
const deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM members WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Member deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete member',
      error: error.message
    });
  }
};

// Get member statistics (admin only)
const getMemberStats = async (req, res) => {
  try {
    // Total members
    const [totalResult] = await pool.execute('SELECT COUNT(*) as total FROM members');
    
    // Members by city
    const [cityResult] = await pool.execute(`
      SELECT current_city, COUNT(*) as count 
      FROM members 
      WHERE current_city IS NOT NULL AND current_city != ''
      GROUP BY current_city 
      ORDER BY count DESC 
      LIMIT 10
    `);
    
    // Recent members (last 30 days)
    const [recentResult] = await pool.execute(`
      SELECT COUNT(*) as recent 
      FROM members 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `);
    
    // Members by age group
    const [ageResult] = await pool.execute(`
      SELECT 
        CASE 
          WHEN age < 18 THEN 'Under 18'
          WHEN age BETWEEN 18 AND 30 THEN '18-30'
          WHEN age BETWEEN 31 AND 50 THEN '31-50'
          WHEN age BETWEEN 51 AND 70 THEN '51-70'
          WHEN age > 70 THEN 'Over 70'
          ELSE 'Unknown'
        END as age_group,
        COUNT(*) as count
      FROM members
      GROUP BY age_group
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      message: 'Member statistics retrieved successfully',
      data: {
        total: totalResult[0].total,
        recent: recentResult[0].recent,
        byCity: cityResult,
        byAgeGroup: ageResult
      }
    });
  } catch (error) {
    console.error('Error fetching member stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch member statistics',
      error: error.message
    });
  }
};

// Export members to Excel
const exportMembersToExcel = async (req, res) => {
  try {
    // Fetch all members with user details
    const [rows] = await pool.execute(`
      SELECT 
        m.id,
        m.user_id,
        m.family_share,
        m.name,
        m.address,
        m.email,
        m.mobile_no,
        m.service_address,
        m.current_city,
        m.current_state,
        m.current_address,
        m.age,
        m.swa_gotra,
        m.mame_gotra,
        m.home_town_address,
        m.qualification,
        m.specialization,
        m.other_info,
        m.created_at,
        u.full_name as submitted_by_name,
        u.email as submitted_by_email
      FROM members m 
      LEFT JOIN users u ON m.user_id = u.user_id 
      ORDER BY m.created_at DESC
    `);

    // Format data for Excel
    const excelData = rows.map(member => ({
      'Member ID': member.id,
      'User ID': member.user_id || '',
      'Family Share': member.family_share || '',
      'Name': member.name || '',
      'Address': member.address || '',
      'Email': member.email || '',
      'Mobile Number': member.mobile_no || '',
      'Service Address': member.service_address || '',
      'Current City': member.current_city || '',
      'Current State': member.current_state || '',
      'Current Address': member.current_address || '',
      'Age': member.age || '',
      'Swa Gotra': member.swa_gotra || '',
      'Mame Gotra': member.mame_gotra || '',
      'Home Town Address': member.home_town_address || '',
      'Qualification': member.qualification || '',
      'Specialization': member.specialization || '',
      'Other Info': member.other_info || '',
      'Submission Date': new Date(member.created_at).toLocaleDateString(),
      'Submitted By': member.submitted_by_name || '',
      'Submitted By Email': member.submitted_by_email || ''
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Auto-size columns
    const colWidths = [];
    const headers = Object.keys(excelData[0] || {});
    headers.forEach((header, index) => {
      const maxLength = Math.max(
        header.length,
        ...excelData.map(row => String(row[header] || '').length)
      );
      colWidths[index] = { width: Math.min(Math.max(maxLength + 2, 10), 50) };
    });
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members Data');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers
    const fileName = `members_data_${new Date().toISOString().split('T')[0]}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', buffer.length);

    // Send file
    res.send(buffer);

  } catch (error) {
    console.error('Error exporting members to Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export members data',
      error: error.message
    });
  }
};

module.exports = {
  getAllMembers,
  getMemberById,
  getMembersByUserId,
  createMember,
  updateMember,
  deleteMember,
  getMemberStats,
  exportMembersToExcel
};
