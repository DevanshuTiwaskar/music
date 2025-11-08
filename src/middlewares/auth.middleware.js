import jwt from 'jsonwebtoken';
import config from '../config/config.js';

// ✅ NEW MIDDLEWARE: Checks for ANY logged-in user
export async function authMiddleware(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded; // Attach user info to the request
        next(); // User is logged in, proceed to the controller
    }
    catch (err) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
}


// This middleware is still perfect for artist-only routes
export async function authArtistMiddleware(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);

        if (decoded.role !== 'artist') {
            return res.status(403).json({ message: 'Forbidden: Artist role required' });
        }

        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}