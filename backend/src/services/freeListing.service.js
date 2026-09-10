const db = require('../config/db');
const { getSetting } = require('./monetization.service');

const FREE_PLAN_SLUG = 'free';

const getQuota = async () => {
  const raw = await getSetting('free_listing_quota', '20');
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 20;
};

const countUsedFreeSpots = async () => {
  const [rows] = await db.query(
    `SELECT COUNT(DISTINCT bs.business_id) AS used
     FROM business_subscriptions bs
     JOIN subscription_plans sp ON sp.id = bs.plan_id
     JOIN businesses b ON b.id = bs.business_id
     WHERE bs.status = 'active'
       AND b.status = 'approved'
       AND (sp.slug = ? OR (sp.monthly_fee <= 0 AND sp.yearly_fee <= 0))`,
    [FREE_PLAN_SLUG]
  );
  return Number(rows[0]?.used || 0);
};

const getFreeListingStatus = async () => {
  const quota = await getQuota();
  const used = await countUsedFreeSpots();
  const spotsLeft = Math.max(0, quota - used);
  return {
    quota,
    used,
    spotsLeft,
    available: spotsLeft > 0,
    planSlug: FREE_PLAN_SLUG,
  };
};

const assertFreeSpotAvailable = async (plan) => {
  const isFree =
    plan &&
    (plan.slug === FREE_PLAN_SLUG ||
      (Number(plan.monthly_fee || 0) <= 0 && Number(plan.yearly_fee || 0) <= 0));
  if (!isFree) return;

  const status = await getFreeListingStatus();
  if (!status.available) {
    const err = new Error(
      `Free listing spots are full (${status.used}/${status.quota}). Choose a paid plan or ask admin to increase the quota.`
    );
    err.statusCode = 403;
    err.code = 'FREE_LISTING_FULL';
    err.freeListing = status;
    throw err;
  }
};

const ensureFreePlan = async () => {
  await db.query(
    `INSERT INTO subscription_plans (name, slug, monthly_fee, yearly_fee, features, max_products, is_active)
     SELECT 'Free Listing', 'free', 0, 0,
            '["Digital storefront","Limited product listings","Community support"]',
            15, 1
     WHERE NOT EXISTS (SELECT 1 FROM subscription_plans WHERE slug = 'free')`
  );
};

module.exports = {
  FREE_PLAN_SLUG,
  getQuota,
  countUsedFreeSpots,
  getFreeListingStatus,
  assertFreeSpotAvailable,
  ensureFreePlan,
};
