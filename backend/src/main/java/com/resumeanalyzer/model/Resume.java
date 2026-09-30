package com.resumeanalyzer.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "resumes")
public class Resume {
    
    @Id
    private String id;
    
    private String userId;
    private String title = "Untitled Resume";
    private String originalFileName;
    private String originalResumeText;
    private String optimizedResumeText;
    
    private ResumeData resumeData;
    private String latexContent = "";
    private String template = "ats-classic";
    private int atsScore = 0;
    private int version = 1;
    private String jobDescription = "";
    private ResumeAnalysis analysis;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public Resume() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.resumeData = new ResumeData();
    }
    
    public Resume(String userId, String originalFileName, String originalResumeText) {
        this();
        this.userId = userId;
        this.originalFileName = originalFileName;
        this.originalResumeText = originalResumeText;
        this.title = originalFileName != null ? originalFileName.replaceAll("\\.[^.]+$", "") : "Untitled Resume";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }

    public String getOriginalResumeText() { return originalResumeText; }
    public void setOriginalResumeText(String originalResumeText) { this.originalResumeText = originalResumeText; }

    public String getOptimizedResumeText() { return optimizedResumeText; }
    public void setOptimizedResumeText(String optimizedResumeText) { this.optimizedResumeText = optimizedResumeText; }

    public ResumeData getResumeData() { return resumeData; }
    public void setResumeData(ResumeData resumeData) { this.resumeData = resumeData; }

    public String getLatexContent() { return latexContent; }
    public void setLatexContent(String latexContent) { this.latexContent = latexContent; }

    public String getTemplate() { return template; }
    public void setTemplate(String template) { this.template = template; }

    public int getAtsScore() { return atsScore; }
    public void setAtsScore(int atsScore) { this.atsScore = atsScore; }

    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }

    public ResumeAnalysis getAnalysis() { return analysis; }
    public void setAnalysis(ResumeAnalysis analysis) { this.analysis = analysis; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
