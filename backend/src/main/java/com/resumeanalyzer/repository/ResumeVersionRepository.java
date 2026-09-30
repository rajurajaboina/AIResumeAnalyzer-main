package com.resumeanalyzer.repository;

import com.resumeanalyzer.model.ResumeVersion;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeVersionRepository extends MongoRepository<ResumeVersion, String> {

    List<ResumeVersion> findByResumeIdOrderByVersionNumberDesc(String resumeId);

    List<ResumeVersion> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<ResumeVersion> findTopByResumeIdOrderByVersionNumberDesc(String resumeId);
}
