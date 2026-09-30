package com.resumeanalyzer.dto;

import java.util.List;
import java.util.Map;

public class AnalysisResponse {
    private String analysisId;
    private String resumeId;
    private int atsScore;
    private Integer previousAtsScore;
    private List<String> matchedKeywords;
    private List<String> missingKeywords;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private Map<String, String> sectionFeedback;
    private List<String> aiSuggestions;
    private List<Map<String, String>> improvedBullets;
    private String finalRecommendation;

    public AnalysisResponse() {}

    public AnalysisResponse(String analysisId, String resumeId, int atsScore, Integer previousAtsScore,
                            List<String> matchedKeywords, List<String> missingKeywords,
                            List<String> matchedSkills, List<String> missingSkills,
                            Map<String, String> sectionFeedback, List<String> aiSuggestions,
                            List<Map<String, String>> improvedBullets, String finalRecommendation) {
        this.analysisId = analysisId;
        this.resumeId = resumeId;
        this.atsScore = atsScore;
        this.previousAtsScore = previousAtsScore;
        this.matchedKeywords = matchedKeywords;
        this.missingKeywords = missingKeywords;
        this.matchedSkills = matchedSkills;
        this.missingSkills = missingSkills;
        this.sectionFeedback = sectionFeedback;
        this.aiSuggestions = aiSuggestions;
        this.improvedBullets = improvedBullets;
        this.finalRecommendation = finalRecommendation;
    }

    public String getAnalysisId() { return analysisId; }
    public void setAnalysisId(String analysisId) { this.analysisId = analysisId; }

    public String getResumeId() { return resumeId; }
    public void setResumeId(String resumeId) { this.resumeId = resumeId; }

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
}
