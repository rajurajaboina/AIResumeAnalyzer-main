package com.resumeanalyzer.controller;

import com.resumeanalyzer.model.Resume;
import com.resumeanalyzer.model.ResumeData;
import com.resumeanalyzer.service.ResumeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/resume")
@CrossOrigin(origins = "*")
public class ResumeController {

    @Autowired
    private ResumeService resumeService;

    @PostMapping("/upload")
    public ResponseEntity<Resume> uploadResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {
        Resume resume = resumeService.uploadResume(file, userDetails.getUsername());
        return ResponseEntity.ok(resume);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resume> getResume(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Resume resume = resumeService.getResumeById(id);
        if (!resume.getUserId().equals(userDetails.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(resume);
    }

    @GetMapping("/user")
    public ResponseEntity<List<Resume>> getUserResumes(@AuthenticationPrincipal UserDetails userDetails) {
        List<Resume> resumes = resumeService.getUserResumes(userDetails.getUsername());
        return ResponseEntity.ok(resumes);
    }

    /**
     * Full resume update (optimized text, latex, etc.)
     */
    @PutMapping("/{id}")
    public ResponseEntity<Resume> updateResume(
            @PathVariable String id,
            @RequestBody Resume resume,
            @AuthenticationPrincipal UserDetails userDetails) {
        Resume existing = resumeService.getResumeById(id);
        if (!existing.getUserId().equals(userDetails.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Resume updated = resumeService.updateResume(id, resume);
        return ResponseEntity.ok(updated);
    }

    /**
     * Structured data save — accepts only the ResumeData portion.
     * Prevents clients from overwriting userId or other protected fields.
     */
    @PatchMapping("/{id}/data")
    public ResponseEntity<Resume> updateResumeData(
            @PathVariable String id,
            @RequestBody ResumeData resumeData,
            @AuthenticationPrincipal UserDetails userDetails) {
        Resume existing = resumeService.getResumeById(id);
        if (!existing.getUserId().equals(userDetails.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Resume updated = resumeService.updateResumeData(id, resumeData);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResume(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Resume existing = resumeService.getResumeById(id);
        if (!existing.getUserId().equals(userDetails.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        resumeService.deleteResume(id);
        return ResponseEntity.ok().build();
    }
}
