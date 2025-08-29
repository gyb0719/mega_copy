// RLS를 우회하는 임시 API (개발용)
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 직접 Supabase 클라이언트 생성 (서버 사이드)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Bypass API - 상품 등록 시도:', body.name)
    
    // 먼저 brands 테이블에서 브랜드 확인/생성
    let brandId = null
    if (body.brand) {
      const { data: existingBrand } = await supabase
        .from('brands')
        .select('id')
        .eq('name', body.brand)
        .single()
      
      if (existingBrand) {
        brandId = existingBrand.id
      } else {
        // 새 브랜드 생성
        const { data: newBrand, error: brandError } = await supabase
          .from('brands')
          .insert({ name: body.brand })
          .select('id')
          .single()
        
        if (brandError) {
          console.error('브랜드 생성 실패:', brandError)
          // 브랜드 생성 실패해도 계속 진행
        } else if (newBrand) {
          brandId = newBrand.id
        }
      }
    }
    
    // 상품 데이터 준비
    const productData = {
      name: body.name,
      description: body.description || '',
      price: body.price,
      discount_price: body.discount_price || null,
      category: body.category,
      brand_id: brandId,
      stock_quantity: body.stockQuantity || 10,
      is_featured: body.isFeatured || false,
      is_available: body.isAvailable !== false,
      thumbnail_url: body.images?.[0]?.url || null,
      images: body.images || []
    }
    
    console.log('상품 데이터:', productData)
    
    // 상품 등록
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase 오류:', error)
      
      // RLS 오류인 경우 특별 처리
      if (error.code === '42501') {
        return NextResponse.json({
          success: false,
          error: 'RLS 정책 오류입니다. Supabase 대시보드에서 products 테이블의 RLS를 비활성화하세요.',
          instructions: [
            '1. https://supabase.com/dashboard 접속',
            '2. 프로젝트 선택',
            '3. Table Editor > products 테이블',
            '4. 우측 상단 "RLS disabled/enabled" 토글',
            '5. RLS를 "disabled"로 변경'
          ]
        }, { status: 403 })
      }
      
      throw error
    }
    
    console.log('상품 등록 성공:', data)
    
    return NextResponse.json({
      success: true,
      data
    })
    
  } catch (error) {
    console.error('API 오류:', error)
    return NextResponse.json({
      success: false,
      error: '상품 등록 실패',
      details: error
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0
    const search = searchParams.get('search')
    
    let query = supabase
      .from('products')
      .select('*, brand:brands(*)', { count: 'exact' })
    
    // 카테고리 필터
    if (category) {
      const decodedCategory = decodeURIComponent(category)
      // 디버깅: 카테고리 값 확인
      console.log('카테고리 디버깅:', {
        raw: category,
        decoded: decodedCategory,
        length: decodedCategory.length,
        charCodes: Array.from(decodedCategory).map(c => c.charCodeAt(0))
      })
      query = query.eq('category', decodedCategory)
    }
    
    // 검색 필터
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    // 정렬 및 페이지네이션
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    // 전체 상품 조회해서 카테고리 확인 (디버깅용)
    if (category && data?.length === 0) {
      const { data: allProducts } = await supabase
        .from('products')
        .select('id, category')
      console.log('전체 상품의 카테고리:', allProducts?.map(p => ({
        id: p.id,
        category: p.category,
        length: p.category?.length,
        charCodes: p.category ? Array.from(p.category).map((c) => (c as string).charCodeAt(0)) : []
      })))
    }
    
    console.log(`조회 결과: 카테고리=${category ? decodeURIComponent(category) : 'all'}, 개수=${data?.length}, 전체=${count}`)
    
    return NextResponse.json({
      success: true,
      data: data || [],
      totalCount: count || 0
    })
  } catch (error) {
    console.error('조회 오류:', error)
    return NextResponse.json({
      success: false,
      error: '상품 조회 실패'
    }, { status: 500 })
  }
}