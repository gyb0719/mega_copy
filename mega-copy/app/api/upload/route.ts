import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화 (anon key 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nzmscqfrmxqcukhshsok.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bXNjcWZybXhxY3VraHNoc29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTg1NDMsImV4cCI6MjA3MTc5NDU0M30.o0zQtPEjsuJnfQnY2MiakuM2EvTlVuRO9yeoajrwiLU';

// Service Role Key가 있으면 사용 (RLS 우회)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(
  supabaseUrl, 
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  console.log('[Upload API] 업로드 요청 받음');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('[Upload API] 파일이 없습니다');
      return NextResponse.json(
        { error: '파일이 없습니다' },
        { status: 400 }
      );
    }

    console.log('[Upload API] 파일 정보:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('[Upload API] 파일 크기 초과:', file.size);
      return NextResponse.json(
        { error: '파일 크기는 5MB 이하여야 합니다' },
        { status: 400 }
      );
    }

    // 파일명 생성
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    console.log('[Upload API] 생성된 파일명:', fileName);
    
    // 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Supabase Storage에 업로드
    console.log('[Upload API] Supabase Storage 업로드 시작...');
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('[Upload API] Storage 업로드 에러:', {
        message: error.message,
        error: error
      });
      
      // RLS 에러인 경우 더 자세한 메시지
      if (error.message?.includes('row-level security') || error.message?.includes('RLS')) {
        return NextResponse.json(
          { 
            error: 'Storage 권한 오류입니다. Supabase 대시보드에서 product-images 버킷의 RLS 정책을 확인해주세요.',
            details: error.message,
            solution: 'FIX_STORAGE_RLS.sql 파일을 Supabase SQL Editor에서 실행하세요'
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: error.message || '이미지 업로드 실패' },
        { status: 500 }
      );
    }

    console.log('[Upload API] 업로드 성공:', data);

    // Public URL 생성
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
    
    console.log('[Upload API] Public URL 생성:', publicUrl);

    return NextResponse.json({ url: publicUrl });

  } catch (error: any) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}