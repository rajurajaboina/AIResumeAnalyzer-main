package com.resumeanalyzer.utils;

import com.resumeanalyzer.model.ResumeData;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ResumeTextParser {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
    private static final Pattern PHONE_PATTERN = Pattern.compile("(\\+?\\d{1,4}[\\s-]?)?(\\(?\\d{3}\\)?[\\s-]?)?\\d{3}[\\s-]?\\d{4}");
    private static final Pattern LINKEDIN_PATTERN = Pattern.compile("linkedin\\.com/in/[a-zA-Z0-9_-]+");
    private static final Pattern GITHUB_PATTERN = Pattern.compile("github\\.com/[a-zA-Z0-9_-]+");
    private static final Pattern YEAR_RANGE = Pattern.compile("(\\d{4})\\s*[–\\-]\\s*(\\d{4}|Present)", Pattern.CASE_INSENSITIVE);
    private static final Pattern GPA_PATTERN = Pattern.compile("(?:CGPA|GPA)[:\\s]*([\\d.]+(?:/[\\d.]+)?)", Pattern.CASE_INSENSITIVE);
    private static final Pattern DATE_RANGE = Pattern.compile("((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s+\\d{4})\\s*[–\\-]\\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\\s+\\d{4}|Present)", Pattern.CASE_INSENSITIVE);

    private static final List<String> COMMON_SKILLS = List.of(
        "Java", "Python", "C++", "C", "JavaScript", "TypeScript", "SQL", "HTML", "CSS", "Tailwind CSS",
        "Spring Boot", "Django", "Node.js", "React.js", "React", "REST APIs", "GraphQL", "JWT Authentication",
        "MySQL", "MongoDB", "SQLite", "PostgreSQL", "Docker", "AWS", "Git", "GitHub", "Linux", "Postman",
        "Data Structures", "Algorithms", "Object-Oriented Programming", "DBMS", "Operating Systems",
        "Computer Networks", "Software Development Lifecycle", "Machine Learning", "NLP", "TensorFlow",
        "OpenCV", "Generative AI", "LLM", "OpenAI", "Whisper", "Streamlit", "NumPy", "Pandas", "Scikit-learn",
        "NoSQL", "Redis", "Figma", "Canva", "SEO", "Copywriting"
    );

    private enum SectionType {
        HEADER, PROFILE, EXPERIENCE, EDUCATION, SKILLS, PROJECTS,
        COMPETITIVE_PROGRAMMING, ACHIEVEMENTS, LEADERSHIP, CERTIFICATIONS, OTHER
    }

    public ResumeData parse(String resumeText) {
        ResumeData data = new ResumeData();
        if (resumeText == null || resumeText.isBlank()) return data;

        // Parse contact info from raw text
        data.setContactInfo(parseContactInfo(resumeText));

        // Group resume text line by line into structured section blocks
        Map<SectionType, List<String>> sectionLines = segmentIntoSections(resumeText);

        data.setSummary(extractSummary(sectionLines.get(SectionType.PROFILE)));
        data.setExperience(extractExperience(sectionLines.get(SectionType.EXPERIENCE)));
        data.setEducation(extractEducation(sectionLines.get(SectionType.EDUCATION)));
        data.setSkills(extractSkills(sectionLines.get(SectionType.SKILLS), resumeText));
        data.setProjects(extractProjects(sectionLines.get(SectionType.PROJECTS)));
        data.setCertifications(extractCertifications(sectionLines.get(SectionType.CERTIFICATIONS)));

        return data;
    }

    /**
     * Line-based State Machine that groups lines into discrete sections.
     * Prevents any keyword (like "experience" or "skills") inside a sentence
     * from falsely triggering a section split!
     */
    private Map<SectionType, List<String>> segmentIntoSections(String text) {
        Map<SectionType, List<String>> sections = new EnumMap<>(SectionType.class);
        for (SectionType type : SectionType.values()) {
            sections.put(type, new ArrayList<>());
        }

        String[] rawLines = text.split("\\r?\\n");
        SectionType currentSection = SectionType.HEADER;

        for (String rawLine : rawLines) {
            String line = rawLine.trim();
            if (line.isEmpty()) continue;

            SectionType detectedHeader = matchSectionHeader(line);
            if (detectedHeader != null) {
                currentSection = detectedHeader;
                continue; // Skip adding the header title line itself to the section content
            }

            sections.get(currentSection).add(line);
        }

        return sections;
    }

    /**
     * Matches a line strictly if it is a standalone Section Header.
     * Must be a short line consisting almost entirely of the section keyword.
     */
    private SectionType matchSectionHeader(String line) {
        // Strip leading symbols (e.g., #, %, *, •, -) and trailing colons/dashes
        String clean = line.replaceAll("^[#%*•–\\-\\s]+", "").replaceAll("[:\\-\\s]+$", "").trim().toLowerCase();

        if (clean.equals("profile") || clean.equals("summary") || clean.equals("about me") || clean.equals("professional summary") || clean.equals("objective")) {
            return SectionType.PROFILE;
        }
        if (clean.equals("experience") || clean.equals("work experience") || clean.equals("professional experience") || clean.equals("internships") || clean.equals("employment")) {
            return SectionType.EXPERIENCE;
        }
        if (clean.equals("education") || clean.equals("academic background") || clean.equals("academics") || clean.equals("qualifications")) {
            return SectionType.EDUCATION;
        }
        if (clean.equals("technical skills") || clean.equals("skills") || clean.equals("skills & tools") || clean.equals("programming skills") || clean.equals("core competencies")) {
            return SectionType.SKILLS;
        }
        if (clean.equals("projects") || clean.equals("academic projects") || clean.equals("key projects") || clean.equals("personal projects")) {
            return SectionType.PROJECTS;
        }
        if (clean.equals("competitive programming") || clean.equals("coding profiles") || clean.equals("problem solving")) {
            return SectionType.COMPETITIVE_PROGRAMMING;
        }
        if (clean.equals("achievements") || clean.equals("awards") || clean.equals("honors") || clean.equals("accomplishments")) {
            return SectionType.ACHIEVEMENTS;
        }
        if (clean.equals("leadership") || clean.equals("leadership & clubs") || clean.equals("extracurricular") || clean.equals("positions of responsibility") || clean.equals("clubs & activities")) {
            return SectionType.LEADERSHIP;
        }
        if (clean.equals("certifications") || clean.equals("certificates") || clean.equals("licenses & certifications")) {
            return SectionType.CERTIFICATIONS;
        }

        return null;
    }

    private boolean isBullet(String line) {
        return line.startsWith("•") || line.startsWith("-") || line.startsWith("*") || line.startsWith("–") || line.startsWith(">");
    }

    private String cleanBulletText(String line) {
        return line.replaceAll("^[•*–\\->\\s]+", "").trim();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Contact Info Parsing
    // ──────────────────────────────────────────────────────────────────────────

    private Map<String, String> parseContactInfo(String text) {
        Map<String, String> contact = new HashMap<>();

        String[] lines = text.split("\\r?\\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (!trimmed.isEmpty() && trimmed.length() < 60
                && !trimmed.contains("@") && !trimmed.contains("http")
                && !trimmed.toLowerCase().contains("profile")
                && !trimmed.toLowerCase().contains("summary")
                && !trimmed.toLowerCase().contains("b.tech")) {
                String name = trimmed.replaceAll("[ïƒ§#%*]", "").replaceAll("\\s+", " ").trim();
                contact.put("name", name);
                break;
            }
        }

        Matcher emailMatcher = EMAIL_PATTERN.matcher(text);
        if (emailMatcher.find()) contact.put("email", emailMatcher.group());

        Matcher phoneMatcher = PHONE_PATTERN.matcher(text);
        if (phoneMatcher.find()) contact.put("phone", phoneMatcher.group());

        Matcher linkedinMatcher = LINKEDIN_PATTERN.matcher(text);
        if (linkedinMatcher.find()) contact.put("linkedin", "https://" + linkedinMatcher.group());

        Matcher githubMatcher = GITHUB_PATTERN.matcher(text);
        if (githubMatcher.find()) contact.put("github", "https://" + githubMatcher.group());

        return contact;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Profile / Summary Parsing
    // ──────────────────────────────────────────────────────────────────────────

    private String extractSummary(List<String> lines) {
        if (lines == null || lines.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        for (String line : lines) {
            if (!isBullet(line)) {
                if (sb.length() > 0 && !sb.toString().endsWith(" ") && !line.startsWith(" ")) {
                    // If previous line ended with hyphen mid-word, connect without space
                    if (sb.toString().endsWith("-")) {
                        sb.deleteCharAt(sb.length() - 1);
                    } else {
                        sb.append(" ");
                    }
                }
                sb.append(line);
            }
        }
        return sb.toString().replaceAll("\\s+", " ").trim();
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Experience Parsing
    // ──────────────────────────────────────────────────────────────────────────

    private List<Map<String, Object>> extractExperience(List<String> lines) {
        List<Map<String, Object>> list = new ArrayList<>();
        if (lines == null || lines.isEmpty()) return list;

        Map<String, Object> current = null;
        List<String> bullets = null;
        StringBuilder currentBullet = null;

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;

            if (isBullet(trimmed)) {
                if (current == null) {
                    current = new HashMap<>();
                    current.put("title", "Experience");
                    bullets = new ArrayList<>();
                }
                if (currentBullet != null && currentBullet.length() > 0) {
                    bullets.add(currentBullet.toString().replaceAll("\\s+", " ").trim());
                }
                currentBullet = new StringBuilder(cleanBulletText(trimmed));
            } else if (DATE_RANGE.matcher(trimmed).find() || (YEAR_RANGE.matcher(trimmed).find() && trimmed.length() < 100)) {
                // New experience item entry
                if (currentBullet != null && currentBullet.length() > 0) {
                    bullets.add(currentBullet.toString().replaceAll("\\s+", " ").trim());
                    currentBullet = null;
                }
                if (current != null) {
                    current.put("bullets", bullets != null ? bullets : new ArrayList<>());
                    list.add(current);
                }
                current = new HashMap<>();
                bullets = new ArrayList<>();

                Matcher dateMatcher = DATE_RANGE.matcher(trimmed);
                if (dateMatcher.find()) {
                    current.put("dates", dateMatcher.group(0));
                    String titlePart = trimmed.substring(0, dateMatcher.start()).replaceAll("[–\\-\\s]+$", "").trim();
                    current.put("title", titlePart.isEmpty() ? "Experience" : titlePart);
                } else {
                    current.put("title", trimmed);
                }
            } else {
                // Line continuation or sub-header
                if (currentBullet != null) {
                    // Continuation of a multi-line bullet point
                    if (currentBullet.toString().endsWith("-")) {
                        currentBullet.deleteCharAt(currentBullet.length() - 1);
                    } else {
                        currentBullet.append(" ");
                    }
                    currentBullet.append(trimmed);
                } else if (current == null) {
                    current = new HashMap<>();
                    current.put("title", trimmed);
                    bullets = new ArrayList<>();
                } else if (!current.containsKey("company")) {
                    current.put("company", trimmed);
                }
            }
        }

        if (currentBullet != null && currentBullet.length() > 0) {
            if (bullets != null) bullets.add(currentBullet.toString().replaceAll("\\s+", " ").trim());
        }
        if (current != null) {
            current.put("bullets", bullets != null ? bullets : new ArrayList<>());
            list.add(current);
        }

        return list;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Education Parsing
    // ──────────────────────────────────────────────────────────────────────────

    private List<Map<String, Object>> extractEducation(List<String> lines) {
        List<Map<String, Object>> list = new ArrayList<>();
        if (lines == null || lines.isEmpty()) return list;

        Map<String, Object> edu = new HashMap<>();
        String fullEduText = String.join("\n", lines);

        Matcher gpaMatcher = GPA_PATTERN.matcher(fullEduText);
        if (gpaMatcher.find()) {
            edu.put("gpa", gpaMatcher.group(1));
        }

        Matcher yearMatcher = YEAR_RANGE.matcher(fullEduText);
        if (yearMatcher.find()) {
            edu.put("year", yearMatcher.group(0));
        }

        for (String line : lines) {
            String lower = line.toLowerCase();
            if (lower.contains("b.tech") || lower.contains("bachelor") || lower.contains("m.tech") || lower.contains("b.e.") || lower.contains("degree") || lower.contains("b.sc")) {
                String degree = line.replaceAll("(?i)cgpa[:\\s]*[\\d./]+", "").replaceAll("\\d{4}\\s*[–-]\\s*\\d{4}", "").replaceAll("[|•–]", "").trim();
                edu.put("degree", degree);
            } else if (lower.contains("college") || lower.contains("university") || lower.contains("institute") || lower.contains("school") || lower.contains("svecw") || lower.contains("vishnu")) {
                String inst = line.replaceAll("(?i)cgpa[:\\s]*[\\d./]+", "").replaceAll("\\d{4}\\s*[–-]\\s*\\d{4}", "").replaceAll("[|•–]", "").trim();
                edu.put("institution", inst);
            }
        }

        if (!edu.isEmpty()) list.add(edu);
        return list;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Skills Parsing
    // ──────────────────────────────────────────────────────────────────────────

    private List<String> extractSkills(List<String> lines, String fullResumeText) {
        Set<String> skillsFound = new LinkedHashSet<>();
        String searchSpace = lines != null && !lines.isEmpty() ? String.join("\n", lines).toUpperCase() : fullResumeText.toUpperCase();

        for (String skill : COMMON_SKILLS) {
            String escaped = Pattern.quote(skill.toUpperCase());
            Pattern p = Pattern.compile("(?<![A-Z0-9])" + escaped + "(?![A-Z0-9])");
            if (p.matcher(searchSpace).find()) {
                skillsFound.add(skill);
            }
        }
        return new ArrayList<>(skillsFound);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Projects Parsing
    // ──────────────────────────────────────────────────────────────────────────

    private static final String[] TECH_KEYWORDS = {
        "FastAPI", "React", "React.js", "ReactJS", "Python", "Java", "Spring Boot", "Django",
        "Node", "Node.js", "NodeJS", "Express", "Express.js", "C++", "C#", "TensorFlow", "PyTorch",
        "OpenCV", "Whisper", "NLP", "LLM", "LLMs", "MongoDB", "MySQL", "PostgreSQL", "SQLite",
        "Docker", "Kubernetes", "AWS", "GCP", "Azure", "Flutter", "HTML", "CSS", "Tailwind",
        "Next.js", "Vue", "Angular", "Redis", "Kafka", "Channels", "WebSockets", "Tesseract", "OCR"
    };

    private Map<String, String> splitProjectTitleAndTech(String rawLine) {
        Map<String, String> res = new HashMap<>();
        String cleaned = rawLine.replaceAll("[§ïƒ#*]", "").replaceAll("\\s*GitHub\\s*$", "").trim();

        // 1. Pipe / Bar delimiter: "Title | Tech"
        int pipeIdx = cleaned.indexOf(" | ");
        if (pipeIdx == -1) pipeIdx = cleaned.indexOf(" |");
        if (pipeIdx == -1) pipeIdx = cleaned.indexOf("| ");
        if (pipeIdx != -1) {
            res.put("name", cleaned.substring(0, pipeIdx).trim());
            res.put("tech", cleaned.substring(pipeIdx + 1).replace("|", "").trim());
            return res;
        }

        // 2. Parentheses: "Title (React, Node.js)"
        Matcher parenMatcher = Pattern.compile("^(.*?)\\s*\\(([^)]+)\\)\\s*$").matcher(cleaned);
        if (parenMatcher.find()) {
            res.put("name", parenMatcher.group(1).trim());
            res.put("tech", parenMatcher.group(2).trim());
            return res;
        }

        // 3. Comma-separated tech list detection: "AI Resume Analyzer & Corrector Java, Spring Boot, React, MongoDB"
        int firstComma = cleaned.indexOf(",");
        if (firstComma != -1) {
            String beforeComma = cleaned.substring(0, firstComma);
            for (String kw : TECH_KEYWORDS) {
                Pattern p = Pattern.compile("(?i)\\b" + Pattern.quote(kw) + "$");
                Matcher m = p.matcher(beforeComma.trim());
                if (m.find()) {
                    int startOfTech = m.start();
                    String projName = beforeComma.substring(0, startOfTech).replaceAll("[–\\-\\s]+$", "").trim();
                    String projTech = cleaned.substring(startOfTech).trim();
                    if (!projName.isEmpty() && !projTech.isEmpty()) {
                        res.put("name", projName);
                        res.put("tech", projTech);
                        return res;
                    }
                }
            }
        }

        // 4. Hyphen / dash separator: "Title – Tech"
        int dashIdx = cleaned.lastIndexOf(" – ");
        if (dashIdx == -1) dashIdx = cleaned.lastIndexOf(" - ");
        if (dashIdx == -1) dashIdx = cleaned.lastIndexOf(" — ");
        if (dashIdx != -1 && dashIdx > 5) {
            res.put("name", cleaned.substring(0, dashIdx).trim());
            res.put("tech", cleaned.substring(dashIdx + 3).trim());
            return res;
        }

        res.put("name", cleaned);
        res.put("tech", "");
        return res;
    }

    private List<Map<String, Object>> extractProjects(List<String> lines) {
        List<Map<String, Object>> list = new ArrayList<>();
        if (lines == null || lines.isEmpty()) return list;

        Map<String, Object> current = null;
        List<String> bullets = null;
        StringBuilder currentBullet = null;

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;

            if (isBullet(trimmed)) {
                if (current == null) {
                    current = new HashMap<>();
                    current.put("name", "Project");
                    bullets = new ArrayList<>();
                }
                if (currentBullet != null && currentBullet.length() > 0) {
                    bullets.add(currentBullet.toString().replaceAll("\\s+", " ").trim());
                }
                currentBullet = new StringBuilder(cleanBulletText(trimmed));
            } else if (trimmed.length() < 130 && !trimmed.endsWith(".")) {
                // Project title line
                if (currentBullet != null && currentBullet.length() > 0) {
                    bullets.add(currentBullet.toString().replaceAll("\\s+", " ").trim());
                    currentBullet = null;
                }
                if (current != null) {
                    current.put("bullets", bullets != null ? bullets : new ArrayList<>());
                    list.add(current);
                }

                current = new HashMap<>();
                bullets = new ArrayList<>();

                Map<String, String> split = splitProjectTitleAndTech(trimmed);
                current.put("name", split.getOrDefault("name", trimmed));
                if (!split.getOrDefault("tech", "").isEmpty()) {
                    current.put("tech", split.get("tech"));
                }
            } else {
                // Multi-line bullet point continuation
                if (currentBullet != null) {
                    if (currentBullet.toString().endsWith("-")) {
                        currentBullet.deleteCharAt(currentBullet.length() - 1);
                    } else {
                        currentBullet.append(" ");
                    }
                    currentBullet.append(trimmed);
                }
            }
        }

        if (currentBullet != null && currentBullet.length() > 0) {
            if (bullets != null) bullets.add(currentBullet.toString().replaceAll("\\s+", " ").trim());
        }
        if (current != null) {
            current.put("bullets", bullets != null ? bullets : new ArrayList<>());
            list.add(current);
        }

        return list;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Certifications Parsing
    // ──────────────────────────────────────────────────────────────────────────

    private List<String> extractCertifications(List<String> lines) {
        List<String> certs = new ArrayList<>();
        if (lines == null || lines.isEmpty()) return certs;

        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            certs.add(cleanBulletText(trimmed));
        }
        return certs;
    }
}
