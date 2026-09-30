package com.resumeanalyzer.dto;

import jakarta.validation.constraints.NotBlank;

public class BulletRewriteRequest {

    @NotBlank(message = "Original bullet point is required")
    private String originalBullet;

    private String rewriteType = "professional"; // professional, technical, shorter, fresher

    public BulletRewriteRequest() {}

    public String getOriginalBullet() { return originalBullet; }
    public void setOriginalBullet(String originalBullet) { this.originalBullet = originalBullet; }

    public String getRewriteType() { return rewriteType; }
    public void setRewriteType(String rewriteType) { this.rewriteType = rewriteType; }
}
