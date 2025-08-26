import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sampleProducts } from '@/lib/sampleData';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Supabase 연결 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'https://your-project.supabase.co' || 
        supabaseKey === 'your-anon-key-here') {
      // Supabase가 설정되지 않은 경우 샘플 데이터 사용
      const product = sampleProducts.find(p => p.id === params.id);
      if (product) {
        return NextResponse.json({ data: product });
      }
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (
          id,
          image_url,
          display_order
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      // 에러 시 샘플 데이터에서 찾기
      const product = sampleProducts.find(p => p.id === params.id);
      if (product) {
        return NextResponse.json({ data: product });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Server error:', error);
    // 서버 에러 시 샘플 데이터 사용
    const product = sampleProducts.find(p => p.id === params.id);
    if (product) {
      return NextResponse.json({ data: product });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, brand, price, category, description, stock, images } = body;

    // 상품 업데이트
    const { data: product, error: productError } = await supabase
      .from('products')
      .update({
        name,
        brand,
        price,
        category,
        description,
        stock,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (productError) {
      console.error('Error updating product:', productError);
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }

    // 기존 이미지 삭제
    await supabase
      .from('product_images')
      .delete()
      .eq('product_id', params.id);

    // 새 이미지 저장
    if (images && images.length > 0) {
      const imageRecords = images.map((imageUrl: string, index: number) => ({
        product_id: params.id,
        image_url: imageUrl,
        display_order: index
      }));

      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(imageRecords);

      if (imagesError) {
        console.error('Error saving product images:', imagesError);
      }
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 이미지 먼저 삭제
    await supabase
      .from('product_images')
      .delete()
      .eq('product_id', params.id);

    // 상품 삭제
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting product:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}