const mongoose = require("mongoose");

// 스키마 정의 (사용자 정보)
// 컬렉션에 들어가는 Document의 구조를 정의
// 필드, 타입, 필수여부 등 지정
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: 50,
    },
    student_id: {
        type: String,
        trim: true,
        unique: true,
    },
    id: {
        type: String,
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        trim: true,
    },
    barcode_id: {
        type: String,
        trim: true,
    },
    account_name: {
        type: String,
        trim: true,
    },
    account_Number: {
        type: String,
        trim: true,
    },
    token: {
        type: String,
    }
});

// 스키마 적용 -> 모델 객체 생성
// DB의 컬렉션 -> musics 컬렉션 생성
const User = mongoose.model("user", UserSchema);
module.exports = User;