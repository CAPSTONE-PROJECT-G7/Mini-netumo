const { Router }      = require('express');
const asyncHandler    = require('express-async-handler');
const {
  Target, Check, CertStatus, DomainStatus
} = require('../models');

const r = Router();

/* GET /targets  – enriched list */
r.get(
  '/',
  asyncHandler(async (req, res) => {
    const targets = await Target.findAll({
      where: { user_id: req.user.id },
      attributes: ['id', 'label', 'url', 'paused'],
      include: [
        { model: Check,        separate: true, limit: 1, order:[['created_at','DESC']] },
        { model: CertStatus,   separate: true, limit: 1, order:[['created_at','DESC']] },
        { model: DomainStatus, separate: true, limit: 1, order:[['created_at','DESC']] }
      ]
    });

    const payload = targets.map(t => {
      const chk   = t.Checks       [0];
      const cert  = t.CertStatuses [0];
      const dom   = t.DomainStatuses[0];

      return {
        id: t.id,
        label: t.label,
        url: t.url,
        paused: t.paused,
        isUp: chk ? chk.status_code >= 200 && chk.status_code < 400 : null,
        latency: chk?.latency_ms ?? null,
        daysCert: cert?.days_to_expiry ?? null,
        daysDomain: dom?.days_to_expiry ?? null
      };
    });

    res.json(payload);
  })
);

/* POST /targets – create */
r.post(
  '/',
  asyncHandler(async (req, res) => {
    const { url, label } = req.body;
    const t = await Target.create({ user_id: req.user.id, url, label });
    res.status(201).json(t);
  })
);

/* PATCH /targets/:id – pause/resume */
r.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const t = await Target.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });
    if (!t) return res.sendStatus(404);
    t.paused = req.body.paused ?? !t.paused;
    await t.save();
    res.json(t);
  })
);

/* DELETE /targets/:id */
r.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const rows = await Target.destroy({
      where: { id: req.params.id, user_id: req.user.id }
    });
    res.sendStatus(rows ? 204 : 404);
  })
);

module.exports = r;
