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
const DimensionsSchema = new mongoose_1.Schema({
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 }
}, { _id: false });
const ShippingInfoSchema = new mongoose_1.Schema({
    freeShipping: { type: Boolean, default: false },
    shippingCost: {
        type: Number,
        min: 0,
        default: function () {
            return this.freeShipping ? 0 : undefined;
        }
    },
    estimatedDelivery: { type: String, trim: true }
}, { _id: false });
const SeoInfoSchema = new mongoose_1.Schema({
    metaTitle: { type: String, trim: true, maxlength: 60 },
    metaDescription: { type: String, trim: true, maxlength: 160 },
    slug: { type: String, trim: true, lowercase: true }
}, { _id: false });
const ProductSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, '상품명을 입력해주세요'],
        trim: true,
        maxlength: [100, '상품명은 100자를 초과할 수 없습니다']
    },
    description: {
        type: String,
        required: [true, '상품 설명을 입력해주세요'],
        trim: true,
        maxlength: [2000, '상품 설명은 2000자를 초과할 수 없습니다']
    },
    price: {
        type: Number,
        required: [true, '가격을 입력해주세요'],
        min: [0, '가격은 0원 이상이어야 합니다'],
        max: [10000000, '가격은 1000만원을 초과할 수 없습니다']
    },
    discountPrice: {
        type: Number,
        min: [0, '할인가격은 0원 이상이어야 합니다'],
        validate: {
            validator: function (discountPrice) {
                return !discountPrice || discountPrice < this.price;
            },
            message: '할인가격은 원래 가격보다 낮아야 합니다'
        }
    },
    category: {
        type: String,
        required: [true, '카테고리를 선택해주세요'],
        trim: true,
        enum: {
            values: ['electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys', 'food', 'other'],
            message: '유효한 카테고리를 선택해주세요'
        }
    },
    subcategory: {
        type: String,
        trim: true
    },
    brand: {
        type: String,
        trim: true,
        maxlength: [50, '브랜드명은 50자를 초과할 수 없습니다']
    },
    sku: {
        type: String,
        required: [true, 'SKU를 입력해주세요'],
        unique: true,
        trim: true,
        uppercase: true,
        maxlength: [50, 'SKU는 50자를 초과할 수 없습니다']
    },
    images: [{
            type: String,
            required: true,
            validate: {
                validator: function (url) {
                    return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                },
                message: '올바른 이미지 URL 형식을 입력해주세요'
            }
        }],
    stock: {
        type: Number,
        required: [true, '재고 수량을 입력해주세요'],
        min: [0, '재고 수량은 0 이상이어야 합니다'],
        max: [999999, '재고 수량은 999,999개를 초과할 수 없습니다']
    },
    sold: {
        type: Number,
        default: 0,
        min: [0, '판매 수량은 0 이상이어야 합니다']
    },
    ratings: {
        type: Number,
        default: 0,
        min: [0, '평점은 0 이상이어야 합니다'],
        max: [5, '평점은 5 이하여야 합니다']
    },
    numReviews: {
        type: Number,
        default: 0,
        min: [0, '리뷰 개수는 0 이상이어야 합니다']
    },
    features: [{
            type: String,
            trim: true,
            maxlength: [100, '특징은 100자를 초과할 수 없습니다']
        }],
    specifications: {
        type: Map,
        of: String,
        default: new Map()
    },
    tags: [{
            type: String,
            trim: true,
            lowercase: true,
            maxlength: [20, '태그는 20자를 초과할 수 없습니다']
        }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'discontinued'],
        default: 'active'
    },
    weight: {
        type: Number,
        min: [0, '무게는 0 이상이어야 합니다']
    },
    dimensions: {
        type: DimensionsSchema,
        default: {}
    },
    shippingInfo: {
        type: ShippingInfoSchema,
        default: { freeShipping: false }
    },
    seoInfo: {
        type: SeoInfoSchema,
        default: {}
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            if (ret.specifications instanceof Map) {
                ret.specifications = Object.fromEntries(ret.specifications);
            }
            return ret;
        }
    }
});
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ ratings: -1, numReviews: -1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ sku: 1 });
ProductSchema.index({ 'seoInfo.slug': 1 });
ProductSchema.pre('save', function (next) {
    if (!this.seoInfo.slug && this.name) {
        this.seoInfo.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9가-힣]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    next();
});
ProductSchema.virtual('finalPrice').get(function () {
    return this.discountPrice && this.discountPrice > 0 ? this.discountPrice : this.price;
});
ProductSchema.virtual('discountPercentage').get(function () {
    if (this.discountPrice && this.discountPrice > 0) {
        return Math.round(((this.price - this.discountPrice) / this.price) * 100);
    }
    return 0;
});
ProductSchema.virtual('inStock').get(function () {
    return this.stock > 0 && this.status === 'active';
});
exports.default = mongoose_1.default.model('Product', ProductSchema);
//# sourceMappingURL=Product.js.map