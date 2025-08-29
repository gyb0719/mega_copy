import { NextRequest, NextResponse } from 'next/server';
import { productsAPI } from '../../../lib/supabase-rpc-api';

// GET: 특정 상품 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('[GET /api/products/[id]] Fetching product with ID:', id);
    
    const data = await productsAPI.getById(id);
    console.log('[GET /api/products/[id]] Product data from DB:', data);
    
    if (!data) {
      console.log('[GET /api/products/[id]] Product not found');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Product not found' 
        },
        { status: 404 }
      );
    }

    console.log('[GET /api/products/[id]] Returning product:', {
      id: data.id,
      name: data.name,
      price: data.price,
      hasImages: !!data.image_url || (data.additional_images && data.additional_images.length > 0)
    });

    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error: any) {
    console.error('[GET /api/products/[id]] Error:', error);
    console.error('[GET /api/products/[id]] Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch product' 
      },
      { status: 500 }
    );
  }
}

// PUT: 상품 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const data = await productsAPI.update(id, body);
    
    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error: any) {
    console.error('PUT /api/products/[id] error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update product' 
      },
      { status: 500 }
    );
  }
}

// DELETE: 상품 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await productsAPI.delete(id);
    
    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error: any) {
    console.error('DELETE /api/products/[id] error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete product' 
      },
      { status: 500 }
    );
  }
}