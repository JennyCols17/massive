const { db } = require('../config/firebase');

exports.createPart = async (req, res) => {
    try {
        const { name, price, stock } = req.body;

        // Basic validation
        if (!name || !price) {
            return res.status(400).json({ error: "Name and Price are required" });
        }

        const newPart = {
            name,
            price: Number(price),
            stock: Number(stock) || 0,
            createdAt: new Date().toISOString()
        };

        // Add to Firestore collection named "parts"
        const docRef = await db.collection('parts').add(newPart);

        res.status(201).json({
            message: "Part added successfully!",
            id: docRef.id
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};