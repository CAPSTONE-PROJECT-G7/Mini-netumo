const { Router } = require('express');
const asyncHandler = require('express-async-handler');
const { Target } = require('../models');

const r = Router();

// GET /targets  — list user’s monitors
r.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = await Target.findAll({ where: { user_id: req.user.id } });
    res.json(rows);
  })
);

// POST /targets  — create new monitor
r.post(
  '/',
  asyncHandler(async (req, res) => {
    const { url, label } = req.body;
    const t = await Target.create({ user_id: req.user.id, url, label });
    res.status(201).json(t);
  })
);

// PATCH /targets/:id  — pause/resume
r.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const t = await Target.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!t) return res.sendStatus(404);
    t.paused = req.body.paused ?? t.paused;
    await t.save();
    res.json(t);
  })
);

// DELETE /targets/:id
r.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const rows = await Target.destroy({ where: { id: req.params.id, user_id: req.user.id } });
    res.sendStatus(rows ? 204 : 404);
  })
);

module.exports = r;
