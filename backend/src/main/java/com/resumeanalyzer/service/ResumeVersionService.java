package com.resumeanalyzer.service;

import com.resumeanalyzer.model.Resume;
import com.resumeanalyzer.model.ResumeVersion;
import com.resumeanalyzer.repository.ResumeVersionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResumeVersionService {

    @Autowired
    private ResumeVersionRepository versionRepository;

    /**
     * Saves the current state of a resume as a new version snapshot.
     *
     * @param resume        The resume whose state is being snapshotted.
     * @param changeSummary A short description of what changed (e.g. "Manual edit", "AI optimization").
     * @return The saved ResumeVersion document.
     */
    public ResumeVersion saveVersion(Resume resume, String changeSummary) {
        int nextVersion = versionRepository
                .findTopByResumeIdOrderByVersionNumberDesc(resume.getId())
                .map(v -> v.getVersionNumber() + 1)
                .orElse(1);

        ResumeVersion version = new ResumeVersion(
                resume.getId(),
                resume.getUserId(),
                nextVersion,
                "Version " + nextVersion,
                resume.getResumeData(),
                resume.getLatexContent(),
                resume.getTemplate(),
                0,            // ATS score — caller can update if known
                changeSummary
        );

        return versionRepository.save(version);
    }

    /**
     * Lists all versions for a given resume, newest first.
     */
    public List<ResumeVersion> getVersionsForResume(String resumeId) {
        return versionRepository.findByResumeIdOrderByVersionNumberDesc(resumeId);
    }

    /**
     * Retrieves a single version by its document ID.
     */
    public ResumeVersion getVersionById(String versionId) {
        return versionRepository.findById(versionId)
                .orElseThrow(() -> new RuntimeException("Version not found: " + versionId));
    }

    /**
     * Deletes all version history for a resume (e.g. when the parent resume is deleted).
     */
    public void deleteVersionsForResume(String resumeId) {
        List<ResumeVersion> versions = versionRepository.findByResumeIdOrderByVersionNumberDesc(resumeId);
        versionRepository.deleteAll(versions);
    }
}
