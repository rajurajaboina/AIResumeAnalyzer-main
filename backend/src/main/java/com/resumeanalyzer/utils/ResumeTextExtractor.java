package com.resumeanalyzer.utils;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ResumeTextExtractor {
    
    @Autowired
    private PdfTextExtractor pdfTextExtractor;
    
    @Autowired
    private DocxTextExtractor docxTextExtractor;
    
    public String extractText(String filePath, String filename) throws IOException {
        String lowerFilename = filename.toLowerCase();
        
        if (lowerFilename.endsWith(".pdf")) {
            return pdfTextExtractor.extractText(filePath);
        } else if (lowerFilename.endsWith(".docx")) {
            return docxTextExtractor.extractText(filePath);
        } else {
            throw new IllegalArgumentException("Unsupported file format: " + filename);
        }
    }
}
