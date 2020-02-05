exports.getPageNotFound = (req, res, next) => {
  const { isLoggedIn } = req.session;
  res.status(404).render('404', { isLoggedIn, pageTitle: 'Page Not Found' });
};
