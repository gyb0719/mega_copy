import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * 검증 미들웨어 생성 함수
 */
export const validate = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    };

    // 각 부분별로 검증
    const validationResults = [];

    if (schema.body) {
      const { error, value } = schema.body.validate(req.body, validationOptions);
      if (error) {
        validationResults.push({ location: 'body', error });
      } else {
        req.body = value;
      }
    }

    if (schema.params) {
      const { error, value } = schema.params.validate(req.params, validationOptions);
      if (error) {
        validationResults.push({ location: 'params', error });
      } else {
        req.params = value;
      }
    }

    if (schema.query) {
      const { error, value } = schema.query.validate(req.query, validationOptions);
      if (error) {
        validationResults.push({ location: 'query', error });
      } else {
        req.query = value;
      }
    }

    // 검증 오류가 있는 경우
    if (validationResults.length > 0) {
      const errors = validationResults.map(result => {
        const details = result.error.details.map((detail: Joi.ValidationErrorItem) => ({
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

export interface ValidationSchema {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
}

// 공통 검증 스키마
export const commonSchemas = {
  // MongoDB ObjectId 검증
  mongoId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .message('유효한 ID 형식이 아닙니다'),
  
  // 이메일 검증
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .lowercase()
    .trim()
    .max(254)
    .messages({
      'string.email': '유효한 이메일 주소를 입력해주세요',
      'string.max': '이메일 주소는 254자를 초과할 수 없습니다'
    }),
  
  // 비밀번호 검증
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .messages({
      'string.min': '비밀번호는 최소 8자 이상이어야 합니다',
      'string.max': '비밀번호는 128자를 초과할 수 없습니다',
      'string.pattern.base': '비밀번호는 대소문자, 숫자, 특수문자를 모두 포함해야 합니다'
    }),
  
  // 한국 휴대폰 번호 검증
  phoneNumber: Joi.string()
    .pattern(/^(\+82|0)1[0-9]{1}[0-9]{3,4}[0-9]{4}$/)
    .message('유효한 휴대폰 번호 형식을 입력해주세요'),
  
  // 가격 검증
  price: Joi.number()
    .min(0)
    .max(10000000)
    .precision(2)
    .messages({
      'number.min': '가격은 0원 이상이어야 합니다',
      'number.max': '가격은 1,000만원을 초과할 수 없습니다',
      'number.precision': '가격은 소수점 둘째 자리까지만 입력 가능합니다'
    }),
  
  // 페이지네이션
  pagination: {
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid(
      'createdAt', '-createdAt',
      'updatedAt', '-updatedAt',
      'name', '-name',
      'price', '-price',
      'rating', '-rating'
    ).default('-createdAt')
  },
  
  // 검색 필터
  searchFilter: {
    search: Joi.string().trim().max(100).allow(''),
    category: Joi.string().valid(
      'electronics', 'clothing', 'books', 'home', 
      'sports', 'beauty', 'toys', 'food', 'other'
    ),
    minPrice: Joi.number().min(0).max(9999999),
    maxPrice: Joi.number().min(0).max(10000000),
    inStock: Joi.boolean(),
    rating: Joi.number().min(0).max(5)
  }
};

// 사용자 관련 검증 스키마
export const userValidation = {
  // 회원가입
  register: {
    body: Joi.object({
      name: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
          'string.min': '이름은 최소 2자 이상이어야 합니다',
          'string.max': '이름은 50자를 초과할 수 없습니다',
          'any.required': '이름을 입력해주세요'
        }),
      email: commonSchemas.email.required(),
      password: commonSchemas.password.required(),
      confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
          'any.only': '비밀번호가 일치하지 않습니다',
          'any.required': '비밀번호 확인을 입력해주세요'
        }),
      phone: commonSchemas.phoneNumber.optional(),
      agreeToTerms: Joi.boolean()
        .valid(true)
        .required()
        .messages({
          'any.only': '이용약관에 동의해주세요',
          'any.required': '이용약관 동의가 필요합니다'
        }),
      agreeToPrivacy: Joi.boolean()
        .valid(true)
        .required()
        .messages({
          'any.only': '개인정보 처리방침에 동의해주세요',
          'any.required': '개인정보 처리방침 동의가 필요합니다'
        })
    })
  },

  // 로그인
  login: {
    body: Joi.object({
      email: commonSchemas.email.required(),
      password: Joi.string().required().messages({
        'any.required': '비밀번호를 입력해주세요'
      }),
      rememberMe: Joi.boolean().default(false)
    })
  },

  // 프로필 업데이트
  updateProfile: {
    body: Joi.object({
      name: Joi.string().trim().min(2).max(50).messages({
        'string.min': '이름은 최소 2자 이상이어야 합니다',
        'string.max': '이름은 50자를 초과할 수 없습니다'
      }),
      phone: commonSchemas.phoneNumber.optional(),
      address: Joi.object({
        street: Joi.string().trim().max(200),
        city: Joi.string().trim().max(50),
        state: Joi.string().trim().max(50),
        zipCode: Joi.string().pattern(/^\d{5}$/).message('올바른 우편번호 형식을 입력해주세요'),
        country: Joi.string().trim().max(50).default('KR')
      }).optional()
    })
  },

  // 비밀번호 변경
  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string().required().messages({
        'any.required': '현재 비밀번호를 입력해주세요'
      }),
      newPassword: commonSchemas.password.required(),
      confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
          'any.only': '새 비밀번호가 일치하지 않습니다',
          'any.required': '새 비밀번호 확인을 입력해주세요'
        })
    })
  }
};

// 상품 관련 검증 스키마
export const productValidation = {
  // 상품 생성
  create: {
    body: Joi.object({
      name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
          'string.min': '상품명은 최소 2자 이상이어야 합니다',
          'string.max': '상품명은 100자를 초과할 수 없습니다',
          'any.required': '상품명을 입력해주세요'
        }),
      description: Joi.string()
        .trim()
        .min(10)
        .max(2000)
        .required()
        .messages({
          'string.min': '상품 설명은 최소 10자 이상이어야 합니다',
          'string.max': '상품 설명은 2000자를 초과할 수 없습니다',
          'any.required': '상품 설명을 입력해주세요'
        }),
      price: commonSchemas.price.required(),
      discountPrice: commonSchemas.price.optional(),
      category: Joi.string()
        .valid('electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys', 'food', 'other')
        .required()
        .messages({
          'any.only': '유효한 카테고리를 선택해주세요',
          'any.required': '카테고리를 선택해주세요'
        }),
      subcategory: Joi.string().trim().max(50),
      brand: Joi.string().trim().max(50),
      sku: Joi.string()
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
      images: Joi.array()
        .items(Joi.string().uri().messages({
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
      stock: Joi.number()
        .integer()
        .min(0)
        .max(999999)
        .required()
        .messages({
          'number.min': '재고 수량은 0 이상이어야 합니다',
          'number.max': '재고 수량은 999,999개를 초과할 수 없습니다',
          'any.required': '재고 수량을 입력해주세요'
        }),
      features: Joi.array()
        .items(Joi.string().trim().max(100))
        .max(20)
        .default([]),
      specifications: Joi.object().pattern(
        Joi.string().max(50),
        Joi.string().max(200)
      ),
      tags: Joi.array()
        .items(Joi.string().trim().lowercase().max(20))
        .max(10)
        .default([]),
      weight: Joi.number().min(0).max(999999),
      dimensions: Joi.object({
        length: Joi.number().min(0),
        width: Joi.number().min(0),
        height: Joi.number().min(0)
      }),
      shippingInfo: Joi.object({
        freeShipping: Joi.boolean().default(false),
        shippingCost: Joi.number().min(0).when('freeShipping', {
          is: true,
          then: Joi.number().valid(0),
          otherwise: Joi.number().required()
        }),
        estimatedDelivery: Joi.string().trim().max(100)
      }).default({ freeShipping: false })
    })
  },

  // 상품 업데이트
  update: {
    params: Joi.object({
      id: commonSchemas.mongoId.required()
    }),
    body: Joi.object({
      name: Joi.string().trim().min(2).max(100),
      description: Joi.string().trim().min(10).max(2000),
      price: commonSchemas.price,
      discountPrice: commonSchemas.price,
      category: Joi.string().valid('electronics', 'clothing', 'books', 'home', 'sports', 'beauty', 'toys', 'food', 'other'),
      subcategory: Joi.string().trim().max(50),
      brand: Joi.string().trim().max(50),
      images: Joi.array().items(Joi.string().uri()).min(1).max(10),
      stock: Joi.number().integer().min(0).max(999999),
      features: Joi.array().items(Joi.string().trim().max(100)).max(20),
      specifications: Joi.object().pattern(Joi.string().max(50), Joi.string().max(200)),
      tags: Joi.array().items(Joi.string().trim().lowercase().max(20)).max(10),
      status: Joi.string().valid('active', 'inactive', 'discontinued'),
      weight: Joi.number().min(0).max(999999),
      dimensions: Joi.object({
        length: Joi.number().min(0),
        width: Joi.number().min(0),
        height: Joi.number().min(0)
      }),
      shippingInfo: Joi.object({
        freeShipping: Joi.boolean(),
        shippingCost: Joi.number().min(0),
        estimatedDelivery: Joi.string().trim().max(100)
      })
    }).min(1)
  },

  // 상품 조회
  getProducts: {
    query: Joi.object({
      ...commonSchemas.pagination,
      ...commonSchemas.searchFilter
    })
  },

  // 상품 ID로 조회
  getById: {
    params: Joi.object({
      id: commonSchemas.mongoId.required()
    })
  }
};

// 주문 관련 검증 스키마
export const orderValidation = {
  // 주문 생성
  create: {
    body: Joi.object({
      orderItems: Joi.array()
        .items(
          Joi.object({
            product: commonSchemas.mongoId.required(),
            quantity: Joi.number()
              .integer()
              .min(1)
              .max(100)
              .required()
              .messages({
                'number.min': '수량은 1 이상이어야 합니다',
                'number.max': '수량은 100개를 초과할 수 없습니다'
              })
          })
        )
        .min(1)
        .max(50)
        .required()
        .messages({
          'array.min': '최소 1개의 상품이 필요합니다',
          'array.max': '한 번에 최대 50개 상품까지 주문 가능합니다'
        }),
      shippingAddress: Joi.object({
        fullName: Joi.string().trim().min(2).max(50).required(),
        address: Joi.string().trim().min(5).max(200).required(),
        city: Joi.string().trim().min(2).max(50).required(),
        postalCode: Joi.string().pattern(/^\d{5}$/).required().message('올바른 우편번호를 입력해주세요'),
        country: Joi.string().trim().max(50).default('KR'),
        phone: commonSchemas.phoneNumber.optional()
      }).required(),
      paymentMethod: Joi.string()
        .valid('card', 'bank_transfer', 'paypal', 'kakao_pay', 'naver_pay')
        .required(),
      notes: Joi.string().trim().max(500)
    })
  },

  // 주문 상태 업데이트
  updateStatus: {
    params: Joi.object({
      id: commonSchemas.mongoId.required()
    }),
    body: Joi.object({
      status: Joi.string()
        .valid('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')
        .required(),
      trackingNumber: Joi.string().trim().max(100),
      notes: Joi.string().trim().max(500)
    })
  }
};

export default validate;