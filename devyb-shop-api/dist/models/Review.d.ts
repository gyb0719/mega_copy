import mongoose, { Document } from 'mongoose';
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
    helpful: string[];
    notHelpful: string[];
    reply?: {
        comment: string;
        repliedAt: Date;
        repliedBy: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    moderationReason?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IReview, {}, {}, {}, mongoose.Document<unknown, {}, IReview, {}, {}> & IReview & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Review.d.ts.map