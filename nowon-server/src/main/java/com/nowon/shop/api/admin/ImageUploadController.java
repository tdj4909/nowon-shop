package com.nowon.shop.api.admin;

import com.nowon.shop.global.common.ApiResponse;
import com.nowon.shop.global.image.ImageUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Admin — Images", description = "Image upload — ADMIN role required")
@RestController
@RequestMapping("/api/admin/images")
@RequiredArgsConstructor
public class ImageUploadController {

    private final ImageUploadService imageUploadService;

    @Operation(summary = "Upload product image", description = "Uploads an image to Cloudinary and returns the URL")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> upload(
            @RequestPart("file") MultipartFile file
    ) {
        String imageUrl = imageUploadService.upload(file);
        return ResponseEntity.ok(ApiResponse.ok(imageUrl));
    }
}
