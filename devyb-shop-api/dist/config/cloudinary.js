"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinary = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const index_1 = __importDefault(require("./index"));
if (index_1.default.CLOUDINARY_CLOUD_NAME && index_1.default.CLOUDINARY_API_KEY && index_1.default.CLOUDINARY_API_SECRET) {
    cloudinary_1.v2.config({
        cloud_name: index_1.default.CLOUDINARY_CLOUD_NAME,
        api_key: index_1.default.CLOUDINARY_API_KEY,
        api_secret: index_1.default.CLOUDINARY_API_SECRET,
        secure: true
    });
    console.log('✅ Cloudinary 설정이 완료되었습니다');
}
else {
    console.warn('⚠️  Cloudinary 환경 변수가 설정되지 않았습니다. 이미지 업로드 기능이 제한됩니다.');
}
class CloudinaryService {
    static instance;
    constructor() { }
    static getInstance() {
        if (!CloudinaryService.instance) {
            CloudinaryService.instance = new CloudinaryService();
        }
        return CloudinaryService.instance;
    }
    async uploadFile(filePath, options = {}) {
        try {
            const defaultOptions = {
                folder: 'devyb-shop',
                resource_type: 'auto',
                quality: 'auto:good',
                ...options
            };
            const result = await cloudinary_1.v2.uploader.upload(filePath, defaultOptions);
            return {
                public_id: result.public_id,
                secure_url: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes
            };
        }
        catch (error) {
            console.error('❌ Cloudinary 업로드 오류:', error);
            throw new Error('이미지 업로드에 실패했습니다.');
        }
    }
    async uploadMultipleFiles(files, options = {}) {
        try {
            const uploadPromises = files.map((file, index) => this.uploadFile(file, {
                ...options,
                public_id: options.public_id ? `${options.public_id}_${index}` : undefined
            }));
            return await Promise.all(uploadPromises);
        }
        catch (error) {
            console.error('❌ 다중 파일 업로드 오류:', error);
            throw new Error('이미지 업로드에 실패했습니다.');
        }
    }
    async deleteFile(publicId, resourceType = 'image') {
        try {
            const result = await cloudinary_1.v2.uploader.destroy(publicId, {
                resource_type: resourceType
            });
            return result;
        }
        catch (error) {
            console.error('❌ Cloudinary 파일 삭제 오류:', error);
            throw new Error('이미지 삭제에 실패했습니다.');
        }
    }
    async deleteMultipleFiles(publicIds, resourceType = 'image') {
        try {
            const result = await cloudinary_1.v2.api.delete_resources(publicIds, {
                resource_type: resourceType
            });
            return result;
        }
        catch (error) {
            console.error('❌ 다중 파일 삭제 오류:', error);
            throw new Error('이미지 삭제에 실패했습니다.');
        }
    }
    generateUrl(publicId, transformations = {}) {
        return cloudinary_1.v2.url(publicId, {
            secure: true,
            ...transformations
        });
    }
    generateThumbnailUrl(publicId, width = 300, height = 300) {
        return this.generateUrl(publicId, {
            width,
            height,
            crop: 'fill',
            gravity: 'auto',
            quality: 'auto:good'
        });
    }
}
exports.default = CloudinaryService;
//# sourceMappingURL=cloudinary.js.map