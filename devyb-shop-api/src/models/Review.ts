import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  _id: string;
  user: string;
  product: string;
  order: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  totalVotes: number;
  helpful: string[]; // 도움이 됐다고 표시한 사용자들
  notHelpful: string[]; // 도움이 되지 않았다고 표시한 사용자들
  reply?: {
    comment: string;
    repliedAt: Date;
    repliedBy: string; // 관리자 또는 판매자
  };
  status: 'pending' | 'approved' | 'rejected';
  moderationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReplySchema = new Schema({
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
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, { _id: false });

const ReviewSchema = new Schema<IReview>({
  user: {
    type: Schema.Types.ObjectId,
    required: [true, '사용자 정보가 필요합니다'],
    ref: 'User'
  },
  product: {
    type: Schema.Types.ObjectId,
    required: [true, '상품 정보가 필요합니다'],
    ref: 'Product'
  },
  order: {
    type: Schema.Types.ObjectId,
    required: [true, '주문 정보가 필요합니다'],
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: [true, '평점을 입력해주세요'],
    min: [1, '평점은 최소 1점입니다'],
    max: [5, '평점은 최대 5점입니다'],
    validate: {
      validator: function(rating: number) {
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
      validator: function(url: string) {
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
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  notHelpful: [{
    type: Schema.Types.ObjectId,
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
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      
      // helpful, notHelpful 배열은 길이만 반환
      ret.helpfulCount = ret.helpful ? ret.helpful.length : 0;
      ret.notHelpfulCount = ret.notHelpful ? ret.notHelpful.length : 0;
      delete ret.helpful;
      delete ret.notHelpful;
      
      return ret;
    }
  }
});

// 인덱스 설정
ReviewSchema.index({ product: 1, createdAt: -1 });
ReviewSchema.index({ user: 1, createdAt: -1 });
ReviewSchema.index({ rating: -1 });
ReviewSchema.index({ status: 1, createdAt: -1 });
ReviewSchema.index({ helpfulVotes: -1 });

// 복합 인덱스: 사용자당 상품별 하나의 리뷰만 허용
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Pre-save 미들웨어: 검증된 구매 여부 확인
ReviewSchema.pre<IReview>('save', async function(next) {
  if (this.isNew) {
    try {
      // 주문에서 해당 상품이 있는지 확인
      const Order = mongoose.model('Order');
      const order = await Order.findOne({
        _id: this.order,
        user: this.user,
        'orderItems.product': this.product,
        isPaid: true,
        isDelivered: true
      });
      
      this.isVerifiedPurchase = !!order;
    } catch (error) {
      console.error('리뷰 검증 오류:', error);
    }
  }
  next();
});

// Post-save 미들웨어: 상품 평점 업데이트
ReviewSchema.post<IReview>('save', async function() {
  try {
    await this.constructor.updateProductRating(this.product);
  } catch (error) {
    console.error('상품 평점 업데이트 오류:', error);
  }
});

// Post-remove 미들웨어: 상품 평점 업데이트
ReviewSchema.post('deleteOne', { document: true, query: false }, async function() {
  try {
    await this.constructor.updateProductRating(this.product);
  } catch (error) {
    console.error('상품 평점 업데이트 오류:', error);
  }
});

// 스태틱 메서드: 상품 평점 업데이트
ReviewSchema.statics.updateProductRating = async function(productId: string) {
  try {
    const stats = await this.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
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

    const Product = mongoose.model('Product');
    
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        ratings: Math.round(stats[0].averageRating * 10) / 10, // 소수점 1자리로 반올림
        numReviews: stats[0].totalReviews
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        ratings: 0,
        numReviews: 0
      });
    }
  } catch (error) {
    console.error('상품 평점 업데이트 스태틱 메서드 오류:', error);
  }
};

// 인스턴스 메서드: 도움이 되는 투표
ReviewSchema.methods.addHelpfulVote = async function(userId: string) {
  // 이미 투표했는지 확인
  if (this.helpful.includes(userId) || this.notHelpful.includes(userId)) {
    throw new Error('이미 투표하셨습니다.');
  }
  
  this.helpful.push(userId);
  this.helpfulVotes = this.helpful.length;
  this.totalVotes = this.helpful.length + this.notHelpful.length;
  
  return await this.save();
};

// 인스턴스 메서드: 도움이 되지 않는 투표
ReviewSchema.methods.addNotHelpfulVote = async function(userId: string) {
  // 이미 투표했는지 확인
  if (this.helpful.includes(userId) || this.notHelpful.includes(userId)) {
    throw new Error('이미 투표하셨습니다.');
  }
  
  this.notHelpful.push(userId);
  this.totalVotes = this.helpful.length + this.notHelpful.length;
  
  return await this.save();
};

// Virtual: 도움이 되는 비율
ReviewSchema.virtual('helpfulPercentage').get(function(this: IReview) {
  if (this.totalVotes === 0) return 0;
  return Math.round((this.helpfulVotes / this.totalVotes) * 100);
});

export default mongoose.model<IReview>('Review', ReviewSchema);