const db = require('../config/db');

const Business = {
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM businesses WHERE id = ?', [id]);
    return rows[0] || null;
  },

  findByOwner: async (ownerId) => {
    const [rows] = await db.query('SELECT * FROM businesses WHERE owner_id = ?', [ownerId]);
    return rows[0] || null;
  },

  create: async (data) => {
    const workingHours = data.workingHours == null
      ? null
      : (typeof data.workingHours === 'string' ? data.workingHours : JSON.stringify(data.workingHours));
    const [result] = await db.query(
      `INSERT INTO businesses
       (owner_id, business_name, business_type, category_id, description, address, city, state,
        pincode, phone, whatsapp, email, website, gst_number, latitude, longitude,
        facebook_url, instagram_url, linkedin_url, youtube_url, twitter_url, working_hours, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        data.ownerId, data.businessName, data.businessType, data.categoryId || null,
        data.description || null, data.address, data.city, data.state || null, data.pincode || null,
        data.phone, data.whatsapp || null, data.email || null, data.website || null,
        data.gstNumber || null, data.latitude || null, data.longitude || null,
        data.facebookUrl || null, data.instagramUrl || null, data.linkedinUrl || null,
        data.youtubeUrl || null, data.twitterUrl || null, workingHours,
      ]
    );
    return result.insertId;
  },

  update: async (id, data) => {
    const workingHours = data.workingHours == null
      ? null
      : (typeof data.workingHours === 'string' ? data.workingHours : JSON.stringify(data.workingHours));
    await db.query(
      `UPDATE businesses SET
        business_name = ?, business_type = ?, category_id = ?, description = ?,
        address = ?, city = ?, state = ?, pincode = ?, phone = ?, whatsapp = ?,
        email = ?, website = ?, gst_number = ?, latitude = ?, longitude = ?,
        facebook_url = ?, instagram_url = ?, linkedin_url = ?, youtube_url = ?,
        twitter_url = ?, working_hours = ?
       WHERE id = ?`,
      [
        data.businessName, data.businessType, data.categoryId || null,
        data.description || null, data.address, data.city, data.state || null, data.pincode || null,
        data.phone, data.whatsapp || null, data.email || null, data.website || null,
        data.gstNumber || null, data.latitude || null, data.longitude || null,
        data.facebookUrl || null, data.instagramUrl || null, data.linkedinUrl || null,
        data.youtubeUrl || null, data.twitterUrl || null, workingHours, id,
      ]
    );
  },

  updateStatus: async (id, status) => {
    await db.query('UPDATE businesses SET status = ? WHERE id = ?', [status, id]);
  },

  search: async ({ query, categoryId, city, limit = 20, offset = 0 }) => {
    let sql = `SELECT * FROM businesses WHERE status = 'approved'`;
    const params = [];
    if (query) {
      sql += ' AND (business_name LIKE ? OR description LIKE ?)';
      params.push(`%${query}%`, `%${query}%`);
    }
    if (categoryId) {
      sql += ' AND category_id = ?';
      params.push(categoryId);
    }
    if (city) {
      sql += ' AND city = ?';
      params.push(city);
    }
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const [rows] = await db.query(sql, params);
    return rows;
  },
};

module.exports = Business;
