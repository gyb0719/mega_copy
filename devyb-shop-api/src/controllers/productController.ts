import { Request, Response, NextFunction } from 'express';
import 'multer';
import Product from '../models/Product';
import ProductService from '../services/productService';
import CloudinaryService from '../config/cloudinary';

const productService = ProductService.getInstance();
const cloudinaryService = CloudinaryService.getInstance();

/**
 * 상품 목록 조회 (검색 및 필터링 포함)
 */
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      search,
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      inStock,
      status,
      rating,
      tags,
      features,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // 필터 구성
    const filters = {
      search: search as string,
      category: category as string,
      subcategory: subcategory as string,
      brand: brand as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStock: inStock === 'true',
      status: status as 'active' | 'inactive' | 'discontinued',
      rating: rating ? Number(rating) : undefined,
      tags: tags ? (Array.isArray(tags) ? tags as string[] : [tags as string]) : undefined,
      features: features ? (Array.isArray(features) ? features as string[] : [features as string]) : undefined
    };

    // 정렬 옵션 파싱
    const sortField = (sort as string).startsWith('-') 
      ? (sort as string).substring(1) 
      : sort as string;
    const sortOrder = (sort as string).startsWith('-') ? 'desc' : 'asc';

    // 페이지네이션 옵션
    const pagination = {
      page: Number(page),
      limit: Math.min(Number(limit), 100) // 최대 100개로 제한
    };

    const result = await productService.searchProducts(
      filters,
      { field: sortField, order: sortOrder as 'asc' | 'desc' },
      pagination
    );

    res.status(200).json({
      success: true,
      data: result.products,
      pagination: result.pagination,
      filters: result.filters,
      message: `${result.pagination.totalProducts}개의 상품을 찾았습니다.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 특정 상품 조회
 */
export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id).populate('reviews');
    
    if (!product) {
      res.status(404).json({
        success: false,
        error: {
          status: 404,
          message: '상품을 찾을 수 없습니다.'
        }
      });
      return;
    }

    // 추천 상품도 함께 조회
    const recommendedProducts = await productService.getRecommendedProducts(id);

    res.status(200).json({
      success: true,
      data: {
        product,
        recommendedProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 상품 생성 (관리자)
 */
export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const productData = req.body;

    // SKU 중복 체크
    const existingProduct = await Product.findOne({ sku: productData.sku });
    if (existingProduct) {
      res.status(400).json({
        success: false,
        error: {
          status: 400,
          message: '이미 사용 중인 SKU입니다.'
        }
      });
      return;
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      data: product,
      message: '상품이 성공적으로 생성되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 상품 수정 (관리자)
 */
export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // SKU 변경 시 중복 체크
    if (updateData.sku) {
      const existingProduct = await Product.findOne({ 
        sku: updateData.sku, 
        _id: { $ne: id } 
      });
      if (existingProduct) {
        res.status(400).json({
          success: false,
          error: {
            status: 400,
            message: '이미 사용 중인 SKU입니다.'
          }
        });
        return;
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404).json({
        success: false,
        error: {
          status: 404,
          message: '상품을 찾을 수 없습니다.'
        }
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
      message: '상품이 성공적으로 수정되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 상품 삭제 (관리자)
 */
export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({
        success: false,
        error: {
          status: 404,
          message: '상품을 찾을 수 없습니다.'
        }
      });
      return;
    }

    // 이미지 삭제 (Cloudinary에서)
    if (product.images && product.images.length > 0) {
      try {
        const publicIds = product.images.map(url => {
          const parts = url.split('/');
          const filename = parts[parts.length - 1];
          return filename.split('.')[0]; // 확장자 제거
        });
        await cloudinaryService.deleteMultipleFiles(publicIds);
      } catch (imageError) {
        console.error('이미지 삭제 오류:', imageError);
        // 이미지 삭제 실패해도 상품은 삭제 진행
      }
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: '상품이 성공적으로 삭제되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 인기 상품 조회
 */
export const getPopularProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    
    const products = await productService.getPopularProducts(Number(limit));

    res.status(200).json({
      success: true,
      data: products,
      message: '인기 상품을 조회했습니다.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 신상품 조회
 */
export const getNewProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    
    const products = await productService.getNewProducts(Number(limit));

    res.status(200).json({
      success: true,
      data: products,
      message: '신상품을 조회했습니다.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 할인 상품 조회
 */
export const getDiscountedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    
    const products = await productService.getDiscountedProducts(Number(limit));

    res.status(200).json({
      success: true,
      data: products,
      message: '할인 상품을 조회했습니다.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 검색 자동완성
 */
export const getSearchSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { q, limit = 5 } = req.query;
    
    if (!q || typeof q !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          status: 400,
          message: '검색어를 입력해주세요.'
        }
      });
      return;
    }

    const suggestions = await productService.getSearchSuggestions(q, Number(limit));

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 상품 재고 업데이트
 */
export const updateStock = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { stock, operation = 'set' } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({
        success: false,
        error: {
          status: 404,
          message: '상품을 찾을 수 없습니다.'
        }
      });
      return;
    }

    let newStock = stock;
    if (operation === 'add') {
      newStock = product.stock + stock;
    } else if (operation === 'subtract') {
      newStock = Math.max(0, product.stock - stock);
    }

    product.stock = newStock;
    await product.save();

    res.status(200).json({
      success: true,
      data: { stock: product.stock },
      message: '재고가 성공적으로 업데이트되었습니다.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 상품 이미지 업로드
 */
export const uploadProductImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        error: {
          status: 400,
          message: '업로드할 이미지를 선택해주세요.'
        }
      });
      return;
    }

    // Cloudinary에 이미지 업로드
    const uploadPromises = files.map(file => 
      cloudinaryService.uploadFile(file.buffer, {
        folder: 'devyb-shop/products',
        quality: 'auto:good',
        format: 'webp'
      })
    );

    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map(result => result.secure_url);

    res.status(200).json({
      success: true,
      data: {
        images: imageUrls,
        uploadResults
      },
      message: `${imageUrls.length}개의 이미지가 성공적으로 업로드되었습니다.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 카테고리별 상품 통계
 */
export const getCategoryStats = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          totalProducts: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' },
          averageRating: { $avg: '$ratings' }
        }
      },
      { $sort: { totalProducts: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: stats,
      message: '카테고리별 통계를 조회했습니다.'
    });
  } catch (error) {
    next(error);
  }
};