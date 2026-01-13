const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { filterXSS } = require('xss'); // Modern protection
const db = require('./config/firebase');

dotenv.config();
const app = express();

// --- 1. SECURITY MIDDLEWARE ---

// Security Headers
app.use(helmet({ contentSecurityPolicy: false }));

// Rate Limiting: Prevents spam/DDoS
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: "Too many requests from this IP, please try again after 15 minutes."
});
app.use(limiter);

// Modern Sanitization Middleware
// This cleans user input to prevent script injection attacks
const sanitizeInput = (req, res, next) => {
    if (req.body) {
        for (let key in req.body) {
            if (typeof req.body[key] === 'string') req.body[key] = filterXSS(req.body[key]);
        }
    }
    if (req.query) {
        for (let key in req.query) {
            if (typeof req.query[key] === 'string') req.query[key] = filterXSS(req.query[key]);
        }
    }
    next();
};

// Body Parsers & Safety
app.use(cors());
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(sanitizeInput); // Apply the cleaner
app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- 2. ROUTES ---

app.get('/', (req, res) => res.render('home', { title: 'Home' }));

app.get('/about', (req, res) => res.render('about', { title: 'About Us' }));

app.get('/shop', async (req, res) => {
    try {
        const snapshot = await db.collection('parts').get();
        const parts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.render('shop', { title: 'Shop', parts });
    } catch (err) { 
        console.error("Firebase Error:", err); 
        res.status(500).send("Database error. Please contact support."); 
    }
});

app.get('/contact', (req, res) => res.render('contact', { title: 'Contact' }));
app.get('/cart', (req, res) => res.render('cart', { title: 'Cart' }));

// 404 Handler
app.use((req, res) => {
    res.status(404).render('home', { title: '404 - Not Found' });
});

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Motus Parts Secured & Running on: http://localhost:${PORT}`));