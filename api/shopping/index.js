const express = require('express');
const router = express.Router();
const ctrl = require("./shopping.ctrl");

// 라우팅 설정
router.get("/showShopping", ctrl.showShoppingPage);
router.get("/shoppingCart", ctrl.shoppingCart);
router.get("/icecream", ctrl.showIcecream);
router.get("/drink", ctrl.showDrink);
router.get("/chocolate", ctrl.showChocolate);
router.get("/snack", ctrl.showSnack);
router.get("/payment/:id", ctrl.payment);
router.put("/shoppingCart", ctrl.updateShoppingCart);
router.delete("/shoppingCart", ctrl.deleteShoppingCart);

module.exports = router;