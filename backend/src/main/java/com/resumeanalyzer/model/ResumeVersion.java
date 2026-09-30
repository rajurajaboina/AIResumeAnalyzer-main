package com.resumeanalyzer.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "resume_versions")
public class ResumeVersion {

    @Id
    private String id;

    private String resumeId;
    private String userId;
    private int versionNumber;
    private String title;
    private ResumeData resumeData;
    private String latexContent;
    private String template;
    private int atsScore;
    private String changeSummary;
    private LocalDateTime createdAt;

    public ResumeVersion() {
        this.createdAt = LocalDateTime.now();
    }

    public ResumeVersion(String resumeId, String userId, int versionNumber, String title,
                         ResumeData resumeData, String latexContent, String template,
                         int atsScore, String changeSummary) {
        this();
        this.resumeId = resumeId;
        this.userId = userId;
        this.versionNumber = versionNumber;
        this.title = title;
        this.resumeData = resumeData;
        this.latexContent = latexContent;
        this.template = template;
        this.atsScore = atsScore;
        this.changeSummary = changeSummary;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getResumeId() { return resumeId; }
    public void setResumeId(String resumeId) { this.resumeId = resumeId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public int getVersionNumber() { return versionNumber; }
    public void setVersionNumber(int versionNumber) { this.versionNumber = versionNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public ResumeData getResumeData() { return resumeData; }
    public void setResumeData(ResumeData resumeData) { this.resumeData = resumeData; }

    public String getLatexContent() { return latexContent; }
    public void setLatexContent(String latexContent) { this.latexContent = latexContent; }

    public String getTemplate() { return template; }
    public void setTemplate(String template) { this.template = template; }

    public int getAtsScore() { return atsScore; }
    public void setAtsScore(int atsScore) { this.atsScore = atsScore; }

    public String getChangeSummary() { return changeSummary; }
    public void setChangeSummary(String changeSummary) { this.changeSummary = changeSummary; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
