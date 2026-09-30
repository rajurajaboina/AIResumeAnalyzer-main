package com.resumeanalyzer.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Document(collection = "resume_analyses")
public class ResumeAnalysis {
    
    @Id
    private String id;
    
    private String userId;
    private String resumeId;
    private String jobDescription;
    
    private int atsScore;
    private Integer previousAtsScore;
    
    private List<String> matchedKeywords = new ArrayList<>();
    private List<String> missingKeywords = new ArrayList<>();
    private List<String> matchedSkills = new ArrayList<>();
    private List<String> missingSkills = new ArrayList<>();
    
    private Map<String, String> sectionFeedback = new HashMap<>();
    private List<String> aiSuggestions = new ArrayList<>();
    private List<Map<String, String>> improvedBullets = new ArrayList<>();
    private String finalRecommendation = "";
    
    private LocalDateTime createdAt;
    
    public ResumeAnalysis() {
        this.createdAt = LocalDateTime.now();
    }
    
    public ResumeAnalysis(String userId, String resumeId, String jobDescription) {
        this();
        this.userId = userId;
        this.resumeId = resumeId;
        this.jobDescription = jobDescription;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getResumeId() { return resumeId; }
    public void setResumeId(String resumeId) { this.resumeId = resumeId; }

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }

    public int getAtsScore() { return atsScore; }
    public void setAtsScore(int atsScore) { this.atsScore = atsScore; }

    public Integer getPreviousAtsScore() { return previousAtsScore; }
    public void setPreviousAtsScore(Integer previousAtsScore) { this.previousAtsScore = previousAtsScore; }

    public List<String> getMatchedKeywords() { return matchedKeywords; }
    public void setMatchedKeywords(List<String> matchedKeywords) { this.matchedKeywords = matchedKeywords; }

    public List<String> getMissingKeywords() { return missingKeywords; }
    public void setMissingKeywords(List<String> missingKeywords) { this.missingKeywords = missingKeywords; }

    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }

    public List<String> getMissingSkills() { return missingSkills; }
    public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

    public Map<String, String> getSectionFeedback() { return sectionFeedback; }
    public void setSectionFeedback(Map<String, String> sectionFeedback) { this.sectionFeedback = sectionFeedback; }

    public List<String> getAiSuggestions() { return aiSuggestions; }
    public void setAiSuggestions(List<String> aiSuggestions) { this.aiSuggestions = aiSuggestions; }

    public List<Map<String, String>> getImprovedBullets() { return improvedBullets; }
    public void setImprovedBullets(List<Map<String, String>> improvedBullets) { this.improvedBullets = improvedBullets; }

    public String getFinalRecommendation() { return finalRecommendation; }
    public void setFinalRecommendation(String finalRecommendation) { this.finalRecommendation = finalRecommendation; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
