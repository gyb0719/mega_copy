import mongoose, { Document } from 'mongoose';
export interface IProduct extends Document {
    _id: string;
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    category: string;
    subcategory?: string;
    brand?: string;
    sku: string;
    images: string[];
    stock: number;
    sold: number;
    ratings: number;
    numReviews: number;
    features: string[];
    specifications: {
        [key: string]: string;
    };
    tags: string[];
    status: 'active' | 'inactive' | 'discontinued';
    weight?: number;
    dimensions?: {
        length?: number;
        width?: number;
        height?: number;
    };
    shippingInfo: {
        freeShipping: boolean;
        shippingCost?: number;
        estimatedDelivery?: string;
    };
    seoInfo: {
        metaTitle?: string;
        metaDescription?: string;
        slug?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, {}> & IProduct & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Product.d.ts.map