package com.resumeanalyzer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.resumeanalyzer.dto.AnalysisRequest;
import com.resumeanalyzer.dto.AnalysisResponse;
import com.resumeanalyzer.model.Resume;
import com.resumeanalyzer.model.ResumeAnalysis;
import com.resumeanalyzer.repository.ResumeAnalysisRepository;
import com.resumeanalyzer.repository.ResumeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalysisService {
    
    @Autowired
    private ResumeRepository resumeRepository;
    
    @Autowired
    private ResumeAnalysisRepository analysisRepository;
    
    @Autowired
    private AiService aiService;
    
    private ObjectMapper objectMapper = new ObjectMapper();
    
    public AnalysisResponse analyzeResume(AnalysisRequest request, String userId) {
        Resume resume = resumeRepository.findById(request.getResumeId())
            .orElseThrow(() -> new RuntimeException("Resume not found"));
        
        // Call AI service for analysis
        String aiResponse = aiService.analyzeResume(resume.getOriginalResumeText(), request.getJobDescription());
        
        // Parse AI response
        JsonNode responseJson;
        try {
            responseJson = objectMapper.readTree(aiResponse);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI response");
        }
        
        // Extract data from AI response
        int atsScore = responseJson.get("atsScore").asInt();
        
        List<String> matchedKeywords = parseStringArray(responseJson, "matchedKeywords");
        List<String> missingKeywords = parseStringArray(responseJson, "missingKeywords");
        List<String> matchedSkills = parseStringArray(responseJson, "matchedSkills");
        List<String> missingSkills = parseStringArray(responseJson, "missingSkills");
        
        Map<String, String> sectionFeedback = parseSectionFeedback(responseJson);
        List<String> aiSuggestions = parseStringArray(responseJson, "aiSuggestions");
        List<Map<String, String>> improvedBullets = parseImprovedBullets(responseJson);
        String finalRecommendation = responseJson.get("finalRecommendation").asText();
        
        // Save analysis to database
        ResumeAnalysis analysis = new ResumeAnalysis(userId, resume.getId(), request.getJobDescription());
        analysis.setAtsScore(atsScore);
        analysis.setMatchedKeywords(matchedKeywords);
        analysis.setMissingKeywords(missingKeywords);
        analysis.setMatchedSkills(matchedSkills);
        analysis.setMissingSkills(missingSkills);
        analysis.setSectionFeedback(sectionFeedback);
        analysis.setAiSuggestions(aiSuggestions);
        analysis.setImprovedBullets(improvedBullets);
        analysis.setFinalRecommendation(finalRecommendation);
        
        analysis = analysisRepository.save(analysis);
        
        return new AnalysisResponse(
            analysis.getId(),
            resume.getId(),
            atsScore,
            null,
            matchedKeywords,
            missingKeywords,
            matchedSkills,
            missingSkills,
            sectionFeedback,
            aiSuggestions,
            improvedBullets,
            finalRecommendation
        );
    }
    
    public AnalysisResponse reanalyzeResume(String analysisId, String userId) {
        ResumeAnalysis existingAnalysis = analysisRepository.findById(analysisId)
            .orElseThrow(() -> new RuntimeException("Analysis not found"));
        
        Resume resume = resumeRepository.findById(existingAnalysis.getResumeId())
            .orElseThrow(() -> new RuntimeException("Resume not found"));
        
        // Use optimized resume text if available
        String resumeText = resume.getOptimizedResumeText() != null ? 
            resume.getOptimizedResumeText() : resume.getOriginalResumeText();
        
        AnalysisRequest request = new AnalysisRequest();
        request.setResumeId(resume.getId());
        request.setJobDescription(existingAnalysis.getJobDescription());
        
        AnalysisResponse newResponse = analyzeResume(request, userId);
        
        // Update with previous score
        newResponse.setPreviousAtsScore(existingAnalysis.getAtsScore());
        
        return newResponse;
    }
    
    public ResumeAnalysis getAnalysisById(String id) {
        return analysisRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Analysis not found"));
    }
    
    public List<ResumeAnalysis> getUserAnalyses(String userId) {
        return analysisRepository.findByUserId(userId);
    }
    
    public void deleteAnalysis(String id, String userId) {
        ResumeAnalysis existing = getAnalysisById(id);
        if (!existing.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this analysis");
        }
        analysisRepository.deleteById(id);
    }

    
    private List<String> parseStringArray(JsonNode node, String fieldName) {
        List<String> result = new ArrayList<>();
        if (node.has(fieldName) && node.get(fieldName).isArray()) {
            for (JsonNode item : node.get(fieldName)) {
                result.add(item.asText());
            }
        }
        return result;
    }
    
    private Map<String, String> parseSectionFeedback(JsonNode node) {
        Map<String, String> result = new HashMap<>();
        if (node.has("sectionFeedback") && node.get("sectionFeedback").isObject()) {
            JsonNode feedbackNode = node.get("sectionFeedback");
            feedbackNode.fields().forEachRemaining(entry -> {
                result.put(entry.getKey(), entry.getValue().asText());
            });
        }
        return result;
    }
    
    private List<Map<String, String>> parseImprovedBullets(JsonNode node) {
        List<Map<String, String>> result = new ArrayList<>();
        if (node.has("improvedBullets") && node.get("improvedBullets").isArray()) {
            for (JsonNode bullet : node.get("improvedBullets")) {
                Map<String, String> bulletMap = new HashMap<>();
                bulletMap.put("before", bullet.get("before").asText());
                bulletMap.put("after", bullet.get("after").asText());
                result.add(bulletMap);
            }
        }
        return result;
    }
}
