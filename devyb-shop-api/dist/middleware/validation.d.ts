import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare const validate: (schema: ValidationSchema) => (req: Request, res: Response, next: NextFunction) => void;
export interface ValidationSchema {
    body?: Joi.ObjectSchema;
    params?: Joi.ObjectSchema;
    query?: Joi.ObjectSchema;
}
export declare const commonSchemas: {
    mongoId: Joi.StringSchema<string>;
    email: Joi.StringSchema<string>;
    password: Joi.StringSchema<string>;
    phoneNumber: Joi.StringSchema<string>;
    price: Joi.NumberSchema<number>;
    pagination: {
        page: Joi.NumberSchema<number>;
        limit: Joi.NumberSchema<number>;
        sort: Joi.StringSchema<string>;
    };
    searchFilter: {
        search: Joi.StringSchema<string>;
        category: Joi.StringSchema<string>;
        minPrice: Joi.NumberSchema<number>;
        maxPrice: Joi.NumberSchema<number>;
        inStock: Joi.BooleanSchema<boolean>;
        rating: Joi.NumberSchema<number>;
    };
};
export declare const userValidation: {
    register: {
        body: Joi.ObjectSchema<any>;
    };
    login: {
        body: Joi.ObjectSchema<any>;
    };
    updateProfile: {
        body: Joi.ObjectSchema<any>;
    };
    changePassword: {
        body: Joi.ObjectSchema<any>;
    };
};
export declare const productValidation: {
    create: {
        body: Joi.ObjectSchema<any>;
    };
    update: {
        params: Joi.ObjectSchema<any>;
        body: Joi.ObjectSchema<any>;
    };
    getProducts: {
        query: Joi.ObjectSchema<any>;
    };
    getById: {
        params: Joi.ObjectSchema<any>;
    };
};
export declare const orderValidation: {
    create: {
        body: Joi.ObjectSchema<any>;
    };
    updateStatus: {
        params: Joi.ObjectSchema<any>;
        body: Joi.ObjectSchema<any>;
    };
};
export default validate;
//# sourceMappingURL=validation.d.ts.map