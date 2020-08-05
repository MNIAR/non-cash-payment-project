const UserModel = require("../../models/user");
const myShoppingCartModel = require("../../models/myShoppingCart");
const merchandiseModel = require("../../models/merchandise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const showSignupPage = (req, res) => {
    res.render("user/signup");
}

const showLoginPage = (req, res) => {
    res.render("user/login");
}

// 회원가입
// - 성공 : 201 응답 (Created), 생성된 User 객체 반환
// - 실패 : 필수입력값이 누락된 경우 400 (Bad Request)
//          email이 중복된 경우 409 (Conflict)

const signup = (req, res) => {
    const { name, student_id, id, password } = req.body;
    if (!name || !student_id || !id || !password)
        return res.status(400).send("필수값이 입력되지 않았습니다.");
    UserModel.findOne({ id }, (err, result) => {
        if (err) return res.status(500).send("사용자 조회 시 오류가 발생했습니다.");
        if (result) return res.status(409).send("이미 사용중인 아이디입니다.");
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) return res.status(500).send("암호화 시 오류가 발생했습니다.");
            const user = new UserModel({ name, student_id, id, password: hash });
            user.save((err, result) => {
                if (err) return res.status(500).send("사용자 등록 시 오류가 발생했습니다.");
                createCart(req, res);
                res.status(201).json(result);
            });
        });
    });
};

const createCart = (req, res) => {
    const { id } = req.body;
    UserModel.findOne({ id }, (err, user) => {
        const cart = new myShoppingCartModel({ _id: user._id, id, total: 0, });
        cart.save((err, result) => {
            if (err) {
                UserModel.findByIdAndDelete(id);
                return res.status(500).send("회원가입 중 오류가 발생했습니다.");
            }
        })
    })
}

// 로그인
// - 성공 : email, password가 일치하면 200 리턴
// - 실패 : email, password가 미입력된 경우 400 리턴
//          없는 email인 경우 404 리턴
//          password 일치하지 않는 경우 500 리턴
const login = (req, res) => {
    const { id, password } = req.body;
    if (!id || !password)
        return res.status(400).send("필수값이 입력되지 않았습니다.");
    UserModel.findOne({ id }, (err, user) => {
        myShoppingCartModel.findOne({ id }, (err, cart) => {
            if (err) return res.status(500).send("로그인 시 오류가 발생했습니다.");
            if (!user) return res.status(404).send("가입되지 않은 계정입니다.");
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) return res.status(500).send("로그인 시 오류가 발생했습니다.");
                if (!isMatch) return res.status(400).send("비밀번호가 잘못되었습니다.");

                // 비밀번호까지 맞다면 token 발급 (jsonwebtoken) - token : 이용권리
                const token = jwt.sign(user._id.toHexString(), "secretKey");
                UserModel.findByIdAndUpdate(user._id, { token }, (err, result) => {
                    if (err) return res.status(500).send("로그인 시 오류가 발생했습니다.");
                    res.cookie("token", token, { httpOnly: true });
                    res.json(result);
                });
            });
        });
    });
};

// 인증처리
const checkAuth = (req, res, next) => {

    // 공통적으로 사용되는 data
    res.locals.user = null;

    // 쿠키에서 토큰을 가져옴
    const token = req.cookies.token;
    const barcode_id = req.params.id;
    if (!token) {
        // 정상적인 경우 - 로그인 전 접근 가능
        if (req.url === "/" ||
            req.url === "/api/user/signup" ||
            req.url === "/api/user/login" || 
            (req.url).substr(0, 21) === "/api/shopping/payment" ) {
            return next();
        }
        // 비정상적인 경우 - 로그인 전 접근 불가
        else {
            return res.render("user/login");
        }
    }
    // token값을 verify
    jwt.verify(token, "secretKey", (err, _id) => {
        if (err) {
            res.clearCookie("token");
            return res.render("user/login");
        }
        UserModel.findOne({ _id, token }, (err, user) => {
            if (err) return res.status(500).send("인증 오류가 발생했습니다.");
            if (!user) return res.render("user/login");
            res.locals.user = { name: user.name, id: user.id, student_id: user.student_id, barcode_id: user.barcode_id, account_name: user.account_name, account_Number: user.account_Number };
            next();
        });
    });
}



// 로그아웃
const logout = (req, res) => {
    const token = req.cookies.token;

    jwt.verify(token, "secretKey", (err, _id) => {
        myShoppingCartModel.findOne({ _id }, (err, result) => {
            if (err) return res.status(500).send("삭제 시 오류가 발생했습니다wer.");
            if (!result) return res.status(404).send("해당하는 정보가 없습니다.");
            (result.merchandise).forEach(m => {
                merchandiseModel.findOne({ id: m.m_id }, (err, merchan) => {
                    if (err) return res.status(500).send("삭제 시 오류가 발생했습니다.");
                    merchan.quantity++;
                    merchan.save(function (err) {
                        if (err) return res.status(500).send("오류가 발생했습니다sdf.");
                    })
                })
            });
            result.merchandise.pull({});
            result.save(function (err) {
                if (err) {
                    return res.status(500).send("삭제 시 오류가 발생했습니다sdf.");
                }
            });
        });

        if (err) return res.status(500).send("로그아웃 시 오류가 발생했습니다.")
        UserModel.findByIdAndUpdate(_id, { token: "" }, (err, result) => {
            if (err) return res.status(500).send("로그아웃 시 오류가 발생했습니다");
            res.clearCookie("token");
            res.redirect("/");
        });
    });
}

const showUserPage = (req, res) => {
    res.render("user")
}

const showInfoPage = (req, res) => {
    const token = req.cookies.token;

    jwt.verify(token, "secretKey", (err) => {
        if (err) return res.status(500).send("오류가 발생했습니다.");
        res.render("user/info")
    });

}

const infoUpdate = (req, res) => {
    const token = req.cookies.token;
    jwt.verify(token, "secretKey", (err, _id) => {
        if (err) return res.status(500).send("오류가 발생했습니다.");
        const { barcode_id, account_name, account_Number } = req.body;
        UserModel.findByIdAndUpdate(_id, { barcode_id, account_name, account_Number }, (err, result) => {
            if (err) return res.status(500).send("수정 시 오류가 발생했습니다.");
            if (!result) return res.status(404).send("해당하는 정보가 없습니다.");
            res.json(result);
        });    
    });
};

const getBarcodeId = (req, res) => {
    const token = req.cookies.token;
    jwt.verify(token, "secretKey", (err, _id) => {
        if (err) return res.status(500).send("오류가 발생했습니다.");
        UserModel.findOne({ _id, token }, (err, user) => {
            if (err) return res.status(500).send("오류가 발생했습니다.");
            if (!user) return res.render("user/login");
            res.json(user.barcode_id);
        });
    });
}

    
module.exports = { showSignupPage, signup, showLoginPage, login, logout, checkAuth, showUserPage, showInfoPage, infoUpdate, getBarcodeId };