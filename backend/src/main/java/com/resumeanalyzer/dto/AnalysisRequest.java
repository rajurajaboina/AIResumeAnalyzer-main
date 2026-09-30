package com.resumeanalyzer.dto;

import jakarta.validation.constraints.NotBlank;

public class AnalysisRequest {
    
    @NotBlank(message = "Resume ID is required")
    private String resumeId;
    
    @NotBlank(message = "Job description is required")
    private String jobDescription;

    public AnalysisRequest() {}

    public AnalysisRequest(String resumeId, String jobDescription) {
        this.resumeId = resumeId;
        this.jobDescription = jobDescription;
    }

    public String getResumeId() { return resumeId; }
    public void setResumeId(String resumeId) { this.resumeId = resumeId; }

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
}
