package com.resumeanalyzer.controller;

import com.resumeanalyzer.model.Resume;
import com.resumeanalyzer.model.ResumeVersion;
import com.resumeanalyzer.service.ResumeService;
import com.resumeanalyzer.service.ResumeVersionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resume/{resumeId}/versions")
@CrossOrigin(origins = "*")
public class ResumeVersionController {

    @Autowired
    private ResumeVersionService versionService;

    @Autowired
    private ResumeService resumeService;

    /**
     * GET /api/resume/{resumeId}/versions
     * Lists all saved versions of a resume, newest first.
     */
    @GetMapping
    public ResponseEntity<List<ResumeVersion>> listVersions(
            @PathVariable String resumeId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Resume resume = resumeService.getResumeById(resumeId);
        if (!resume.getUserId().equals(userDetails.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(versionService.getVersionsForResume(resumeId));
    }

    /**
     * POST /api/resume/{resumeId}/versions
     * Manually saves the current resume state as a named snapshot.
     * Body: { "changeSummary": "Before AI optimization" }
     */
    @PostMapping
    public ResponseEntity<ResumeVersion> saveVersion(
            @PathVariable String resumeId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        Resume resume = resumeService.getResumeById(resumeId);
        if (!resume.getUserId().equals(userDetails.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        String summary = body.getOrDefault("changeSummary", "Manual save");
        ResumeVersion saved = versionService.saveVersion(resume, summary);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * GET /api/resume/{resumeId}/versions/{versionId}
     * Retrieves a specific version's full data for previewing or restoring.
     */
    @GetMapping("/{versionId}")
    public ResponseEntity<ResumeVersion> getVersion(
            @PathVariable String resumeId,
            @PathVariable String versionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Resume resume = resumeService.getResumeById(resumeId);
        if (!resume.getUserId().equals(userDetails.getUsername())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(versionService.getVersionById(versionId));
    }
}
