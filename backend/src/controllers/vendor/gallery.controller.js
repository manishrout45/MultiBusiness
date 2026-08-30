const db = require('../../config/db');
const Business = require('../../models/Business');
const { getUploadedFileUrl } = require('../../middleware/upload');

const listGallery = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const [rows] = await db.query(
      'SELECT * FROM business_gallery WHERE business_id = ? ORDER BY created_at DESC',
      [business.id]
    );
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const addMedia = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const filePath =
      getUploadedFileUrl(req.file) ||
      req.body.file_path ||
      req.body.filePath ||
      req.body.path;
    if (!filePath) {
      return res.status(400).json({ message: 'Media file or path is required' });
    }

    const mediaType = req.body.media_type || req.body.mediaType || 'image';
    const caption = req.body.caption || null;

    const [result] = await db.query(
      `INSERT INTO business_gallery (business_id, media_type, file_path, caption)
       VALUES (?, ?, ?, ?)`,
      [business.id, mediaType, filePath, caption]
    );

    const [rows] = await db.query('SELECT * FROM business_gallery WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: 'Media added', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

const deleteMedia = async (req, res, next) => {
  try {
    const business = await Business.findByOwner(req.user.id);
    if (!business) {
      return res.status(404).json({ message: 'Business profile not found' });
    }

    const [rows] = await db.query(
      'SELECT * FROM business_gallery WHERE id = ? AND business_id = ?',
      [req.params.id, business.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Media not found' });
    }

    await db.query('DELETE FROM business_gallery WHERE id = ?', [req.params.id]);
    res.json({ message: 'Media deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listGallery,
  addMedia,
  deleteMedia,
};
