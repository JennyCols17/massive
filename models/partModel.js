const { db } = require('../config/firebase');

const partsCollection = db.collection('parts');

const Part = {
    // Function to add a new part
    create: async (data) => {
        return await partsCollection.add({
            name: data.name,
            price: data.price,
            stock: data.stock,
            createdAt: new Date()
        });
    },
    // Function to get all parts
    getAll: async () => {
        const snapshot = await partsCollection.get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};

module.exports = Part;