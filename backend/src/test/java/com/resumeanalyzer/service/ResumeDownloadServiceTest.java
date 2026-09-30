package com.resumeanalyzer.service;

import com.resumeanalyzer.model.Resume;
import com.resumeanalyzer.model.ResumeData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

public class ResumeDownloadServiceTest {

    private ResumeDownloadService downloadService;

    @BeforeEach
    public void setUp() {
        downloadService = new ResumeDownloadService();
    }

    @Test
    public void testGeneratePdfWithRawText() throws Exception {
        Resume resume = new Resume("user123", "sample.pdf", "John Doe\nSoftware Engineer\nSkills: Java, React");
        byte[] pdfBytes = downloadService.generatePdf(resume);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }

    @Test
    public void testGenerateDocxWithRawText() throws Exception {
        Resume resume = new Resume("user123", "sample.docx", "Jane Smith\nData Analyst\nSkills: Python, SQL");
        byte[] docxBytes = downloadService.generateDocx(resume);

        assertNotNull(docxBytes);
        assertTrue(docxBytes.length > 0);
    }

    @Test
    public void testGeneratePdfWithStructuredData() throws Exception {
        ResumeData data = new ResumeData();
        data.setContactInfo(Map.of("name", "Alice Johnson", "email", "alice@example.com", "phone", "555-0199"));
        data.setSummary("Passionate developer focused on cloud architectures.");
        data.setSkills(List.of("Java", "Spring Boot", "Docker", "AWS"));

        Resume resume = new Resume("user456", "resume.pdf", "Unstructured text");
        resume.setResumeData(data);

        byte[] pdfBytes = downloadService.generatePdf(resume);
        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
    }

    @Test
    public void testGenerateDocxWithStructuredData() throws Exception {
        ResumeData data = new ResumeData();
        data.setContactInfo(Map.of("name", "Bob Williams", "email", "bob@example.com"));
        data.setSummary("Backend engineer with focus on database performance.");
        data.setSkills(List.of("PostgreSQL", "Go", "Kubernetes"));

        Resume resume = new Resume("user789", "resume.docx", "Unstructured text");
        resume.setResumeData(data);

        byte[] docxBytes = downloadService.generateDocx(resume);
        assertNotNull(docxBytes);
        assertTrue(docxBytes.length > 0);
    }
}
