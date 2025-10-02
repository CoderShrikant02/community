const express = require('express');
const router = express.Router();
const {
  getAllMembers,
  getMemberById,
  getMembersByUserId,
  createMember,
  updateMember,
  deleteMember,
  getMemberStats,
  exportMembersToExcel
} = require('../controllers/memberController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Public routes (anyone can create member with image)
router.post('/', upload.single('profile_image'), optionalAuth, createMember);

// Protected routes (require authentication) - Allow all authenticated users to view
router.get('/', authenticateToken, getAllMembers); // Changed from requireAdmin to authenticateToken
router.get('/my-members', authenticateToken, getMembersByUserId);
router.get('/:id', authenticateToken, getMemberById);
router.put('/:id', authenticateToken, updateMember);

// Admin only routes
router.delete('/:id', authenticateToken, requireAdmin, deleteMember);
router.get('/admin/stats', authenticateToken, requireAdmin, getMemberStats);
router.get('/admin/export-excel', authenticateToken, requireAdmin, exportMembersToExcel);

module.exports = router;
