package com.resumeanalyzer.service;

import com.resumeanalyzer.model.Resume;
import com.resumeanalyzer.model.ResumeData;
import com.resumeanalyzer.repository.ResumeRepository;
import com.resumeanalyzer.utils.FileUploadUtil;
import com.resumeanalyzer.utils.ResumeTextExtractor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ResumeService {

    @Autowired
    private ResumeRepository resumeRepository;

    @Autowired
    private FileUploadUtil fileUploadUtil;

    @Autowired
    private ResumeTextExtractor resumeTextExtractor;

    @Autowired
    private com.resumeanalyzer.utils.ResumeTextParser resumeTextParser;

    public Resume uploadResume(MultipartFile file, String userId) throws IOException {
        if (!fileUploadUtil.isValidFileType(file.getOriginalFilename())) {
            throw new IllegalArgumentException("Invalid file type. Only PDF and DOCX are allowed.");
        }

        if (!fileUploadUtil.isValidFileSize(file, 10 * 1024 * 1024)) {
            throw new IllegalArgumentException("File size exceeds 10MB limit.");
        }

        String filePath = fileUploadUtil.uploadFile(file);
        String resumeText = resumeTextExtractor.extractText(filePath, file.getOriginalFilename());

        Resume resume = new Resume(userId, file.getOriginalFilename(), resumeText);
        
        // Parse raw text into structured ResumeData JSON
        try {
            com.resumeanalyzer.model.ResumeData parsedData = resumeTextParser.parse(resumeText);
            resume.setResumeData(parsedData);
        } catch (Exception e) {
            // Keep empty default if parsing encounters unexpected format
        }

        return resumeRepository.save(resume);
    }

    public Resume getResumeById(String id) {
        return resumeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resume not found"));
    }

    public List<Resume> getUserResumes(String userId) {
        return resumeRepository.findByUserId(userId);
    }

    public Resume updateResume(String id, Resume resume) {
        Resume existingResume = getResumeById(id);
        existingResume.setOptimizedResumeText(resume.getOptimizedResumeText());
        existingResume.setResumeData(resume.getResumeData());
        existingResume.setLatexContent(resume.getLatexContent());
        existingResume.setTemplate(resume.getTemplate());
        existingResume.setUpdatedAt(LocalDateTime.now());
        return resumeRepository.save(existingResume);
    }

    /**
     * Updates only the structured ResumeData portion of a resume.
     * This is the preferred save path from the editor.
     */
    public Resume updateResumeData(String id, ResumeData resumeData) {
        Resume existingResume = getResumeById(id);
        existingResume.setResumeData(resumeData);
        existingResume.setUpdatedAt(LocalDateTime.now());
        return resumeRepository.save(existingResume);
    }

    public void deleteResume(String id) {
        resumeRepository.deleteById(id);
    }
}
