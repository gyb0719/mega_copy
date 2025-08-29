// Supabase Direct Client for Cloudflare Pages (정적 사이트)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nzmscqfrmxqcukhshsok.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bXNjcWZybXhxY3VraHNoc29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTg1NDMsImV4cCI6MjA3MTc5NDU0M30.o0zQtPEjsuJnfQnY2MiakuM2EvTlVuRO9yeoajrwiLU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 상품 관련 API (직접 Supabase 호출)
export const productsAPI = {
  // 상품 목록 조회
  async getAll(params?: { category?: string; search?: string; limit?: number; offset?: number }) {
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (params?.category && params.category !== '전체') {
        query = query.eq('category', params.category)
      }

      if (params?.search) {
        query = query.ilike('name', `%${params.search}%`)
      }

      const limit = params?.limit || 20
      const offset = params?.offset || 0
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      return {
        success: true,
        data: data || [],
        totalCount: count || 0
      }
    } catch (error: any) {
      console.error('Failed to fetch products:', error)
      return {
        success: false,
        data: [],
        totalCount: 0,
        error: error.message
      }
    }
  },

  // 특정 상품 조회
  async getById(id: string) {
    try {
      // 먼저 products 테이블에서 조회
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (productError) throw productError

      // product_images 테이블에서 이미지 조회
      const { data: images, error: imagesError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', id)
        .order('display_order', { ascending: true })

      if (!imagesError && images && images.length > 0) {
        product.product_images = images
      }

      return product
    } catch (error: any) {
      console.error('Failed to fetch product:', error)
      return null
    }
  },

  // 상품 생성
  async create(productData: any) {
    try {
      // is_available 기본값 설정
      const dataWithDefaults = {
        ...productData,
        is_available: productData.is_available !== undefined ? productData.is_available : true,
        stock: productData.stock || 0
      }
      
      const { data, error } = await supabase
        .from('products')
        .insert(dataWithDefaults)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      console.error('Failed to create product:', error)
      return { success: false, error: error.message }
    }
  },

  // 상품 수정
  async update(id: string, productData: any) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      console.error('Failed to update product:', error)
      return { success: false, error: error.message }
    }
  },

  // 상품 삭제
  async delete(id: string) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('Failed to delete product:', error)
      return { success: false, error: error.message }
    }
  }
}

// 이미지 업로드 API
export const uploadImage = async (file: File): Promise<{ url?: string; error?: string }> => {
  try {
    // 파일명 생성
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`

    // Supabase Storage에 직접 업로드
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Public URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    return { url: publicUrl }
  } catch (error: any) {
    console.error('Upload failed:', error)
    return { error: error.message || '이미지 업로드 실패' }
  }
}

// 관리자 인증 확인
export const checkAdminAuth = async (password: string) => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id')
      .eq('password', password)
      .single()

    return !error && data
  } catch (error) {
    console.error('Admin auth check failed:', error)
    return false
  }
}