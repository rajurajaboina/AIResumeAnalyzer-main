package com.resumeanalyzer.controller;

import com.resumeanalyzer.dto.AnalysisRequest;
import com.resumeanalyzer.dto.AnalysisResponse;
import com.resumeanalyzer.model.ResumeAnalysis;
import com.resumeanalyzer.service.AnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analysis")
@CrossOrigin(origins = "*")
public class AnalysisController {
    
    @Autowired
    private AnalysisService analysisService;
    
    @PostMapping("/analyze")
    public ResponseEntity<AnalysisResponse> analyzeResume(
            @RequestBody AnalysisRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        AnalysisResponse response = analysisService.analyzeResume(request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/reanalyze/{id}")
    public ResponseEntity<AnalysisResponse> reanalyzeResume(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        AnalysisResponse response = analysisService.reanalyzeResume(id, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ResumeAnalysis> getAnalysis(@PathVariable String id) {
        ResumeAnalysis analysis = analysisService.getAnalysisById(id);
        return ResponseEntity.ok(analysis);
    }
    
    @GetMapping("/user")
    public ResponseEntity<List<ResumeAnalysis>> getUserAnalyses(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<ResumeAnalysis> analyses = analysisService.getUserAnalyses(userDetails.getUsername());
        return ResponseEntity.ok(analyses);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAnalysis(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        analysisService.deleteAnalysis(id, userDetails.getUsername());
        return ResponseEntity.ok().build();
    }
}

