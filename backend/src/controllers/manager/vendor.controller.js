const db = require('../../config/db');
const { createNotification } = require('../../services/notification.service');

const listVendors = async (req, res, next) => {
  try {
    const status = req.query.status;
    let sql = `
      SELECT b.*,
             u.name AS owner_name,
             u.email AS owner_email,
             u.phone AS owner_phone,
             u.status AS owner_status,
             c.name AS category_name
      FROM businesses b
      JOIN users u ON u.id = b.owner_id
      LEFT JOIN categories c ON c.id = b.category_id
    `;
    const params = [];
    if (status) {
      sql += ' WHERE b.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY b.created_at DESC';
    const [rows] = await db.query(sql, params);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
};

const getVendor = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*,
              u.name AS owner_name,
              u.email AS owner_email,
              u.phone AS owner_phone,
              u.status AS owner_status,
              c.name AS category_name
       FROM businesses b
       JOIN users u ON u.id = b.owner_id
       LEFT JOIN categories c ON c.id = b.category_id
       WHERE b.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    const [documents] = await db.query(
      'SELECT * FROM business_documents WHERE business_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    res.json({ data: { ...rows[0], documents } });
  } catch (err) {
    next(err);
  }
};

const verifyDocuments = async (req, res, next) => {
  try {
    const businessId = req.params.id;
    const documentId = req.body.documentId ?? req.body.document_id;
    const status = req.body.status;

    if (!status || !['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'status must be pending, verified, or rejected',
      });
    }

    const [businessRows] = await db.query('SELECT * FROM businesses WHERE id = ?', [businessId]);
    if (!businessRows[0]) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (documentId) {
      const [docRows] = await db.query(
        'SELECT * FROM business_documents WHERE id = ? AND business_id = ?',
        [documentId, businessId]
      );
      if (!docRows[0]) {
        return res.status(404).json({ message: 'Document not found' });
      }
      await db.query('UPDATE business_documents SET status = ? WHERE id = ?', [
        status,
        documentId,
      ]);
    } else {
      await db.query('UPDATE business_documents SET status = ? WHERE business_id = ?', [
        status,
        businessId,
      ]);
    }

    const [documents] = await db.query(
      'SELECT * FROM business_documents WHERE business_id = ? ORDER BY created_at DESC',
      [businessId]
    );

    await createNotification({
      userId: businessRows[0].owner_id,
      title: 'Document verification update',
      message: `Your business documents were marked as ${status}.`,
      type: 'business',
      link: `/vendors/business`,
    });

    res.json({ message: 'Documents updated', data: documents });
  } catch (err) {
    next(err);
  }
};

const recommendApproval = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM businesses WHERE id = ?', [req.params.id]);
    if (!rows[0]) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    await db.query(
      `UPDATE businesses
       SET status = 'recommended', recommended_by = ?
       WHERE id = ?`,
      [req.user.id, req.params.id]
    );

    const [updated] = await db.query('SELECT * FROM businesses WHERE id = ?', [req.params.id]);

    await createNotification({
      userId: rows[0].owner_id,
      title: 'Business recommended for approval',
      message: `Your business "${rows[0].business_name}" has been recommended for approval.`,
      type: 'business',
      link: `/vendors/business`,
    });

    res.json({ message: 'Business recommended for approval', data: updated[0] });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listVendors,
  getVendor,
  verifyDocuments,
  recommendApproval,
};
