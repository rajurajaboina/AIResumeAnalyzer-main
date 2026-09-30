package com.resumeanalyzer.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "cover_letters")
public class CoverLetter {
    
    @Id
    private String id;
    
    private String userId;
    private String resumeId;
    private String jobDescription;
    private String coverLetterText;
    
    private LocalDateTime createdAt;
    
    public CoverLetter() {
        this.createdAt = LocalDateTime.now();
    }
    
    public CoverLetter(String userId, String resumeId, String jobDescription, String coverLetterText) {
        this();
        this.userId = userId;
        this.resumeId = resumeId;
        this.jobDescription = jobDescription;
        this.coverLetterText = coverLetterText;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getResumeId() { return resumeId; }
    public void setResumeId(String resumeId) { this.resumeId = resumeId; }

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }

    public String getCoverLetterText() { return coverLetterText; }
    public void setCoverLetterText(String coverLetterText) { this.coverLetterText = coverLetterText; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
