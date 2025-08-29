import { NextRequest, NextResponse } from 'next/server';
import { productsAPI } from '../../lib/supabase-rpc-api';

export const runtime = 'edge';

// GET: 상품 목록 조회
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const data = await productsAPI.getAll({
      limit,
      offset,
      search,
      category
    });

    // Debug logging
    console.log('[GET /api/products] Raw data from RPC:', data);
    console.log('[GET /api/products] Data type:', typeof data);
    console.log('[GET /api/products] Is array?:', Array.isArray(data));

    // Ensure data is always an array
    const safeData = Array.isArray(data) ? data : [];
    
    console.log('[GET /api/products] Returning:', { count: safeData.length });

    return NextResponse.json({ 
      success: true, 
      data: safeData 
    });
  } catch (error: any) {
    console.error('GET /api/products error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch products' 
      },
      { status: 500 }
    );
  }
}

// POST: 상품 추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 필수 필드 검증
    if (!body.name || !body.price) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Name and price are required' 
        },
        { status: 400 }
      );
    }

    console.log('[POST /api/products] Creating product:', body);
    
    const data = await productsAPI.create({
      name: body.name,
      price: body.price,
      description: body.description,
      category: body.category,
      image_url: body.image_url,
      stock: body.stock,
      additional_images: body.additional_images || []
    });
    
    console.log('[POST /api/products] Create result:', data);

    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error: any) {
    console.error('POST /api/products error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create product' 
      },
      { status: 500 }
    );
  }
}