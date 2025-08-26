import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    
    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // 이미지 리사이징 (최대 1920px 너비, 품질 유지)
      const resizedBuffer = await sharp(buffer)
        .resize(1920, null, {
          withoutEnlargement: true,
          fit: 'inside'
        })
        .webp({ quality: 85 })
        .toBuffer();

      // 파일명 생성 (타임스탬프 + 랜덤 문자열)
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
      const filePath = `products/${fileName}`;

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, resizedBuffer, {
          contentType: 'image/webp',
          cacheControl: '3600'
        });

      if (error) {
        console.error('Error uploading image:', error);
        continue;
      }

      // 공개 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl);
    }

    return NextResponse.json({ 
      urls: uploadedUrls,
      message: `${uploadedUrls.length}개의 이미지가 업로드되었습니다.` 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '이미지 업로드 실패' }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    }
  }
};