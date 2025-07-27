import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { AvatarValidationResult, AvatarUploadOptions } from '../../models/user.model';

// Re-export interfaces for backwards compatibility
export { AvatarValidationResult, AvatarUploadOptions } from '../../models/user.model';

/**
 * @deprecated Use UserService instead. This service is maintained for backwards compatibility.
 * All functionality has been consolidated into the main UserService.
 */
@Injectable({
    providedIn: 'root'
})
export class AvatarUploadService {
    // Delegate all functionality to the consolidated UserService
    constructor(private userService: UserService) { }

    /**
     * Validate avatar file before upload
     */
    validateAvatarFile(file: File, options?: AvatarUploadOptions): AvatarValidationResult {
        return this.userService.validateAvatarFile(file, options);
    }

    /**
     * Create image preview from file
     */
    createImagePreview(file: File): Observable<string> {
        return this.userService.createAvatarPreview(file);
    }

    /**
     * Resize and compress image before upload
     */
    processImageFile(file: File, options?: AvatarUploadOptions): Observable<File> {
        return this.userService.processAvatarImage(file, options);
    }

    /**
     * Get image dimensions from file
     */
    getImageDimensions(file: File): Observable<{ width: number; height: number }> {
        return this.userService.getAvatarImageDimensions(file);
    }

    /**
     * Generate thumbnail from image file
     */
    generateThumbnail(file: File, size: number = 150): Observable<string> {
        return this.userService.generateAvatarThumbnail(file, size);
    }

    /**
     * Check if browser supports required features
     */
    isSupported(): boolean {
        return this.userService.isAvatarUploadSupported();
    }
}