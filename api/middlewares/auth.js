import jwt from 'jsonwebtoken';

export function isAuthenticated(role) {
  return function (req, res, next) {
    const token = req.header('Authorization');
    if (!token) {
      return res.redirect('/users/login');
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      
      // Student access - anyone authenticated can access
      if (role === 'student') {
        req.user = decoded;
        return next();
      }

      // Lab Technician access - Lab Technician or Admin can access
      if (role === 'Lab Technician' && (decoded.role === 'Lab Technician' || decoded.role === 'Admin')) {
        req.user = decoded;
        return next();
      }

      // Admin access - only Admin can access
      if (role === 'Admin' && decoded.role === 'Admin') {
        req.user = decoded;
        return next();
      }

      // If none of the above conditions matched
      return res.redirect('/users/login');
      //return res.status(403).json({ error: 'Access Denied!!!' });

    } catch (error) {
      return res.redirect('/users/login');
    }
  }
}