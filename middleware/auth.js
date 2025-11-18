export const verifyAdminPassword = (req, res, next) => {
  const { adminPassword } = req.body;
  
  if (adminPassword === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.status(403).render('error', {
      title: 'Unauthorized',
      message: 'Invalid admin password. Access denied.',
      error: { status: 403 }
    });
  }
};

