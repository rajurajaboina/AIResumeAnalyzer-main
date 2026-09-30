package com.resumeanalyzer.repository;

import com.resumeanalyzer.model.ResumeAnalysis;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResumeAnalysisRepository extends MongoRepository<ResumeAnalysis, String> {
    List<ResumeAnalysis> findByUserId(String userId);
    List<ResumeAnalysis> findByResumeId(String resumeId);
}
