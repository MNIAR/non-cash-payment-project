const mongoose = require("mongoose");

const myShoppingCartSchema = new mongoose.Schema({
    merchandise: [new mongoose.Schema({
        name: String,
        m_id: String,
        price: Number,
        time: String,
    },
    {_id: false})],
    id: {
        type: String,
        trim: true, 
        unique: true,
    },
    total: {
        type: Number,
    }
});

const MyShoppingCart = mongoose.model("msc", myShoppingCartSchema);
module.exports = MyShoppingCart;