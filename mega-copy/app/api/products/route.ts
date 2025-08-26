import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sampleProducts } from '@/lib/sampleData';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Supabase 연결 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'https://your-project.supabase.co' || 
        supabaseKey === 'your-anon-key-here') {
      // Supabase가 설정되지 않은 경우 샘플 데이터 사용
      console.log('Using sample data - Supabase not configured');
      
      let filteredProducts = [...sampleProducts];
      
      if (category && category !== '전체') {
        filteredProducts = filteredProducts.filter(p => p.category === category);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) || 
          p.brand.toLowerCase().includes(searchLower)
        );
      }
      
      const paginatedProducts = filteredProducts.slice(offset, offset + limit);
      
      return NextResponse.json({ 
        data: paginatedProducts,
        total: filteredProducts.length 
      });
    }

    // Supabase 쿼리
    let query = supabase
      .from('products')
      .select(`
        *,
        product_images (
          id,
          image_url,
          display_order
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== '전체') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      // Supabase 에러 시 샘플 데이터 반환
      return NextResponse.json({ 
        data: sampleProducts.slice(offset, offset + limit),
        total: sampleProducts.length,
        warning: 'Using sample data due to database error' 
      });
    }

    return NextResponse.json({ data, total: data?.length || 0 });
  } catch (error) {
    console.error('Server error:', error);
    // 서버 에러 시 샘플 데이터 반환
    return NextResponse.json({ 
      data: sampleProducts.slice(0, 20),
      total: sampleProducts.length,
      warning: 'Using sample data' 
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, brand, price, category, description, stock, images } = body;

    // 상품 생성
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name,
        brand,
        price,
        category,
        description,
        stock: stock || 10
      })
      .select()
      .single();

    if (productError) {
      console.error('Error creating product:', productError);
      return NextResponse.json({ error: productError.message }, { status: 500 });
    }

    // 이미지 저장
    if (images && images.length > 0) {
      const imageRecords = images.map((imageUrl: string, index: number) => ({
        product_id: product.id,
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