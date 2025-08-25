import { v2 as cloudinary } from 'cloudinary';
import config from './index';

// Cloudinary 설정
if (config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY && config.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: config.CLOUDINARY_CLOUD_NAME,
    api_key: config.CLOUDINARY_API_KEY,
    api_secret: config.CLOUDINARY_API_SECRET,
    secure: true
  });
  
  console.log('✅ Cloudinary 설정이 완료되었습니다');
} else {
  console.warn('⚠️  Cloudinary 환경 변수가 설정되지 않았습니다. 이미지 업로드 기능이 제한됩니다.');
}

export interface UploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  overwrite?: boolean;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  quality?: string | number;
  format?: string;
  transformation?: any[];
}

class CloudinaryService {
  private static instance: CloudinaryService;
  
  private constructor() {}
  
  public static getInstance(): CloudinaryService {
    if (!CloudinaryService.instance) {
      CloudinaryService.instance = new CloudinaryService();
    }
    return CloudinaryService.instance;
  }
  
  /**
   * 파일을 Cloudinary에 업로드
   * @param filePath 업로드할 파일 경로 또는 Buffer
   * @param options 업로드 옵션
   * @returns 업로드 결과
   */
  public async uploadFile(
    filePath: string | Buffer,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const defaultOptions: UploadOptions = {
        folder: 'devyb-shop',
        resource_type: 'auto',
        quality: 'auto:good',
        ...options
      };
      
      const result = await cloudinary.uploader.upload(filePath as string, defaultOptions);
      
      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes
      };
    } catch (error) {
      console.error('❌ Cloudinary 업로드 오류:', error);
      throw new Error('이미지 업로드에 실패했습니다.');
    }
  }
  
  /**
   * 여러 파일을 동시에 업로드
   * @param files 업로드할 파일들
   * @param options 업로드 옵션
   * @returns 업로드 결과 배열
   */
  public async uploadMultipleFiles(
    files: (string | Buffer)[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    try {
      const uploadPromises = files.map((file, index) => 
        this.uploadFile(file, { 
          ...options, 
          public_id: options.public_id ? `${options.public_id}_${index}` : undefined 
        })
      );
      
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('❌ 다중 파일 업로드 오류:', error);
      throw new Error('이미지 업로드에 실패했습니다.');
    }
  }
  
  /**
   * 파일 삭제
   * @param publicId 삭제할 파일의 public_id
   * @param resourceType 리소스 타입
   * @returns 삭제 결과
   */
  public async deleteFile(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image'
  ): Promise<any> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      
      return result;
    } catch (error) {
      console.error('❌ Cloudinary 파일 삭제 오류:', error);
      throw new Error('이미지 삭제에 실패했습니다.');
    }
  }
  
  /**
   * 여러 파일을 동시에 삭제
   * @param publicIds 삭제할 파일들의 public_id 배열
   * @param resourceType 리소스 타입
   * @returns 삭제 결과
   */
  public async deleteMultipleFiles(
    publicIds: string[],
    resourceType: 'image' | 'video' | 'raw' = 'image'
  ): Promise<any> {
    try {
      const result = await cloudinary.api.delete_resources(publicIds, {
        resource_type: resourceType
      });
      
      return result;
    } catch (error) {
      console.error('❌ 다중 파일 삭제 오류:', error);
      throw new Error('이미지 삭제에 실패했습니다.');
    }
  }
  
  /**
   * 이미지 URL 생성 (변환 포함)
   * @param publicId public_id
   * @param transformations 변환 옵션
   * @returns 변환된 이미지 URL
   */
  public generateUrl(publicId: string, transformations: any = {}): string {
    return cloudinary.url(publicId, {
      secure: true,
      ...transformations
    });
  }
  
  /**
   * 썸네일 URL 생성
   * @param publicId public_id
   * @param width 너비 (기본값: 300)
   * @param height 높이 (기본값: 300)
   * @returns 썸네일 URL
   */
  public generateThumbnailUrl(publicId: string, width: number = 300, height: number = 300): string {
    return this.generateUrl(publicId, {
      width,
      height,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto:good'
    });
  }
}

export default CloudinaryService;
export { cloudinary };