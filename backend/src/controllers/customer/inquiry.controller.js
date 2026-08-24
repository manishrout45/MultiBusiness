const db = require('../../config/db');
const { createNotification } = require('../../services/notification.service');
const { getSetting, recordLeadCharge } = require('../../services/monetization.service');

const createInquiry = async (req, res, next) => {
  try {
    const businessId = Number(req.body.businessId);
    const productId = req.body.productId != null ? Number(req.body.productId) : null;
    const { name, email, phone, message } = req.body;

    if (!businessId) {
      return res.status(400).json({ message: 'businessId is required' });
    }
    if (!message) {
      return res.status(400).json({ message: 'message is required' });
    }

    const [businessRows] = await db.query(
      'SELECT id, owner_id, business_name FROM businesses WHERE id = ?',
      [businessId]
    );
    if (!businessRows[0]) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (productId) {
      const [productRows] = await db.query(
        'SELECT id FROM products WHERE id = ? AND business_id = ?',
        [productId, businessId]
      );
      if (!productRows[0]) {
        return res.status(404).json({ message: 'Product not found for this business' });
      }
    }

    const [result] = await db.query(
      `INSERT INTO inquiries
       (business_id, customer_id, product_id, name, email, phone, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'new')`,
      [
        businessId,
        req.user.id,
        productId,
        name || null,
        email || null,
        phone || null,
        message,
      ]
    );

    const leadFee = Number(await getSetting('lead_fee', '50')) || 50;
    const chargeId = await recordLeadCharge({
      businessId,
      inquiryId: result.insertId,
      amount: leadFee,
    });

    await createNotification({
      userId: businessRows[0].owner_id,
      title: 'New customer inquiry',
      message: `New lead for ${businessRows[0].business_name}. Lead fee ₹${leadFee} recorded.`,
      type: 'inquiry',
      link: '/vendor/inquiries',
    });

    const [rows] = await db.query('SELECT * FROM inquiries WHERE id = ?', [result.insertId]);
    res.status(201).json({
      message: 'Inquiry submitted',
      data: rows[0],
      leadCharge: { id: chargeId, amount: leadFee, status: 'pending' },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createInquiry,
};
