package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.BulletRewriteRequest;
import com.resumeanalyzer.dto.BulletRewriteResponse;
import com.resumeanalyzer.service.AiService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {
    
    @Autowired
    private AiService aiService;
    
    private ObjectMapper objectMapper = new ObjectMapper();
    
    @PostMapping("/extract-keywords")
    public ResponseEntity<String> extractKeywords(@RequestBody String jobDescription) {
        String response = aiService.extractKeywords(jobDescription);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/improve-bullet")
    public ResponseEntity<BulletRewriteResponse> improveBullet(@RequestBody BulletRewriteRequest request) {
        String aiResponse = aiService.rewriteBulletPoint(request.getOriginalBullet(), request.getRewriteType());
        
        try {
            JsonNode responseJson = objectMapper.readTree(aiResponse);
            BulletRewriteResponse response = new BulletRewriteResponse(
                responseJson.get("originalBullet").asText(),
                responseJson.get("rewrittenBullet").asText(),
                responseJson.get("explanation").asText()
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI response");
        }
    }
    
    @PostMapping("/generate-summary")
    public ResponseEntity<String> generateSummary(@RequestBody String request) {
        // Parse request to extract resumeText and jobDescription
        try {
            JsonNode jsonNode = objectMapper.readTree(request);
            String resumeText = jsonNode.get("resumeText").asText();
            String jobDescription = jsonNode.get("jobDescription").asText();
            String response = aiService.generateSummary(resumeText, jobDescription);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RuntimeException("Invalid request format");
        }
    }
    
    @PostMapping("/suggest-skills")
    public ResponseEntity<String> suggestSkills(@RequestBody String request) {
        try {
            JsonNode jsonNode = objectMapper.readTree(request);
            String resumeText = jsonNode.get("resumeText").asText();
            String jobDescription = jsonNode.get("jobDescription").asText();
            String response = aiService.suggestSkills(resumeText, jobDescription);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RuntimeException("Invalid request format");
        }
    }
    
    @PostMapping("/generate-cover-letter")
    public ResponseEntity<String> generateCoverLetter(@RequestBody String request) {
        try {
            JsonNode jsonNode = objectMapper.readTree(request);
            String resumeText = jsonNode.get("resumeText").asText();
            String jobDescription = jsonNode.get("jobDescription").asText();
            String userName = jsonNode.get("userName").asText();
            String response = aiService.generateCoverLetter(resumeText, jobDescription, userName);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            throw new RuntimeException("Invalid request format");
        }
    }
}
