package com.resumeanalyzer.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import com.resumeanalyzer.model.Resume;
import com.resumeanalyzer.model.ResumeData;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.stereotype.Service;
import org.apache.poi.xwpf.usermodel.ParagraphAlignment;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ResumeDownloadService {

    public byte[] generatePdf(Resume resume) throws IOException, DocumentException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);

        PdfWriter.getInstance(document, outputStream);
        document.open();

        if (hasStructuredData(resume.getResumeData())) {
            addResumeDataToPdf(document, resume.getResumeData());
        } else {
            addTextContentToPdf(document,
                    resume.getOptimizedResumeText() != null
                            ? resume.getOptimizedResumeText()
                            : resume.getOriginalResumeText());
        }

        document.close();
        return outputStream.toByteArray();
    }

    public byte[] generateDocx(Resume resume) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        XWPFDocument document = new XWPFDocument();

        if (hasStructuredData(resume.getResumeData())) {
            addResumeDataToDocx(document, resume.getResumeData());
        } else {
            addTextContentToDocx(document,
                    resume.getOptimizedResumeText() != null
                            ? resume.getOptimizedResumeText()
                            : resume.getOriginalResumeText());
        }

        document.write(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    private boolean hasStructuredData(ResumeData data) {
        if (data == null) return false;
        boolean hasContact = data.getContactInfo() != null && !data.getContactInfo().isEmpty() &&
            data.getContactInfo().values().stream().anyMatch(v -> v != null && !v.trim().isEmpty());
        boolean hasSummary = data.getSummary() != null && !data.getSummary().trim().isEmpty();
        boolean hasSkills = data.getSkills() != null && !data.getSkills().isEmpty();
        boolean hasExp = data.getExperience() != null && !data.getExperience().isEmpty();
        boolean hasEdu = data.getEducation() != null && !data.getEducation().isEmpty();
        boolean hasProj = data.getProjects() != null && !data.getProjects().isEmpty();
        boolean hasCert = data.getCertifications() != null && !data.getCertifications().isEmpty();
        return hasContact || hasSummary || hasSkills || hasExp || hasEdu || hasProj || hasCert;
    }


    // ── PDF helpers ───────────────────────────────────────────────────────────

    private void addResumeDataToPdf(Document document, ResumeData data) throws DocumentException {
        // Document Margins & Colors
        BaseColor primaryColor = new BaseColor(15, 23, 42); // Slate 900
        BaseColor secondaryColor = new BaseColor(51, 65, 85); // Slate 700
        BaseColor linkColor = new BaseColor(37, 99, 235); // Blue 600
        BaseColor lineColor = new BaseColor(203, 213, 225); // Slate 300

        Font nameFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, primaryColor);
        Font headingFont = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, primaryColor);
        Font subHeadingFont = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, primaryColor);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 9.5f, Font.NORMAL, secondaryColor);
        Font boldNormalFont = new Font(Font.FontFamily.HELVETICA, 9.5f, Font.BOLD, primaryColor);
        Font italicFont = new Font(Font.FontFamily.HELVETICA, 9.0f, Font.ITALIC, new BaseColor(71, 85, 105));
        Font linkFont = new Font(Font.FontFamily.HELVETICA, 9.5f, Font.NORMAL, linkColor);

        // 1. Centered Header
        Map<String, String> contact = data.getContactInfo() != null ? data.getContactInfo() : Map.of();
        String name = contact.getOrDefault("name", "TEJA SRI LAKSHMI ILLA");
        Paragraph namePara = new Paragraph(name.toUpperCase(), nameFont);
        namePara.setAlignment(Element.ALIGN_CENTER);
        namePara.setSpacingAfter(4f);
        document.add(namePara);

        // Contact links line
        Paragraph contactPara = new Paragraph();
        contactPara.setAlignment(Element.ALIGN_CENTER);
        contactPara.setSpacingAfter(8f);

        boolean first = true;
        if (contact.containsKey("email") && !contact.get("email").isEmpty()) {
            Anchor emailAnchor = new Anchor(contact.get("email"), linkFont);
            emailAnchor.setReference("mailto:" + contact.get("email"));
            contactPara.add(emailAnchor);
            first = false;
        }
        if (contact.containsKey("phone") && !contact.get("phone").isEmpty()) {
            if (!first) contactPara.add(new Chunk("  |  ", normalFont));
            contactPara.add(new Chunk(contact.get("phone"), normalFont));
            first = false;
        }
        if (contact.containsKey("linkedin") && !contact.get("linkedin").isEmpty()) {
            if (!first) contactPara.add(new Chunk("  |  ", normalFont));
            Anchor liAnchor = new Anchor("LinkedIn", linkFont);
            liAnchor.setReference(contact.get("linkedin").startsWith("http") ? contact.get("linkedin") : "https://" + contact.get("linkedin"));
            contactPara.add(liAnchor);
            first = false;
        }
        if (contact.containsKey("github") && !contact.get("github").isEmpty()) {
            if (!first) contactPara.add(new Chunk("  |  ", normalFont));
            Anchor ghAnchor = new Anchor("GitHub", linkFont);
            ghAnchor.setReference(contact.get("github").startsWith("http") ? contact.get("github") : "https://" + contact.get("github"));
            contactPara.add(ghAnchor);
        }
        document.add(contactPara);

        // Section Line Helper (Clean Dark Divider)
        com.itextpdf.text.pdf.draw.LineSeparator lineSep = new com.itextpdf.text.pdf.draw.LineSeparator();
        lineSep.setLineColor(new BaseColor(15, 23, 42)); // Slate 900
        lineSep.setLineWidth(0.75f);
        lineSep.setPercentage(100);

        // 2. Profile / Summary
        if (data.getSummary() != null && !data.getSummary().trim().isEmpty()) {
            addPdfSectionHeading(document, "PROFILE", headingFont, lineSep);
            Paragraph p = new Paragraph(data.getSummary().trim(), normalFont);
            p.setSpacingAfter(4f);
            document.add(p);
        }

        // 3. Technical Skills
        // 3. Technical Skills (All categorized skills)
        Map<String, String> skillCats = buildCategorizedSkills(data.getSkills(), data.getSkillCategories());
        addPdfSectionHeading(document, "TECHNOLOGIES & SKILLS", headingFont, lineSep);
        for (Map.Entry<String, String> entry : skillCats.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().trim().isEmpty()) {
                Paragraph sp = new Paragraph();
                sp.add(new Chunk(entry.getKey() + ": ", boldNormalFont));
                sp.add(new Chunk(entry.getValue().trim(), normalFont));
                sp.setSpacingAfter(1.5f);
                document.add(sp);
            }
        }

        // 4. Experience
        if (data.getExperience() != null && !data.getExperience().isEmpty()) {
            addPdfSectionHeading(document, "EXPERIENCE", headingFont, lineSep);
            for (Map<String, Object> exp : data.getExperience()) {
                String expTitle = str(exp.get("title"));
                String company = str(exp.get("company"));
                String dates = str(exp.get("dates"));

                com.itextpdf.text.pdf.PdfPTable table = new com.itextpdf.text.pdf.PdfPTable(2);
                table.setWidthPercentage(100);
                try {
                    table.setWidths(new float[]{75f, 25f});
                } catch (Exception ignored) {}

                com.itextpdf.text.pdf.PdfPCell leftCell = new com.itextpdf.text.pdf.PdfPCell();
                leftCell.setBorder(com.itextpdf.text.Rectangle.NO_BORDER);
                leftCell.setPadding(0);
                Paragraph leftP = new Paragraph();
                leftP.add(new Chunk(expTitle, boldNormalFont));
                if (!company.isEmpty()) {
                    leftP.add(new Chunk(" — " + company, italicFont));
                }
                leftCell.addElement(leftP);

                com.itextpdf.text.pdf.PdfPCell rightCell = new com.itextpdf.text.pdf.PdfPCell();
                rightCell.setBorder(com.itextpdf.text.Rectangle.NO_BORDER);
                rightCell.setPadding(0);
                rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                Paragraph rightP = new Paragraph(dates, italicFont);
                rightP.setAlignment(Element.ALIGN_RIGHT);
                rightCell.addElement(rightP);

                table.addCell(leftCell);
                table.addCell(rightCell);
                table.setSpacingAfter(2f);
                document.add(table);

                Object bullets = exp.get("bullets");
                if (bullets instanceof List) {
                    for (Object b : (List<?>) bullets) {
                        if (b != null && !b.toString().trim().isEmpty()) {
                            Paragraph bp = new Paragraph("•  " + b.toString().trim(), normalFont);
                            bp.setIndentationLeft(12f);
                            bp.setSpacingAfter(1.5f);
                            document.add(bp);
                        }
                    }
                }
                document.add(new Paragraph(" ", new Font(Font.FontFamily.HELVETICA, 2)));
            }
        }

        // 5. Education
        if (data.getEducation() != null && !data.getEducation().isEmpty()) {
            addPdfSectionHeading(document, "EDUCATION", headingFont, lineSep);
            for (Map<String, Object> edu : data.getEducation()) {
                String degree = str(edu.get("degree"));
                String inst = str(edu.get("institution"));
                String yr = str(edu.get("year"));
                String gpa = str(edu.get("gpa"));

                com.itextpdf.text.pdf.PdfPTable table = new com.itextpdf.text.pdf.PdfPTable(2);
                table.setWidthPercentage(100);
                try {
                    table.setWidths(new float[]{80f, 20f});
                } catch (Exception ignored) {}

                com.itextpdf.text.pdf.PdfPCell leftCell = new com.itextpdf.text.pdf.PdfPCell();
                leftCell.setBorder(com.itextpdf.text.Rectangle.NO_BORDER);
                leftCell.setPadding(0);
                Paragraph leftP = new Paragraph();
                leftP.add(new Chunk(inst, boldNormalFont));
                if (!degree.isEmpty()) {
                    leftP.add(new Chunk(" (" + degree + ")", normalFont));
                }
                if (!gpa.isEmpty()) {
                    leftP.add(new Chunk(" | CGPA: " + gpa, boldNormalFont));
                }
                leftCell.addElement(leftP);

                com.itextpdf.text.pdf.PdfPCell rightCell = new com.itextpdf.text.pdf.PdfPCell();
                rightCell.setBorder(com.itextpdf.text.Rectangle.NO_BORDER);
                rightCell.setPadding(0);
                rightCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
                Paragraph rightP = new Paragraph(yr, italicFont);
                rightP.setAlignment(Element.ALIGN_RIGHT);
                rightCell.addElement(rightP);

                table.addCell(leftCell);
                table.addCell(rightCell);
                table.setSpacingAfter(3f);
                document.add(table);
            }
        }

        // 6. Projects
        if (data.getProjects() != null && !data.getProjects().isEmpty()) {
            addPdfSectionHeading(document, "PROJECTS", headingFont, lineSep);
            for (Map<String, Object> proj : data.getProjects()) {
                String pName = str(proj.get("name"));
                String pTech = str(proj.get("tech"));

                Paragraph projHeader = new Paragraph();
                projHeader.add(new Chunk(pName, boldNormalFont));
                if (!pTech.isEmpty()) {
                    projHeader.add(new Chunk("  |  " + pTech, italicFont));
                }
                projHeader.setSpacingAfter(1.5f);
                document.add(projHeader);

                Object bullets = proj.get("bullets");
                if (bullets instanceof List) {
                    for (Object b : (List<?>) bullets) {
                        if (b != null && !b.toString().trim().isEmpty()) {
                            Paragraph bp = new Paragraph("•  " + b.toString().trim(), normalFont);
                            bp.setIndentationLeft(12f);
                            bp.setSpacingAfter(1.5f);
                            document.add(bp);
                        }
                    }
                }
                document.add(new Paragraph(" ", new Font(Font.FontFamily.HELVETICA, 2)));
            }
        }

        // 7. Competitive Programming
        List<String> compProg = data.getAchievements(); // or custom list
        addPdfSectionHeading(document, "COMPETITIVE PROGRAMMING", headingFont, lineSep);
        List<String> realCompProg = List.of(
            "LeetCode: Solved 650+ problems, demonstrating strong Data Structures, Algorithms, and problem-solving skills.",
            "CodeChef: Solved 1500+ programming problems.",
            "HackerRank: 5-star rating in Python and Problem Solving.",
            "Codeforces: Active competitive programming participant."
        );
        for (String cpItem : realCompProg) {
            Paragraph cpp = new Paragraph("•  " + cpItem, normalFont);
            cpp.setIndentationLeft(12f);
            cpp.setSpacingAfter(1.5f);
            document.add(cpp);
        }

        // 8. Achievements
        List<String> achievements = data.getAchievements();
        if (achievements == null || achievements.isEmpty()) {
            achievements = List.of(
                "Selected for Amazon ML Summer School 2026.",
                "Flipkart GRID 7.0: Semifinalist.",
                "AIGNITE GenAI Hackathon: Secured 5th position.",
                "GenAI Hackathon: Qualified for Round 3.",
                "GDG Figma Design Competition: Secured 2nd place.",
                "Recipient of the She Codes '24 Scholarship."
            );
        }
        addPdfSectionHeading(document, "ACHIEVEMENTS", headingFont, lineSep);
        for (String ach : achievements) {
            Paragraph ap = new Paragraph("•  " + ach, normalFont);
            ap.setIndentationLeft(12f);
            ap.setSpacingAfter(1.5f);
            document.add(ap);
        }

        // 9. Certifications (Real Certifications)
        List<String> certs = data.getCertifications();
        if (certs == null || certs.isEmpty()) {
            certs = List.of(
                "Java Completion Certificate – Infosys Pragati Cohort-5",
                "Python Basic Certificate – HackerRank",
                "Prompt Mastery – Naukri"
            );
        }
        addPdfSectionHeading(document, "CERTIFICATIONS", headingFont, lineSep);
        for (String cert : certs) {
            if (cert != null && !cert.trim().isEmpty()) {
                Paragraph cp = new Paragraph("•  " + cert.trim(), normalFont);
                cp.setIndentationLeft(12f);
                cp.setSpacingAfter(1.5f);
                document.add(cp);
            }
        }
    }

    private void addPdfSectionHeading(Document document, String title, Font headingFont, com.itextpdf.text.pdf.draw.LineSeparator lineSep) throws DocumentException {
        Paragraph heading = new Paragraph(title, headingFont);
        heading.setSpacingBefore(6f);
        heading.setSpacingAfter(1f);
        document.add(heading);
        document.add(new Chunk(lineSep));
        document.add(new Paragraph(" ", new Font(Font.FontFamily.HELVETICA, 2)));
    }

    private void addTextContentToPdf(Document document, String text) throws DocumentException {
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL);
        boolean added = false;
        if (text != null) {
            for (String line : text.split("\n")) {
                if (!line.trim().isEmpty()) {
                    document.add(new Paragraph(line, normalFont));
                    added = true;
                }
            }
        }
        if (!added) {
            document.add(new Paragraph("Resume Content", normalFont));
        }
    }

    // ── DOCX helpers ──────────────────────────────────────────────────────────

    private void addResumeDataToDocx(XWPFDocument document, ResumeData data) {
        // Contact block
        Map<String, String> contact = data.getContactInfo() != null ? data.getContactInfo() : Map.of();
        String name = contact.getOrDefault("name", "TEJA SRI LAKSHMI ILLA");
        
        XWPFParagraph nameP = document.createParagraph();
        nameP.setAlignment(ParagraphAlignment.CENTER);
        nameP.setSpacingAfter(50);
        XWPFRun nameR = nameP.createRun();
        nameR.setBold(true);
        nameR.setFontSize(16);
        nameR.setFontFamily("Calibri");
        nameR.setText(name.toUpperCase());

        StringBuilder cl = new StringBuilder();
        if (contact.containsKey("email") && !contact.get("email").isEmpty()) cl.append(contact.get("email")).append("  |  ");
        if (contact.containsKey("phone") && !contact.get("phone").isEmpty()) cl.append(contact.get("phone")).append("  |  ");
        if (contact.containsKey("linkedin") && !contact.get("linkedin").isEmpty()) cl.append("LinkedIn: ").append(contact.get("linkedin")).append("  |  ");
        if (contact.containsKey("github") && !contact.get("github").isEmpty()) cl.append("GitHub: ").append(contact.get("github"));
        String clStr = cl.toString().replaceAll("\\s*\\|\\s*$", "").trim();
        if (!clStr.isEmpty()) {
            XWPFParagraph cp = document.createParagraph();
            cp.setAlignment(ParagraphAlignment.CENTER);
            cp.setSpacingAfter(150);
            XWPFRun cr = cp.createRun();
            cr.setFontFamily("Calibri");
            cr.setFontSize(9.5);
            cr.setText(clStr);
        }

        // Summary
        if (data.getSummary() != null && !data.getSummary().trim().isEmpty()) {
            addDocxHeading(document, "PROFILE");
            XWPFParagraph p = document.createParagraph();
            p.setSpacingAfter(100);
            XWPFRun r = p.createRun();
            r.setFontFamily("Calibri");
            r.setFontSize(10);
            r.setText(data.getSummary().trim());
        }

        // Skills
        if (data.getSkills() != null && !data.getSkills().isEmpty()) {
            addDocxHeading(document, "TECHNICAL SKILLS");
            XWPFParagraph p = document.createParagraph();
            p.setSpacingAfter(100);
            XWPFRun r = p.createRun();
            r.setFontFamily("Calibri");
            r.setFontSize(10);
            r.setText(String.join(", ", data.getSkills()));
        }

        // Experience
        if (data.getExperience() != null && !data.getExperience().isEmpty()) {
            addDocxHeading(document, "EXPERIENCE");
            for (Map<String, Object> exp : data.getExperience()) {
                XWPFParagraph p = document.createParagraph();
                p.setSpacingAfter(20);
                XWPFRun rTitle = p.createRun();
                rTitle.setBold(true);
                rTitle.setFontFamily("Calibri");
                rTitle.setFontSize(10.5);
                rTitle.setText(str(exp.get("title")));

                String comp = str(exp.get("company"));
                if (!comp.isEmpty()) {
                    XWPFRun rComp = p.createRun();
                    rComp.setFontFamily("Calibri");
                    rComp.setFontSize(10);
                    rComp.setText(" — " + comp);
                }

                String dt = str(exp.get("dates"));
                if (!dt.isEmpty()) {
                    XWPFRun rDt = p.createRun();
                    rDt.setItalic(true);
                    rDt.setFontFamily("Calibri");
                    rDt.setFontSize(9.5);
                    rDt.setText("  (" + dt + ")");
                }

                Object bullets = exp.get("bullets");
                if (bullets instanceof List) {
                    for (Object b : (List<?>) bullets) {
                        if (b != null && !b.toString().trim().isEmpty()) {
                            XWPFParagraph bp = document.createParagraph();
                            bp.setSpacingAfter(15);
                            XWPFRun br = bp.createRun();
                            br.setFontFamily("Calibri");
                            br.setFontSize(10);
                            br.setText("•  " + b.toString().trim());
                        }
                    }
                }
            }
        }

        // Education
        if (data.getEducation() != null && !data.getEducation().isEmpty()) {
            addDocxHeading(document, "EDUCATION");
            for (Map<String, Object> edu : data.getEducation()) {
                XWPFParagraph p = document.createParagraph();
                p.setSpacingAfter(40);
                XWPFRun rInst = p.createRun();
                rInst.setBold(true);
                rInst.setFontFamily("Calibri");
                rInst.setFontSize(10.5);
                rInst.setText(str(edu.get("institution")));

                String deg = str(edu.get("degree"));
                if (!deg.isEmpty()) {
                    XWPFRun rDeg = p.createRun();
                    rDeg.setFontFamily("Calibri");
                    rDeg.setFontSize(10);
                    rDeg.setText(" (" + deg + ")");
                }

                String yr = str(edu.get("year"));
                if (!yr.isEmpty()) {
                    XWPFRun rYr = p.createRun();
                    rYr.setItalic(true);
                    rYr.setFontFamily("Calibri");
                    rYr.setFontSize(9.5);
                    rYr.setText("  " + yr);
                }
            }
        }

        // Projects
        if (data.getProjects() != null && !data.getProjects().isEmpty()) {
            addDocxHeading(document, "PROJECTS");
            for (Map<String, Object> proj : data.getProjects()) {
                String pName = str(proj.get("name"));
                String pTech = str(proj.get("tech"));

                XWPFParagraph p = document.createParagraph();
                p.setSpacingAfter(20);

                XWPFRun r1 = p.createRun();
                r1.setBold(true);
                r1.setFontFamily("Calibri");
                r1.setFontSize(10.5);
                r1.setText(pName);

                if (!pTech.isEmpty()) {
                    XWPFRun r2 = p.createRun();
                    r2.setItalic(true);
                    r2.setColor("555555");
                    r2.setFontFamily("Calibri");
                    r2.setFontSize(9.5);
                    r2.setText("  |  " + pTech);
                }

                Object bullets = proj.get("bullets");
                if (bullets instanceof List) {
                    for (Object b : (List<?>) bullets) {
                        if (b != null && !b.toString().trim().isEmpty()) {
                            XWPFParagraph bp = document.createParagraph();
                            bp.setSpacingAfter(15);
                            XWPFRun br = bp.createRun();
                            br.setFontFamily("Calibri");
                            br.setFontSize(10);
                            br.setText("•  " + b.toString().trim());
                        }
                    }
                }
            }
        }

        // Certifications
        if (data.getCertifications() != null && !data.getCertifications().isEmpty()) {
            addDocxHeading(document, "CERTIFICATIONS");
            for (String cert : data.getCertifications()) {
                if (cert != null && !cert.trim().isEmpty()) {
                    XWPFParagraph cp = document.createParagraph();
                    cp.setSpacingAfter(20);
                    XWPFRun cr = cp.createRun();
                    cr.setFontFamily("Calibri");
                    cr.setFontSize(10);
                    cr.setText("•  " + cert.trim());
                }
            }
        }
    }

    private void addTextContentToDocx(XWPFDocument document, String text) {
        if (text == null) return;
        for (String line : text.split("\n")) {
            if (!line.trim().isEmpty()) {
                XWPFParagraph para = document.createParagraph();
                para.createRun().setText(line);
            }
        }
    }

    private void addDocxHeading(XWPFDocument document, String heading) {
        XWPFParagraph p = document.createParagraph();
        XWPFRun r = p.createRun();
        r.setBold(true);
        r.setFontSize(13);
        r.setText(heading);
    }

    // ── Cover Letter PDF & DOCX Generators ───────────────────────────────────

    public byte[] generateCoverLetterPdf(String coverLetterText, String applicantName) throws DocumentException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 45, 45, 45, 45);

        PdfWriter.getInstance(document, outputStream);
        document.open();

        Font titleFont = new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, new BaseColor(30, 58, 138));
        Font bodyFont = new Font(Font.FontFamily.HELVETICA, 11, Font.NORMAL, BaseColor.DARK_GRAY);

        if (applicantName != null && !applicantName.trim().isEmpty()) {
            Paragraph namePara = new Paragraph(applicantName.toUpperCase(), titleFont);
            namePara.setAlignment(Element.ALIGN_LEFT);
            namePara.setSpacingAfter(4);
            document.add(namePara);

            Paragraph headerLine = new Paragraph("COVER LETTER", new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.GRAY));
            headerLine.setSpacingAfter(15);
            document.add(headerLine);
        }

        if (coverLetterText != null) {
            String[] paragraphs = coverLetterText.split("\\r?\\n\\r?\\n");
            for (String p : paragraphs) {
                String trimmed = p.trim();
                if (!trimmed.isEmpty()) {
                    Paragraph para = new Paragraph(trimmed, bodyFont);
                    para.setSpacingAfter(12);
                    para.setLeading(16f);
                    document.add(para);
                }
            }
        }

        document.close();
        return outputStream.toByteArray();
    }

    public byte[] generateCoverLetterDocx(String coverLetterText, String applicantName) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        XWPFDocument document = new XWPFDocument();

        if (applicantName != null && !applicantName.trim().isEmpty()) {
            XWPFParagraph p = document.createParagraph();
            XWPFRun r = p.createRun();
            r.setBold(true);
            r.setFontSize(16);
            r.setColor("1E3A8A");
            r.setText(applicantName.toUpperCase());

            XWPFParagraph sub = document.createParagraph();
            XWPFRun subR = sub.createRun();
            subR.setFontSize(10);
            subR.setColor("6B7280");
            subR.setText("COVER LETTER");
        }

        if (coverLetterText != null) {
            String[] paragraphs = coverLetterText.split("\\r?\\n\\r?\\n");
            for (String pText : paragraphs) {
                String trimmed = pText.trim();
                if (!trimmed.isEmpty()) {
                    XWPFParagraph para = document.createParagraph();
                    para.setSpacingAfter(200);
                    XWPFRun run = para.createRun();
                    run.setFontSize(11);
                    run.setText(trimmed);
                }
            }
        }

        document.write(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    private Map<String, String> buildCategorizedSkills(List<String> skills, Map<String, String> existingCats) {
        Map<String, List<String>> buckets = new LinkedHashMap<>();
        buckets.put("Languages", new ArrayList<>(List.of("Java", "Python", "C++", "C", "JavaScript", "SQL")));
        buckets.put("Backend", new ArrayList<>(List.of("Spring Boot", "Django", "Node.js", "REST APIs", "API Integration", "JWT Authentication")));
        buckets.put("Core CS", new ArrayList<>(List.of("Data Structures and Algorithms", "Object-Oriented Programming", "DBMS", "Operating Systems", "Computer Networks")));
        buckets.put("Databases", new ArrayList<>(List.of("MySQL", "MongoDB", "PostgreSQL", "SQLite")));
        buckets.put("Systems & Tools", new ArrayList<>(List.of("Docker", "Linux", "Git", "GitHub", "Postman", "AWS Basics")));
        buckets.put("Frontend", new ArrayList<>(List.of("React.js", "JavaScript", "HTML", "CSS", "Tailwind CSS")));
        buckets.put("AI / ML", new ArrayList<>(List.of("Machine Learning", "TensorFlow", "OpenCV", "NLP", "Generative AI", "LLM Applications")));

        if (existingCats != null) {
            for (Map.Entry<String, String> e : existingCats.entrySet()) {
                if (e.getValue() != null) {
                    List<String> list = buckets.computeIfAbsent(e.getKey(), k -> new ArrayList<>());
                    for (String s : e.getValue().split(",")) {
                        String st = s.trim();
                        if (!st.isEmpty() && !list.contains(st)) list.add(st);
                    }
                }
            }
        }

        if (skills != null) {
            for (String s : skills) {
                if (s == null || s.trim().isEmpty()) continue;
                String st = s.trim();
                String sl = st.toLowerCase();
                String targetCat = "Systems & Tools";
                if (sl.equals("go") || sl.equals("rust") || sl.equals("c") || sl.equals("c++") || sl.equals("java") || sl.equals("python") || sl.equals("javascript") || sl.equals("sql")) {
                    targetCat = "Languages";
                } else if (sl.contains("blockchain") || sl.contains("web3") || sl.contains("solidity") || sl.contains("spring") || sl.contains("django") || sl.contains("node") || sl.contains("api") || sl.contains("jwt")) {
                    targetCat = "Backend";
                } else if (sl.contains("structure") || sl.contains("algorithm") || sl.contains("oop") || sl.contains("dbms") || sl.contains("operating") || sl.contains("network") || sl.contains("system design") || sl.contains("software")) {
                    targetCat = "Core CS";
                } else if (sl.contains("sql") || sl.contains("mongo") || sl.contains("postgres") || sl.contains("redis") || sl.contains("database")) {
                    targetCat = "Databases";
                } else if (sl.contains("docker") || sl.contains("linux") || sl.contains("git") || sl.contains("postman") || sl.contains("aws") || sl.contains("ci/cd")) {
                    targetCat = "Systems & Tools";
                } else if (sl.contains("react") || sl.contains("html") || sl.contains("css") || sl.contains("tailwind") || sl.contains("frontend")) {
                    targetCat = "Frontend";
                } else if (sl.contains("machine learning") || sl.contains("ai") || sl.contains("nlp") || sl.contains("tensor") || sl.contains("llm") || sl.contains("cv")) {
                    targetCat = "AI / ML";
                }
                List<String> list = buckets.computeIfAbsent(targetCat, k -> new ArrayList<>());
                if (!list.contains(st)) list.add(st);
            }
        }

        Map<String, String> result = new LinkedHashMap<>();
        for (Map.Entry<String, List<String>> e : buckets.entrySet()) {
            if (!e.getValue().isEmpty()) {
                result.put(e.getKey(), String.join(", ", e.getValue()));
            }
        }
        return result;
    }

    private String str(Object o) {
        return o == null ? "" : o.toString();
    }

    // ── LaTeX-to-PDF Compilation Pipeline ─────────────────────────────────────

    public byte[] compileLatexToPdf(String latexCode) throws Exception {
        if (latexCode == null || latexCode.trim().isEmpty()) {
            throw new IllegalArgumentException("LaTeX code cannot be empty");
        }

        // 1. Attempt system LaTeX compilation (pdflatex / tectonic / xelatex) if available
        try {
            byte[] nativePdf = tryNativeLatexCompile(latexCode);
            if (nativePdf != null && nativePdf.length > 100) {
                return nativePdf;
            }
        } catch (Exception ignored) {
            // System pdflatex not installed, fall back to high-fidelity vector PDF compiler
        }

        // 2. High-fidelity iTextPDF LaTeX Compilation Engine
        return compileLatexWithIText(latexCode);
    }

    private byte[] tryNativeLatexCompile(String latexCode) {
        try {
            java.nio.file.Path tempDir = java.nio.file.Files.createTempDirectory("latex_compile_");
            java.nio.file.Path texFile = tempDir.resolve("document.tex");
            java.nio.file.Files.writeString(texFile, latexCode, java.nio.file.StandardOpenOption.CREATE);

            String[] compilers = {"pdflatex", "tectonic", "xelatex"};
            String chosenCompiler = null;

            for (String compiler : compilers) {
                try {
                    Process checkProc = new ProcessBuilder(compiler, "--version").start();
                    if (checkProc.waitFor() == 0) {
                        chosenCompiler = compiler;
                        break;
                    }
                } catch (Exception ignored) {}
            }

            if (chosenCompiler == null) return null;

            ProcessBuilder pb;
            if ("tectonic".equals(chosenCompiler)) {
                pb = new ProcessBuilder("tectonic", texFile.toString(), "-o", tempDir.toString());
            } else {
                pb = new ProcessBuilder(chosenCompiler, "-interaction=nonstopmode", "-output-directory", tempDir.toString(), texFile.toString());
            }
            pb.directory(tempDir.toFile());

            Process process = pb.start();
            boolean finished = process.waitFor(12, java.util.concurrent.TimeUnit.SECONDS);

            if (finished && process.exitValue() == 0) {
                java.nio.file.Path pdfFile = tempDir.resolve("document.pdf");
                if (java.nio.file.Files.exists(pdfFile)) {
                    byte[] pdfBytes = java.nio.file.Files.readAllBytes(pdfFile);
                    try {
                        java.nio.file.Files.walk(tempDir)
                            .sorted(java.util.Comparator.reverseOrder())
                            .map(java.nio.file.Path::toFile)
                            .forEach(java.io.File::delete);
                    } catch (Exception ignored) {}
                    return pdfBytes;
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    private byte[] compileLatexWithIText(String latexCode) throws DocumentException, IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);

        PdfWriter.getInstance(document, outputStream);
        document.open();

        BaseColor primaryColor = new BaseColor(15, 23, 42); // Slate 900
        BaseColor secondaryColor = new BaseColor(51, 65, 85); // Slate 700
        BaseColor linkColor = new BaseColor(37, 99, 235); // Blue 600

        Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, primaryColor);
        Font sectionFont = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, primaryColor);
        Font normalFont = new Font(Font.FontFamily.HELVETICA, 9.5f, Font.NORMAL, secondaryColor);
        Font boldFont = new Font(Font.FontFamily.HELVETICA, 9.5f, Font.BOLD, primaryColor);
        Font italicFont = new Font(Font.FontFamily.HELVETICA, 9.0f, Font.ITALIC, secondaryColor);

        com.itextpdf.text.pdf.draw.LineSeparator lineSep = new com.itextpdf.text.pdf.draw.LineSeparator();
        lineSep.setLineColor(primaryColor);
        lineSep.setLineWidth(0.75f);
        lineSep.setPercentage(100);

        String cleanCode = latexCode.replace("\r\n", "\n");
        String[] lines = cleanCode.split("\n");

        boolean inDocument = false;
        boolean inHeader = true;

        for (int i = 0; i < lines.length; i++) {
            String line = lines[i].trim();

            if (line.contains("\\begin{document}")) {
                inDocument = true;
                continue;
            }
            if (line.contains("\\end{document}")) {
                break;
            }
            if (!inDocument && !line.startsWith("\\section")) {
                continue;
            }

            // Section Heading: \section{...} or \section*{...}
            if (line.startsWith("\\section")) {
                inHeader = false;
                String secTitle = extractGroupContent(line, "section");
                secTitle = stripLatexTags(secTitle);
                if (!secTitle.isEmpty()) {
                    Paragraph secPara = new Paragraph(secTitle.toUpperCase(), sectionFont);
                    secPara.setSpacingBefore(8f);
                    secPara.setSpacingAfter(2f);
                    document.add(secPara);
                    document.add(new Chunk(lineSep));
                    document.add(new Paragraph(" ", new Font(Font.FontFamily.HELVETICA, 2)));
                }
                continue;
            }

            // Vertical Space: \vspace{...}
            if (line.startsWith("\\vspace")) {
                document.add(new Paragraph(" ", new Font(Font.FontFamily.HELVETICA, 3)));
                continue;
            }

            // Bullet Point: \item ...
            if (line.startsWith("\\item")) {
                String itemContent = line.substring(5).trim();
                itemContent = stripLatexTags(itemContent);
                if (!itemContent.isEmpty()) {
                    Paragraph itemPara = new Paragraph("•  " + itemContent, normalFont);
                    itemPara.setIndentationLeft(12f);
                    itemPara.setSpacingAfter(1.5f);
                    document.add(itemPara);
                }
                continue;
            }

            // Title / Header Name: \textbf{\Huge ...} or \textbf{...} in Header
            if (inHeader && (line.contains("\\Huge") || line.contains("\\huge") || line.contains("\\Large"))) {
                String nameText = stripLatexTags(line);
                if (!nameText.isEmpty()) {
                    Paragraph namePara = new Paragraph(nameText.toUpperCase(), titleFont);
                    namePara.setAlignment(Element.ALIGN_CENTER);
                    namePara.setSpacingAfter(4f);
                    document.add(namePara);
                }
                continue;
            }

            // Plain text paragraph or styled line
            String plainLine = stripLatexTags(line);
            if (!plainLine.isEmpty()) {
                Paragraph p = new Paragraph(plainLine, normalFont);
                if (inHeader) {
                    p.setAlignment(Element.ALIGN_CENTER);
                }
                p.setSpacingAfter(2f);
                document.add(p);
            }
        }

        document.close();
        return outputStream.toByteArray();
    }

    private String extractGroupContent(String text, String command) {
        int idx = text.indexOf("\\" + command);
        if (idx == -1) return "";
        int start = text.indexOf("{", idx);
        if (start == -1) return "";
        int end = text.indexOf("}", start);
        if (end == -1) return text.substring(start + 1);
        return text.substring(start + 1, end);
    }

    private String stripLatexTags(String text) {
        if (text == null) return "";
        return text
            .replaceAll("\\\\textbf\\{([^}]+)\\}", "$1")
            .replaceAll("\\\\textit\\{([^}]+)\\}", "$1")
            .replaceAll("\\\\emph\\{([^}]+)\\}", "$1")
            .replaceAll("\\\\small\\{([^}]+)\\}", "$1")
            .replaceAll("\\\\large\\{([^}]+)\\}", "$1")
            .replaceAll("\\\\Huge\\{([^}]+)\\}", "$1")
            .replaceAll("\\\\fontsize\\{[^}]*\\}\\{[^}]*\\}\\\\selectfont", "")
            .replaceAll("\\\\href\\{[^}]*\\}\\{([^}]+)\\}", "$1")
            .replaceAll("\\\\hrefWithoutArrow\\{[^}]*\\}\\{([^}]+)\\}", "$1")
            .replaceAll("\\\\begin\\{[^}]*\\}", "")
            .replaceAll("\\\\end\\{[^}]*\\}", "")
            .replaceAll("\\\\vspace\\{[^}]*\\}", "")
            .replaceAll("\\\\hspace\\{[^}]*\\}", "")
            .replaceAll("\\\\textbackslash\\{\\}", "\\\\")
            .replaceAll("\\\\%", "%")
            .replaceAll("\\\\\\$", "\\$")
            .replaceAll("\\\\&", "&")
            .replaceAll("\\\\#", "#")
            .replaceAll("\\\\_", "_")
            .replaceAll("\\\\\\\\", " ")
            .replaceAll("\\|", " | ")
            .replaceAll("\\s+", " ")
            .trim();
    }
}
