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

// Public routes (anyone can create member)
router.post('/', optionalAuth, createMember);

// Protected routes (require authentication)
router.get('/my-members', authenticateToken, getMembersByUserId);
router.get('/:id', authenticateToken, getMemberById);
router.put('/:id', authenticateToken, updateMember);

// Admin only routes
router.get('/', authenticateToken, requireAdmin, getAllMembers);
router.delete('/:id', authenticateToken, requireAdmin, deleteMember);
router.get('/admin/stats', authenticateToken, requireAdmin, getMemberStats);
router.get('/admin/export-excel', authenticateToken, requireAdmin, exportMembersToExcel);

module.exports = router;
