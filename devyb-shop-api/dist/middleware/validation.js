"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderValidation = exports.productValidation = exports.userValidation = exports.commonSchemas = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const validate = (schema) => {
    return (req, res, next) => {
        const validationOptions = {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
        };
        const validationResults = [];
        if (schema.body) {
            const { error, value } = schema.body.validate(req.body, validationOptions);
            if (error) {
                validationResults.push({ location: 'body', error });
            }
            else {
                req.body = value;
            }
        }
        if (schema.params) {
            const { error, value } = schema.params.validate(req.params, validationOptions);
            if (error) {
                validationResults.push({ location: 'params', error });
            }
            else {
                req.params = value;
            }
        }
        if (schema.query) {
            const { error, value } = schema.query.validate(req.query, validationOptions);
            if (error) {
                validationResults.push({ location: 'query', error });
            }
            else {
                req.query = value;
            }
        }
        if (validationResults.length > 0) {
            const errors = validationResults.map(result => {
                const details = result.error.details.map((detail) => ({
                    field: detail.path.join('.'),
                    message: detail.message,
                    value: detail.context?.value
                }));
                return {
                    location: result.location,
                    details
                };
            });
            res.status(400).json({
                success: false,
                error: {
                    status: 400,
                    message: '입력 데이터 검증에 실패했습니다.',
                    validationErrors: errors
                }
            });
            return;
        }
        next();
    };
};
exports.validate = validate;
exports.commonSchemas = {
    mongoId: joi_1.default.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .message('유효한 ID 형식이 아닙니다'),
    email: joi_1.default.string()
        .email({ tlds: { allow: false } })
        .lowercase()
        .trim()
        .max(254)
        .messages({
        'string.email': '유효한 이메일 주소를 입력해주세요',
        'string.max': '이메일 주소는 254자를 초과할 수 없습니다'
    }),
    password: joi_1.default.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .messages({
        'string.min': '비밀번호는 최소 8자 이상이어야 합니다',
        'string.max': '비밀번호는 128자를 초과할 수 없습니다',
        'string.pattern.base': '비밀번호는 대소문자, 숫자, 특수문자를 모두 포함해야 합니다'
    }),
    phoneNumber: joi_1.default.string()
        .pattern(/^(\+82|0)1[0-9]{1}[0-9]{3,4}[0-9]{4}$/)
        .message('유효한 휴대폰 번호 형식을 입력해주세요'),
    price: joi_1.default.number()
        .min(0)
        .max(10000000)
        .precision(2)
        .messages({
        'number.min': '가격은 0원 이상이어야 합니다',
        'number.max': '가격은 1,000만원을 초과할 수 없습니다',
        'number.precision': '가격은 소수점 둘째 자리까지만 입력 가능합니다'
    }),
    pagination: {
        page: joi_1.default.number().integer().min(1).default(1),
        limit: joi_1.default.number().integer().min(1).max(100).default(10),
        sort: joi_1.default.string().valid('createdAt', '-createdAt', 'updatedAt', '-updatedAt', 'name', '-name', 'price', '-price', 'rating', '-rating').default('-createdAt')
    },
    searchFilter: {
        search: joi_1.default.string().trim().max(100).allow(''),
        category: joi_1.default.string().valid('electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys', 'food', 'other'),
        minPrice: joi_1.default.number().min(0).max(9999999),
        maxPrice: joi_1.default.number().min(0).max(10000000),
        inStock: joi_1.default.boolean(),
        rating: joi_1.default.number().min(0).max(5)
    }
};
exports.userValidation = {
    register: {
        body: joi_1.default.object({
            name: joi_1.default.string()
                .trim()
                .min(2)
                .max(50)
                .required()
                .messages({
                'string.min': '이름은 최소 2자 이상이어야 합니다',
                'string.max': '이름은 50자를 초과할 수 없습니다',
                'any.required': '이름을 입력해주세요'
            }),
            email: exports.commonSchemas.email.required(),
            password: exports.commonSchemas.password.required(),
            confirmPassword: joi_1.default.string()
                .valid(joi_1.default.ref('password'))
                .required()
                .messages({
                'any.only': '비밀번호가 일치하지 않습니다',
                'any.required': '비밀번호 확인을 입력해주세요'
            }),
            phone: exports.commonSchemas.phoneNumber.optional(),
            agreeToTerms: joi_1.default.boolean()
                .valid(true)
                .required()
                .messages({
                'any.only': '이용약관에 동의해주세요',
                'any.required': '이용약관 동의가 필요합니다'
            }),
            agreeToPrivacy: joi_1.default.boolean()
                .valid(true)
                .required()
                .messages({
                'any.only': '개인정보 처리방침에 동의해주세요',
                'any.required': '개인정보 처리방침 동의가 필요합니다'
            })
        })
    },
    login: {
        body: joi_1.default.object({
            email: exports.commonSchemas.email.required(),
            password: joi_1.default.string().required().messages({
                'any.required': '비밀번호를 입력해주세요'
            }),
            rememberMe: joi_1.default.boolean().default(false)
        })
    },
    updateProfile: {
        body: joi_1.default.object({
            name: joi_1.default.string().trim().min(2).max(50).messages({
                'string.min': '이름은 최소 2자 이상이어야 합니다',
                'string.max': '이름은 50자를 초과할 수 없습니다'
            }),
            phone: exports.commonSchemas.phoneNumber.optional(),
            address: joi_1.default.object({
                street: joi_1.default.string().trim().max(200),
                city: joi_1.default.string().trim().max(50),
                state: joi_1.default.string().trim().max(50),
                zipCode: joi_1.default.string().pattern(/^\d{5}$/).message('올바른 우편번호 형식을 입력해주세요'),
                country: joi_1.default.string().trim().max(50).default('KR')
            }).optional()
        })
    },
    changePassword: {
        body: joi_1.default.object({
            currentPassword: joi_1.default.string().required().messages({
                'any.required': '현재 비밀번호를 입력해주세요'
            }),
            newPassword: exports.commonSchemas.password.required(),
            confirmPassword: joi_1.default.string()
                .valid(joi_1.default.ref('newPassword'))
                .required()
                .messages({
                'any.only': '새 비밀번호가 일치하지 않습니다',
                'any.required': '새 비밀번호 확인을 입력해주세요'
            })
        })
    }
};
exports.productValidation = {
    create: {
        body: joi_1.default.object({
            name: joi_1.default.string()
                .trim()
                .min(2)
                .max(100)
                .required()
                .messages({
                'string.min': '상품명은 최소 2자 이상이어야 합니다',
                'string.max': '상품명은 100자를 초과할 수 없습니다',
                'any.required': '상품명을 입력해주세요'
            }),
            description: joi_1.default.string()
                .trim()
                .min(10)
                .max(2000)
                .required()
                .messages({
                'string.min': '상품 설명은 최소 10자 이상이어야 합니다',
                'string.max': '상품 설명은 2000자를 초과할 수 없습니다',
                'any.required': '상품 설명을 입력해주세요'
            }),
            price: exports.commonSchemas.price.required(),
            discountPrice: exports.commonSchemas.price.optional(),
            category: joi_1.default.string()
                .valid('electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys', 'food', 'other')
                .required()
                .messages({
                'any.only': '유효한 카테고리를 선택해주세요',
                'any.required': '카테고리를 선택해주세요'
            }),
            subcategory: joi_1.default.string().trim().max(50),
            brand: joi_1.default.string().trim().max(50),
            sku: joi_1.default.string()
                .trim()
                .uppercase()
                .min(3)
                .max(50)
                .required()
                .messages({
                'string.min': 'SKU는 최소 3자 이상이어야 합니다',
                'string.max': 'SKU는 50자를 초과할 수 없습니다',
                'any.required': 'SKU를 입력해주세요'
            }),
            images: joi_1.default.array()
                .items(joi_1.default.string().uri().messages({
                'string.uri': '올바른 이미지 URL을 입력해주세요'
            }))
                .min(1)
                .max(10)
                .required()
                .messages({
                'array.min': '최소 1개의 이미지가 필요합니다',
                'array.max': '이미지는 최대 10개까지 등록 가능합니다',
                'any.required': '상품 이미지를 등록해주세요'
            }),
            stock: joi_1.default.number()
                .integer()
                .min(0)
                .max(999999)
                .required()
                .messages({
                'number.min': '재고 수량은 0 이상이어야 합니다',
                'number.max': '재고 수량은 999,999개를 초과할 수 없습니다',
                'any.required': '재고 수량을 입력해주세요'
            }),
            features: joi_1.default.array()
                .items(joi_1.default.string().trim().max(100))
                .max(20)
                .default([]),
            specifications: joi_1.default.object().pattern(joi_1.default.string().max(50), joi_1.default.string().max(200)),
            tags: joi_1.default.array()
                .items(joi_1.default.string().trim().lowercase().max(20))
                .max(10)
                .default([]),
            weight: joi_1.default.number().min(0).max(999999),
            dimensions: joi_1.default.object({
                length: joi_1.default.number().min(0),
                width: joi_1.default.number().min(0),
                height: joi_1.default.number().min(0)
            }),
            shippingInfo: joi_1.default.object({
                freeShipping: joi_1.default.boolean().default(false),
                shippingCost: joi_1.default.number().min(0).when('freeShipping', {
                    is: true,
                    then: joi_1.default.number().valid(0),
                    otherwise: joi_1.default.number().required()
                }),
                estimatedDelivery: joi_1.default.string().trim().max(100)
            }).default({ freeShipping: false })
        })
    },
    update: {
        params: joi_1.default.object({
            id: exports.commonSchemas.mongoId.required()
        }),
        body: joi_1.default.object({
            name: joi_1.default.string().trim().min(2).max(100),
            description: joi_1.default.string().trim().min(10).max(2000),
            price: exports.commonSchemas.price,
            discountPrice: exports.commonSchemas.price,
            category: joi_1.default.string().valid('electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys', 'food', 'other'),
            subcategory: joi_1.default.string().trim().max(50),
            brand: joi_1.default.string().trim().max(50),
            images: joi_1.default.array().items(joi_1.default.string().uri()).min(1).max(10),
            stock: joi_1.default.number().integer().min(0).max(999999),
            features: joi_1.default.array().items(joi_1.default.string().trim().max(100)).max(20),
            specifications: joi_1.default.object().pattern(joi_1.default.string().max(50), joi_1.default.string().max(200)),
            tags: joi_1.default.array().items(joi_1.default.string().trim().lowercase().max(20)).max(10),
            status: joi_1.default.string().valid('active', 'inactive', 'discontinued'),
            weight: joi_1.default.number().min(0).max(999999),
            dimensions: joi_1.default.object({
                length: joi_1.default.number().min(0),
                width: joi_1.default.number().min(0),
                height: joi_1.default.number().min(0)
            }),
            shippingInfo: joi_1.default.object({
                freeShipping: joi_1.default.boolean(),
                shippingCost: joi_1.default.number().min(0),
                estimatedDelivery: joi_1.default.string().trim().max(100)
            })
        }).min(1)
    },
    getProducts: {
        query: joi_1.default.object({
            ...exports.commonSchemas.pagination,
            ...exports.commonSchemas.searchFilter
        })
    },
    getById: {
        params: joi_1.default.object({
            id: exports.commonSchemas.mongoId.required()
        })
    }
};
exports.orderValidation = {
    create: {
        body: joi_1.default.object({
            orderItems: joi_1.default.array()
                .items(joi_1.default.object({
                product: exports.commonSchemas.mongoId.required(),
                quantity: joi_1.default.number()
                    .integer()
                    .min(1)
                    .max(100)
                    .required()
                    .messages({
                    'number.min': '수량은 1 이상이어야 합니다',
                    'number.max': '수량은 100개를 초과할 수 없습니다'
                })
            }))
                .min(1)
                .max(50)
                .required()
                .messages({
                'array.min': '최소 1개의 상품이 필요합니다',
                'array.max': '한 번에 최대 50개 상품까지 주문 가능합니다'
            }),
            shippingAddress: joi_1.default.object({
                fullName: joi_1.default.string().trim().min(2).max(50).required(),
                address: joi_1.default.string().trim().min(5).max(200).required(),
                city: joi_1.default.string().trim().min(2).max(50).required(),
                postalCode: joi_1.default.string().pattern(/^\d{5}$/).required().message('올바른 우편번호를 입력해주세요'),
                country: joi_1.default.string().trim().max(50).default('KR'),
                phone: exports.commonSchemas.phoneNumber.optional()
            }).required(),
            paymentMethod: joi_1.default.string()
                .valid('card', 'bank_transfer', 'paypal', 'kakao_pay', 'naver_pay')
                .required(),
            notes: joi_1.default.string().trim().max(500)
        })
    },
    updateStatus: {
        params: joi_1.default.object({
            id: exports.commonSchemas.mongoId.required()
        }),
        body: joi_1.default.object({
            status: joi_1.default.string()
                .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
                .required(),
            trackingNumber: joi_1.default.string().trim().max(100),
            notes: joi_1.default.string().trim().max(500)
        })
    }
};
exports.default = exports.validate;
//# sourceMappingURL=validation.js.map