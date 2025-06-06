const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const { Alert } = require('../models');

const r = Router();

// GET /alerts  — list alerts for logged-in user
r.get(
  '/',
  asyncHandler(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');

    const rows = await Alert.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 100
    });
    res.json(rows);
  })
);

module.exports = r;
