package com.resumeanalyzer.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Document(collection = "resume_templates")
public class ResumeTemplate {
    
    @Id
    private String id;
    
    private String userId;
    private String resumeId;
    private String templateName;
    
    private Map<String, Object> resumeData = new HashMap<>();
    private String downloadUrl;
    
    private LocalDateTime createdAt;
    
    public ResumeTemplate() {
        this.createdAt = LocalDateTime.now();
    }
    
    public ResumeTemplate(String userId, String resumeId, String templateName) {
        this();
        this.userId = userId;
        this.resumeId = resumeId;
        this.templateName = templateName;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getResumeId() { return resumeId; }
    public void setResumeId(String resumeId) { this.resumeId = resumeId; }

    public String getTemplateName() { return templateName; }
    public void setTemplateName(String templateName) { this.templateName = templateName; }

    public Map<String, Object> getResumeData() { return resumeData; }
    public void setResumeData(Map<String, Object> resumeData) { this.resumeData = resumeData; }

    public String getDownloadUrl() { return downloadUrl; }
    public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
