package com.resumeanalyzer.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class AiServiceTest {

    private AiService aiService;
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setUp() {
        aiService = new AiService();
        objectMapper = new ObjectMapper();
    }

    @Test
    public void testAnalyzeResumeFallback() throws Exception {
        String resumeText = "Experienced Java developer with React, Spring Boot, and SQL skills.";
        String jobDescription = "Looking for a Senior Java developer skilled in Docker, Kubernetes, Java, and React.";

        String jsonResult = aiService.analyzeResume(resumeText, jobDescription);
        assertNotNull(jsonResult);

        JsonNode root = objectMapper.readTree(jsonResult);
        assertTrue(root.has("atsScore"));
        assertTrue(root.get("atsScore").asInt() >= 0 && root.get("atsScore").asInt() <= 100);
        assertTrue(root.has("matchedKeywords"));
        assertTrue(root.has("missingKeywords"));
        assertTrue(root.has("finalRecommendation"));
    }

    @Test
    public void testExtractKeywordsFallback() throws Exception {
        String jobDescription = "Seeking Python developer proficient in AWS, Docker, and PostgreSQL.";

        String jsonResult = aiService.extractKeywords(jobDescription);
        assertNotNull(jsonResult);

        JsonNode root = objectMapper.readTree(jsonResult);
        assertTrue(root.has("keywords"));
        assertTrue(root.has("skills"));
        assertTrue(root.has("technologies"));
    }

    @Test
    public void testRewriteBulletPointFallback() throws Exception {
        String bullet = "Developed backend services using Spring Boot.";
        String jsonResult = aiService.rewriteBulletPoint(bullet, "technical");
        assertNotNull(jsonResult);

        JsonNode root = objectMapper.readTree(jsonResult);
        assertTrue(root.has("originalBullet"));
        assertTrue(root.has("rewrittenBullet"));
        assertTrue(root.has("explanation"));
    }

    @Test
    public void testGenerateSummaryFallback() throws Exception {
        String resume = "Software engineer with 3 years of experience.";
        String jd = "Java Full Stack Developer.";

        String jsonResult = aiService.generateSummary(resume, jd);
        assertNotNull(jsonResult);

        JsonNode root = objectMapper.readTree(jsonResult);
        assertTrue(root.has("summary"));
        assertFalse(root.get("summary").asText().isEmpty());
    }

    @Test
    public void testGenerateCoverLetterFallback() throws Exception {
        String resume = "Full stack engineer.";
        String jd = "Senior Software Engineer.";
        String userName = "Jane Doe";

        String jsonResult = aiService.generateCoverLetter(resume, jd, userName);
        assertNotNull(jsonResult);

        JsonNode root = objectMapper.readTree(jsonResult);
        assertTrue(root.has("coverLetter"));
        assertTrue(root.get("coverLetter").asText().contains("Jane Doe"));
    }
}
