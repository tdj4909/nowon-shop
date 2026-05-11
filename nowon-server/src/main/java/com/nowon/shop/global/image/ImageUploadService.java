package com.nowon.shop.global.image;

import org.springframework.web.multipart.MultipartFile;

public interface ImageUploadService {
    /**
     * 이미지를 업로드하고 URL을 반환한다.
     * 나중에 S3 등 다른 구현체로 교체할 때 이 인터페이스만 유지하면 된다.
     */
    String upload(MultipartFile file);
}
