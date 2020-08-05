const myShoppingCartModel = require("../../models/myShoppingCart");
const merchandiseModel = require("../../models/merchandise");
const userModel = require("../../models/user");
const jwt = require("jsonwebtoken");
const { emit } = require("../../app");

const showShoppingPage = (req, res) => {
    res.render("user/shopping");
}

const shoppingCart = (req, res) => {
    res.render("user/shoppingCart");
}
    
const showIcecream = (req, res) => {
    merchandiseModel.find((err, result) => {
        if (err) return res.status(500).end();
        var icecreams = [];
        result.forEach(icecream => {
            if (icecream.id.substr(0, 1) == 'I') {
                icecreams.push(icecream);
            }
        });
    res.render("merchandise/icecream", { icecreams });
    }).sort({ name: -1 });
}
    
const showDrink = (req, res) => {
    merchandiseModel.find((err, result) => {
        if (err) return res.status(500).end();
        var drinks = [];
        result.forEach(drink => {
            if (drink.id.substr(0, 1) == 'D') {
                drinks.push(drink);
            }
        });
        res.render("merchandise/drink", { drinks });
    }).sort({ name: -1 });
}
    
const showChocolate = (req, res) => {
    merchandiseModel.find((err, result) => {
        if (err) return res.status(500).end();
        var chocolates = [];
        result.forEach(chocolate => {
            if (chocolate.id.substr(0, 1) == 'C') {
                chocolates.push(chocolate);
            }
        });
        res.render("merchandise/chocolate", { chocolates });
    }).sort({ name: -1 });
}
    
const showSnack = (req, res) => {
    merchandiseModel.find((err, result) => {
        if (err) return res.status(500).end();
        var snacks = [];
        result.forEach(snack => {
            if (snack.id.substr(0, 1) == 'S') {
                snacks.push(snack);
            }
        });
        res.render("merchandise/snack", { snacks });
    }).sort({ name: -1 });
}

const updateShoppingCart = (req, res) => {
    const token = req.cookies.token;
    const { name, m_id, price } = req.body;

    merchandiseModel.findOne({ id: m_id }, (err, mer) => {
        if (err) return res.status(500).send("뭔데");
        mer.quantity--;
        mer.save((err) => {
            if (err) return res.status(500).send("상품 담기에 실패했습니다.");
        });
    });

    jwt.verify(token, "secretKey", (err, _id) => {
        myShoppingCartModel.findOne({ _id }, (err, cart) => {
            if (err) return res.status(500).send("등록 시 오류가 발생했습니다.!!!!!");
            if (!cart) return res.status(404).send("등록 시 오류가 발생했습니klkl다.");
            const time = new Date();
            cart.merchandise.push({ name, m_id, price, time: time.getTime() });
            cart.total += parseInt(price);
            cart.save((err, result) => {
                if (err) return res.status(500).send("등록 시 오류가 발생했습니다.@@@@@");
                return res.json(result);
            });
        });
    })
    
}

const deleteShoppingCart = (req, res) => {
    const { m_id, time, price } = req.body;
    const token = req.cookies.token;

    merchandiseModel.findOne({ id: m_id }, (err, result) => {
        result.quantity++;
        result.save(function (err) {
            if (err) return res.status(500).send("등록 시 오류가 발생했습니다.@@@@@");
        });
    });

    jwt.verify(token, "secretKey", (err, _id) => {
        myShoppingCartModel.findOne({ _id }, (err, cart) => {
            if (err) return res.status(500).send("삭제 시 오류가 발생했습니다wer.");
            if (!cart) return res.status(404).send("해당하는 정보가 없습니다.");
            cart.total -= parseInt(price);
            cart.merchandise.pull({ time });
            cart.save((err) => {
                if (err) return res.status(500).send("삭제 시 오류가 발생했습니다sdf.");
                return res.json(cart);
            });
        });
    });
}

const payment = (req, res, next) => {
    const barcode_id = req.params.id;
    console.log(barcode_id);
    userModel.findOne({ barcode_id }, (err, result) => {
        if (err) return res.status(500).send("삭제 시 오류가 발생했습니다.");
        if (!result) return res.status(404).send("해당하는 정보가 없습니다.");
        myShoppingCartModel.findOne({ id: result.id }, (err, cart) => {          
            cart.total = 0;
            console.log(cart.merchandise);
            cart.merchandise.pull({});
            cart.save(function (err) {
                if (err) return res.status(500).send("삭제 시 오류가 발생했습니다.");
                return res.status(200).send("완료");
            });
        });
    });
}

const local = (req, res, next) => {
    res.locals.cart = null;
    const token = req.cookies.token;
    jwt.verify(token, "secretKey", (err, _id) => {
        myShoppingCartModel.findOne({ _id }, (err, cart) => {
            if (err) return res.status(500).send("인증 오류가 발생했습니다.");
            if (!cart) next();
            else {
                res.locals.cart = { merchandise: cart.merchandise, total: cart.total };
                next();
            }
        });
    })

}


module.exports = { showShoppingPage, shoppingCart, showIcecream, showDrink, showChocolate, showSnack, updateShoppingCart, local, deleteShoppingCart, payment };