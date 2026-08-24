const db = require('../config/db');

const Product = {
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0] || null;
  },

  findByBusiness: async (businessId) => {
    const [rows] = await db.query(
      'SELECT * FROM products WHERE business_id = ? ORDER BY created_at DESC',
      [businessId]
    );
    return rows;
  },

  create: async (data) => {
    const [result] = await db.query(
      `INSERT INTO products
       (business_id, category_id, name, description, price, sale_price, stock, sku, status, delivery_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        data.businessId, data.categoryId, data.name, data.description,
        data.price, data.salePrice || null, data.stock || 0, data.sku || null,
        data.deliveryAvailable ? 1 : 0,
      ]
    );
    return result.insertId;
  },

  search: async ({
    query,
    categoryId,
    businessId,
    minPrice,
    maxPrice,
    sort = 'newest',
    limit = 20,
    offset = 0,
  }) => {
    let sql = `SELECT p.*, b.business_name, b.slug AS business_slug,
                      c.name AS category_name, c.slug AS category_slug,
                      (SELECT AVG(r.rating) FROM reviews r
                        WHERE r.business_id = b.id AND r.status = 'approved') AS avg_rating,
                      (SELECT pi.file_path FROM product_images pi
                        WHERE pi.product_id = p.id ORDER BY pi.sort_order ASC LIMIT 1) AS image_url
               FROM products p
               JOIN businesses b ON b.id = p.business_id
               LEFT JOIN categories c ON c.id = p.category_id
               WHERE p.status = 'published' AND b.status = 'approved'`;
    const params = [];
    if (query) {
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${query}%`, `%${query}%`);
    }
    if (categoryId) {
      sql += ' AND p.category_id = ?';
      params.push(categoryId);
    }
    if (businessId) {
      sql += ' AND p.business_id = ?';
      params.push(businessId);
    }
    if (minPrice != null) {
      sql += ' AND p.price >= ?';
      params.push(minPrice);
    }
    if (maxPrice != null) {
      sql += ' AND p.price <= ?';
      params.push(maxPrice);
    }

    const sortMap = {
      newest: 'p.created_at DESC',
      price_asc: 'COALESCE(p.sale_price, p.price) ASC',
      price_desc: 'COALESCE(p.sale_price, p.price) DESC',
      rating: 'avg_rating DESC',
      name: 'p.name ASC',
    };
    sql += ` ORDER BY ${sortMap[sort] || sortMap.newest}`;
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);
    const [rows] = await db.query(sql, params);
    return rows;
  },
};

module.exports = Product;
