const mongoose = require("mongoose");

const merchandiseSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
    },
    id: {
        type: String,
        trim: true,
    },
    quantity: {
        type: Number,
    },
    price: {
        type: Number,
    },
});

const Merchandise = mongoose.model("merchandise", merchandiseSchema);
module.exports = Merchandise;