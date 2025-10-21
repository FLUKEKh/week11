const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const authService = require('../services/authService');
const Agent = require('../models/Agent');
const { transformAgent, transformAgents } = require('../utils/transformers');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';

/* ========================================
   🔹 1) Simple Login (ใช้ username เดียว)
   ======================================== */
router.post(
  '/login/simple',
  body('username')
    .notEmpty().withMessage('Username is required')
    .matches(/^(AG|SP|AD)(00[1-9]|0[1-9]\d|[1-9]\d{2})$/)
    .withMessage('Invalid username format'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { username } = req.body;
      const result = await authService.loginWithoutPassword(username);

      res.status(200).json(result);
    } catch (error) {
      console.error('Login error:', error);

      let statusCode = 500;
      if (error.message === 'Invalid username') statusCode = 401;
      else if (error.message === 'User account is inactive') statusCode = 403;

      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
);

/* ========================================
   🔹 2) Secure Login (ใช้ Agent/Supervisor)
   ======================================== */
router.post('/login/secure', async (req, res) => {
  try {
    const { agentCode, supervisorCode } = req.body;

    const code = (agentCode || supervisorCode || '').toUpperCase();
    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Agent code or Supervisor code is required'
      });
    }

    // Find user
    const user = await Agent.findByCode(code);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // For supervisors, get team members
    let teamData = null;
    if (user.role === 'supervisor') {
      const rawTeamData = await Agent.findByTeam(user.team_id);
      teamData = transformAgents(rawTeamData);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        agentCode: user.agent_code,
        role: user.role,
        teamId: user.team_id
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Response
    res.json({
      success: true,
      data: {
        user: transformAgent(user),
        teamData,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/* ========================================
   🔹 3) Logout (ใช้ร่วมกันได้)
   ======================================== */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

module.exports = router;
