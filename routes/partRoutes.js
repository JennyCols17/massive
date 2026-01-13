const express = require('express');
const router = express.Router();

// This tells the server what to show when someone goes to /cart
router.get('/', (req, res) => {
    res.render('cart', { title: 'Your Shopping Cart' });
});

module.exports = router;