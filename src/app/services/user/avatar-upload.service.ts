import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface AvatarValidationResult {
    isValid: boolean;
    errors: string[];
}

export interface AvatarUploadOptions {
    maxSizeBytes?: number;
    allowedTypes?: string[];
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
}

@Injectable({
    providedIn: 'root'
})
export class AvatarUploadService {
    private readonly DEFAULT_OPTIONS: AvatarUploadOptions = {
        maxSizeBytes: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8
    };

    constructor() { }

    /**
     * Validate avatar file before upload
     */
    validateAvatarFile(file: File, options?: AvatarUploadOptions): AvatarValidationResult {
        const opts = { ...this.DEFAULT_OPTIONS, ...options };
        const errors: string[] = [];

        // Check file size
        if (file.size > opts.maxSizeBytes!) {
            errors.push(`File size must be less than ${this.formatFileSize(opts.maxSizeBytes!)}`);
        }

        // Check file type
        if (!opts.allowedTypes!.includes(file.type)) {
            errors.push(`File type must be one of: ${opts.allowedTypes!.join(', ')}`);
        }

        // Check if file is actually an image
        if (!file.type.startsWith('image/')) {
            errors.push('File must be an image');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Create image preview from file
     */
    createImagePreview(file: File): Observable<string> {
        return new Observable(observer => {
            const reader = new FileReader();

            reader.onload = (e) => {
                observer.next(e.target?.result as string);
                observer.complete();
            };

            reader.onerror = (error) => {
                observer.error(new Error('Failed to read file'));
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * Resize and compress image before upload
     */
    processImageFile(file: File, options?: AvatarUploadOptions): Observable<File> {
        const opts = { ...this.DEFAULT_OPTIONS, ...options };

        return new Observable(observer => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                // Calculate new dimensions
                const { width, height } = this.calculateDimensions(
                    img.width,
                    img.height,
                    opts.maxWidth!,
                    opts.maxHeight!
                );

                // Set canvas size
                canvas.width = width;
                canvas.height = height;

                // Draw and compress image
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const processedFile = new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now()
                            });
                            observer.next(processedFile);
                            observer.complete();
                        } else {
                            observer.error(new Error('Failed to process image'));
                        }
                    },
                    file.type,
                    opts.quality
                );
            };

            img.onerror = () => {
                observer.error(new Error('Failed to load image'));
            };

            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Get image dimensions from file
     */
    getImageDimensions(file: File): Observable<{ width: number; height: number }> {
        return new Observable(observer => {
            const img = new Image();

            img.onload = () => {
                observer.next({ width: img.width, height: img.height });
                observer.complete();
                URL.revokeObjectURL(img.src);
            };

            img.onerror = () => {
                observer.error(new Error('Failed to load image'));
                URL.revokeObjectURL(img.src);
            };

            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Generate thumbnail from image file
     */
    generateThumbnail(file: File, size: number = 150): Observable<string> {
        return new Observable(observer => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                canvas.width = size;
                canvas.height = size;

                // Calculate crop dimensions for square thumbnail
                const minDimension = Math.min(img.width, img.height);
                const sx = (img.width - minDimension) / 2;
                const sy = (img.height - minDimension) / 2;

                ctx?.drawImage(img, sx, sy, minDimension, minDimension, 0, 0, size, size);

                const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                observer.next(thumbnailDataUrl);
                observer.complete();
                URL.revokeObjectURL(img.src);
            };

            img.onerror = () => {
                observer.error(new Error('Failed to generate thumbnail'));
                URL.revokeObjectURL(img.src);
            };

            img.src = URL.createObjectURL(file);
        });
    }

    /**
     * Calculate optimal dimensions while maintaining aspect ratio
     */
    private calculateDimensions(
        originalWidth: number,
        originalHeight: number,
        maxWidth: number,
        maxHeight: number
    ): { width: number; height: number } {
        let { width, height } = { width: originalWidth, height: originalHeight };

        // If image is larger than max dimensions, scale it down
        if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;

            if (width > height) {
                width = maxWidth;
                height = width / aspectRatio;
            } else {
                height = maxHeight;
                width = height * aspectRatio;
            }
        }

        return { width: Math.round(width), height: Math.round(height) };
    }

    /**
     * Format file size for display
     */
    private formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Check if browser supports required features
     */
    isSupported(): boolean {
        return !!(
            window.FileReader &&
            window.File &&
            window.FileList &&
            window.Blob &&
            document.createElement('canvas').getContext
        );
    }
}