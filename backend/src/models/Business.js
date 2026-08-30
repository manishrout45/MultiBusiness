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
    let sql = `SELECT b.*,
                      c.name AS category_name,
                      c.slug AS category_slug,
                      (SELECT AVG(r.rating) FROM reviews r
                        WHERE r.business_id = b.id AND r.status = 'approved') AS avg_rating,
                      (SELECT COUNT(*) FROM reviews r
                        WHERE r.business_id = b.id AND r.status = 'approved') AS review_count,
                      (SELECT COUNT(*) FROM products p
                        WHERE p.business_id = b.id AND p.status = 'published') AS product_count
               FROM businesses b
               LEFT JOIN categories c ON c.id = b.category_id
               WHERE b.status = 'approved'`;
    const params = [];
    if (query) {
      sql += ' AND (b.business_name LIKE ? OR b.description LIKE ? OR b.business_type LIKE ?)';
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }
    if (categoryId) {
      sql += ' AND b.category_id = ?';
      params.push(categoryId);
    }
    if (city) {
      sql += ' AND b.city LIKE ?';
      params.push(`%${city}%`);
    }
    sql += ' ORDER BY b.is_featured DESC, avg_rating DESC, b.updated_at DESC';
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const [rows] = await db.query(sql, params);
    return rows;
  },
};

module.exports = Business;
