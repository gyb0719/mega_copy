import { v2 as cloudinary } from 'cloudinary';
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
declare class CloudinaryService {
    private static instance;
    private constructor();
    static getInstance(): CloudinaryService;
    uploadFile(filePath: string | Buffer, options?: UploadOptions): Promise<UploadResult>;
    uploadMultipleFiles(files: (string | Buffer)[], options?: UploadOptions): Promise<UploadResult[]>;
    deleteFile(publicId: string, resourceType?: 'image' | 'video' | 'raw'): Promise<any>;
    deleteMultipleFiles(publicIds: string[], resourceType?: 'image' | 'video' | 'raw'): Promise<any>;
    generateUrl(publicId: string, transformations?: any): string;
    generateThumbnailUrl(publicId: string, width?: number, height?: number): string;
}
export default CloudinaryService;
export { cloudinary };
//# sourceMappingURL=cloudinary.d.ts.map