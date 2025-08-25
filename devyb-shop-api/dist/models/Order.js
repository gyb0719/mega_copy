"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const OrderItemSchema = new mongoose_1.Schema({
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'Product'
    },
    name: {
        type: String,
        required: [true, '상품명을 입력해주세요'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, '상품 가격을 입력해주세요'],
        min: [0, '가격은 0 이상이어야 합니다']
    },
    quantity: {
        type: Number,
        required: [true, '수량을 입력해주세요'],
        min: [1, '수량은 1 이상이어야 합니다'],
        max: [100, '수량은 100개를 초과할 수 없습니다']
    },
    image: {
        type: String,
        required: [true, '상품 이미지를 입력해주세요']
    }
}, { _id: false });
const ShippingAddressSchema = new mongoose_1.Schema({
    fullName: {
        type: String,
        required: [true, '받는 사람 이름을 입력해주세요'],
        trim: true,
        maxlength: [50, '이름은 50자를 초과할 수 없습니다']
    },
    address: {
        type: String,
        required: [true, '주소를 입력해주세요'],
        trim: true,
        maxlength: [200, '주소는 200자를 초과할 수 없습니다']
    },
    city: {
        type: String,
        required: [true, '도시를 입력해주세요'],
        trim: true,
        maxlength: [50, '도시명은 50자를 초과할 수 없습니다']
    },
    postalCode: {
        type: String,
        required: [true, '우편번호를 입력해주세요'],
        trim: true,
        match: [/^\d{5}$/, '올바른 우편번호 형식을 입력해주세요 (5자리 숫자)']
    },
    country: {
        type: String,
        required: [true, '국가를 입력해주세요'],
        trim: true,
        default: 'KR'
    },
    phone: {
        type: String,
        trim: true,
        match: [
            /^(\+82|0)1[0-9]{1}[0-9]{3,4}[0-9]{4}$/,
            '올바른 휴대폰 번호 형식을 입력해주세요'
        ]
    }
}, { _id: false });
const PaymentResultSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    update_time: {
        type: String,
        required: true
    },
    email_address: {
        type: String,
        trim: true,
        lowercase: true
    }
}, { _id: false });
const OrderSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, '사용자 정보가 필요합니다'],
        ref: 'User'
    },
    orderItems: {
        type: [OrderItemSchema],
        required: [true, '주문 상품이 필요합니다'],
        validate: {
            validator: function (items) {
                return items && items.length > 0;
            },
            message: '최소 1개 이상의 상품이 필요합니다'
        }
    },
    shippingAddress: {
        type: ShippingAddressSchema,
        required: [true, '배송 주소가 필요합니다']
    },
    paymentMethod: {
        type: String,
        required: [true, '결제 방법을 선택해주세요'],
        enum: {
            values: ['card', 'bank_transfer', 'paypal', 'kakao_pay', 'naver_pay'],
            message: '유효한 결제 방법을 선택해주세요'
        }
    },
    paymentResult: {
        type: PaymentResultSchema,
        default: undefined
    },
    itemsPrice: {
        type: Number,
        required: [true, '상품 총 가격이 필요합니다'],
        min: [0, '상품 가격은 0 이상이어야 합니다']
    },
    taxPrice: {
        type: Number,
        required: [true, '세금 정보가 필요합니다'],
        min: [0, '세금은 0 이상이어야 합니다'],
        default: 0
    },
    shippingPrice: {
        type: Number,
        required: [true, '배송비 정보가 필요합니다'],
        min: [0, '배송비는 0 이상이어야 합니다'],
        default: 0
    },
    totalPrice: {
        type: Number,
        required: [true, '총 가격이 필요합니다'],
        min: [0, '총 가격은 0 이상이어야 합니다']
    },
    isPaid: {
        type: Boolean,
        default: false
    },
    paidAt: {
        type: Date
    },
    isDelivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    trackingNumber: {
        type: String,
        trim: true,
        sparse: true
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, '주문 메모는 500자를 초과할 수 없습니다']
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ isPaid: 1, paidAt: -1 });
OrderSchema.index({ isDelivered: 1, deliveredAt: -1 });
OrderSchema.index({ trackingNumber: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.pre('save', function (next) {
    const calculatedTotal = this.itemsPrice + this.taxPrice + this.shippingPrice;
    if (Math.abs(this.totalPrice - calculatedTotal) > 0.01) {
        return next(new Error('총 가격이 올바르지 않습니다'));
    }
    if (this.isPaid && !this.paidAt) {
        this.paidAt = new Date();
    }
    if (this.isDelivered && !this.deliveredAt) {
        this.deliveredAt = new Date();
        this.status = 'delivered';
    }
    next();
});
OrderSchema.virtual('orderNumber').get(function () {
    const date = this.createdAt.toISOString().slice(0, 10).replace(/-/g, '');
    const id = this._id.toString().slice(-6).toUpperCase();
    return `ORD${date}${id}`;
});
OrderSchema.virtual('itemsCount').get(function () {
    return this.orderItems.reduce((acc, item) => acc + item.quantity, 0);
});
exports.default = mongoose_1.default.model('Order', OrderSchema);
//# sourceMappingURL=Order.js.map