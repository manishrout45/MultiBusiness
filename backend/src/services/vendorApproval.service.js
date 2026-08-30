const db = require('../config/db');

async function logVendorApproval(payload) {
  try {
    await db.query(
      `INSERT INTO vendor_approvals
       (business_id, previous_status, new_status, action_by, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [payload.businessId, payload.previousStatus, payload.newStatus, payload.actionBy, payload.reason]
    );
  } catch {
    // Table may not exist on older databases until schema is migrated
  }
}

module.exports = { logVendorApproval };
