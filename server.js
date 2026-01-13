const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { filterXSS } = require('xss'); 
const db = require('./config/firebase');

dotenv.config();
const app = express();

// --- 1. SECURITY MIDDLEWARE ---
app.use(helmet({ contentSecurityPolicy: false }));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: "Too many requests from this IP, please try again after 15 minutes."
});
app.use(limiter);

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

app.use(cors());
app.use(express.json({ limit: '10kb' })); 
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(sanitizeInput); 
app.use(express.static(path.join(__dirname, 'public')));

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

// --- ADDED SEARCH ROUTE ---
app.get('/search', async (req, res) => {
    const searchTerm = req.query.q ? req.query.q.toLowerCase() : "";
    try {
        const snapshot = await db.collection('parts').get();
        let filteredParts = [];
        snapshot.forEach(doc => {
            const part = doc.data();
            if (part.name.toLowerCase().includes(searchTerm) || part.category.toLowerCase().includes(searchTerm)) {
                filteredParts.push({ id: doc.id, ...part });
            }
        });
        res.render('shop', { title: `Results for "${req.query.q}"`, parts: filteredParts });
    } catch (err) {
        console.error("Search Error:", err);
        res.status(500).send("Database error during search.");
    }
});

app.get('/contact', (req, res) => res.render('contact', { title: 'Contact' }));
app.get('/cart', (req, res) => res.render('cart', { title: 'Cart' }));

app.use((req, res) => {
    res.status(404).render('home', { title: '404 - Not Found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Motus Parts Secured & Running on: http://localhost:${PORT}`));