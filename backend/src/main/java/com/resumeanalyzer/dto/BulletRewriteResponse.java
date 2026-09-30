package com.resumeanalyzer.dto;

public class BulletRewriteResponse {
    private String originalBullet;
    private String rewrittenBullet;
    private String explanation;

    public BulletRewriteResponse() {}

    public BulletRewriteResponse(String originalBullet, String rewrittenBullet, String explanation) {
        this.originalBullet = originalBullet;
        this.rewrittenBullet = rewrittenBullet;
        this.explanation = explanation;
    }

    public String getOriginalBullet() { return originalBullet; }
    public void setOriginalBullet(String originalBullet) { this.originalBullet = originalBullet; }

    public String getRewrittenBullet() { return rewrittenBullet; }
    public void setRewrittenBullet(String rewrittenBullet) { this.rewrittenBullet = rewrittenBullet; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
}
