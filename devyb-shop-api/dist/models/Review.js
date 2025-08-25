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
const ReplySchema = new mongoose_1.Schema({
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: [1000, '답글은 1000자를 초과할 수 없습니다']
    },
    repliedAt: {
        type: Date,
        default: Date.now
    },
    repliedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, { _id: false });
const ReviewSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, '사용자 정보가 필요합니다'],
        ref: 'User'
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, '상품 정보가 필요합니다'],
        ref: 'Product'
    },
    order: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: [true, '주문 정보가 필요합니다'],
        ref: 'Order'
    },
    rating: {
        type: Number,
        required: [true, '평점을 입력해주세요'],
        min: [1, '평점은 최소 1점입니다'],
        max: [5, '평점은 최대 5점입니다'],
        validate: {
            validator: function (rating) {
                return Number.isInteger(rating);
            },
            message: '평점은 정수여야 합니다'
        }
    },
    title: {
        type: String,
        required: [true, '리뷰 제목을 입력해주세요'],
        trim: true,
        minlength: [5, '제목은 최소 5자 이상이어야 합니다'],
        maxlength: [100, '제목은 100자를 초과할 수 없습니다']
    },
    comment: {
        type: String,
        required: [true, '리뷰 내용을 입력해주세요'],
        trim: true,
        minlength: [10, '리뷰는 최소 10자 이상이어야 합니다'],
        maxlength: [2000, '리뷰는 2000자를 초과할 수 없습니다']
    },
    images: [{
            type: String,
            validate: {
                validator: function (url) {
                    return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                },
                message: '올바른 이미지 URL 형식을 입력해주세요'
            }
        }],
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    helpfulVotes: {
        type: Number,
        default: 0,
        min: 0
    },
    totalVotes: {
        type: Number,
        default: 0,
        min: 0
    },
    helpful: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    notHelpful: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    reply: {
        type: ReplySchema,
        default: undefined
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    moderationReason: {
        type: String,
        trim: true,
        maxlength: [500, '승인 거부 사유는 500자를 초과할 수 없습니다']
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            ret.helpfulCount = ret.helpful ? ret.helpful.length : 0;
            ret.notHelpfulCount = ret.notHelpful ? ret.notHelpful.length : 0;
            delete ret.helpful;
            delete ret.notHelpful;
            return ret;
        }
    }
});
ReviewSchema.index({ product: 1, createdAt: -1 });
ReviewSchema.index({ user: 1, createdAt: -1 });
ReviewSchema.index({ rating: -1 });
ReviewSchema.index({ status: 1, createdAt: -1 });
ReviewSchema.index({ helpfulVotes: -1 });
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });
ReviewSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            const Order = mongoose_1.default.model('Order');
            const order = await Order.findOne({
                _id: this.order,
                user: this.user,
                'orderItems.product': this.product,
                isPaid: true,
                isDelivered: true
            });
            this.isVerifiedPurchase = !!order;
        }
        catch (error) {
            console.error('리뷰 검증 오류:', error);
        }
    }
    next();
});
ReviewSchema.post('save', async function () {
    try {
        await this.constructor.updateProductRating(this.product);
    }
    catch (error) {
        console.error('상품 평점 업데이트 오류:', error);
    }
});
ReviewSchema.post('deleteOne', { document: true, query: false }, async function () {
    try {
        await this.constructor.updateProductRating(this.product);
    }
    catch (error) {
        console.error('상품 평점 업데이트 오류:', error);
    }
});
ReviewSchema.statics.updateProductRating = async function (productId) {
    try {
        const stats = await this.aggregate([
            {
                $match: {
                    product: new mongoose_1.default.Types.ObjectId(productId),
                    status: 'approved'
                }
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 }
                }
            }
        ]);
        const Product = mongoose_1.default.model('Product');
        if (stats.length > 0) {
            await Product.findByIdAndUpdate(productId, {
                ratings: Math.round(stats[0].averageRating * 10) / 10,
                numReviews: stats[0].totalReviews
            });
        }
        else {
            await Product.findByIdAndUpdate(productId, {
                ratings: 0,
                numReviews: 0
            });
        }
    }
    catch (error) {
        console.error('상품 평점 업데이트 스태틱 메서드 오류:', error);
    }
};
ReviewSchema.methods.addHelpfulVote = async function (userId) {
    if (this.helpful.includes(userId) || this.notHelpful.includes(userId)) {
        throw new Error('이미 투표하셨습니다.');
    }
    this.helpful.push(userId);
    this.helpfulVotes = this.helpful.length;
    this.totalVotes = this.helpful.length + this.notHelpful.length;
    return await this.save();
};
ReviewSchema.methods.addNotHelpfulVote = async function (userId) {
    if (this.helpful.includes(userId) || this.notHelpful.includes(userId)) {
        throw new Error('이미 투표하셨습니다.');
    }
    this.notHelpful.push(userId);
    this.totalVotes = this.helpful.length + this.notHelpful.length;
    return await this.save();
};
ReviewSchema.virtual('helpfulPercentage').get(function () {
    if (this.totalVotes === 0)
        return 0;
    return Math.round((this.helpfulVotes / this.totalVotes) * 100);
});
exports.default = mongoose_1.default.model('Review', ReviewSchema);
//# sourceMappingURL=Review.js.map