package com.resumeanalyzer.controller;

import com.resumeanalyzer.model.Resume;
import com.resumeanalyzer.service.ResumeDownloadService;
import com.resumeanalyzer.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/download")
@CrossOrigin(origins = "*")
public class DownloadController {
    
    @Autowired
    private ResumeDownloadService downloadService;
    
    @Autowired
    private ResumeService resumeService;
    
    @GetMapping("/resume/pdf/{id}")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable String id) throws Exception {
        Resume resume = resumeService.getResumeById(id);
        byte[] pdfBytes = downloadService.generatePdf(resume);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "resume.pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
    
    @GetMapping("/resume/docx/{id}")
    public ResponseEntity<byte[]> downloadDocx(@PathVariable String id) throws IOException {
        Resume resume = resumeService.getResumeById(id);
        byte[] docxBytes = downloadService.generateDocx(resume);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "resume.docx");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(docxBytes);
    }

    @PostMapping("/cover-letter/pdf")
    public ResponseEntity<byte[]> downloadCoverLetterPdf(@RequestBody Map<String, String> payload) throws Exception {
        String text = payload.getOrDefault("coverLetter", "");
        String name = payload.getOrDefault("userName", "Applicant");
        byte[] pdfBytes = downloadService.generateCoverLetterPdf(text, name);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "cover-letter.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @PostMapping("/cover-letter/docx")
    public ResponseEntity<byte[]> downloadCoverLetterDocx(@RequestBody Map<String, String> payload) throws IOException {
        String text = payload.getOrDefault("coverLetter", "");
        String name = payload.getOrDefault("userName", "Applicant");
        byte[] docxBytes = downloadService.generateCoverLetterDocx(text, name);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "cover-letter.docx");

        return ResponseEntity.ok()
                .headers(headers)
                .body(docxBytes);
    }

    @PostMapping("/compile-latex-pdf")
    public ResponseEntity<?> compileLatexPdf(@RequestBody Map<String, String> payload) {
        try {
            String latexCode = payload.getOrDefault("latexCode", "");
            byte[] pdfBytes = downloadService.compileLatexToPdf(latexCode);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("inline", "preview.pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage() != null ? e.getMessage() : "LaTeX compilation failed"));
        }
    }
}
