Object.keys(require.cache).forEach((k) => {
  if (k.includes('multi-business-marketplace')) delete require.cache[k];
});

const routeFiles = [
  'backend/src/routes/auth.routes.js',
  'backend/src/routes/admin.routes.js',
  'backend/src/routes/manager.routes.js',
  'backend/src/routes/vendor.routes.js',
  'backend/src/routes/vendor-public.routes.js',
  'backend/src/routes/customer.routes.js',
  'backend/src/routes/common.routes.js',
];

for (const f of routeFiles) {
  try {
    require('./' + f);
    console.log('OK', f);
  } catch (e) {
    console.log('FAIL', f, e.message);
  }
}
