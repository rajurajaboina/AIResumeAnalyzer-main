package com.resumeanalyzer.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.completion.chat.ChatMessageRole;
import com.theokanning.openai.service.OpenAiService;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    private void validateApiKey() {
        boolean keyMissing = openaiApiKey == null || openaiApiKey.isBlank() || openaiApiKey.contains("your-api-key");
        if (keyMissing) {
            log.warn("========================================================");
            log.warn("  OpenAI API key is NOT configured.");
            log.warn("  AI features will use advanced NLP heuristic matching.");
            log.warn("  Set OPENAI_API_KEY env variable to enable OpenAI model.");
            log.warn("========================================================");
        } else {
            log.info("OpenAI API key detected — AI features are fully enabled.");
        }
    }

    /**
     * Curated, domain-aware skills dictionary.
     * ONLY real skills, tools, technologies, and domain-specific competencies.
     * Never include common English words, job titles, cities, adjectives, or verbs.
     */
    private static final Map<String, String[]> SKILL_DOMAINS = new LinkedHashMap<>();
    static {
        // Software Engineering
        SKILL_DOMAINS.put("Languages", new String[]{
            "java", "python", "c++", "c#", "c", "javascript", "typescript", "sql", "kotlin", "swift",
            "rust", "go", "scala", "r", "matlab", "php", "ruby"
        });
        SKILL_DOMAINS.put("Frontend", new String[]{
            "react", "react.js", "angular", "vue", "vue.js", "html", "css", "tailwind", "tailwind css",
            "bootstrap", "redux", "next.js", "svelte", "jquery"
        });
        SKILL_DOMAINS.put("Backend", new String[]{
            "spring boot", "django", "flask", "node.js", "express", "fastapi", "rails", "laravel",
            "rest api", "graphql", "microservices", "grpc", "websockets"
        });
        SKILL_DOMAINS.put("Databases", new String[]{
            "sql", "mysql", "postgresql", "mongodb", "sqlite", "redis", "cassandra", "elasticsearch",
            "oracle", "firebase", "dynamodb", "nosql"
        });
        SKILL_DOMAINS.put("DevOps & Cloud", new String[]{
            "docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "jenkins", "github actions",
            "terraform", "ansible", "linux", "nginx", "maven", "gradle"
        });
        SKILL_DOMAINS.put("Tools", new String[]{
            "git", "github", "postman", "jira", "confluence", "vs code", "intellij", "figma"
        });
        SKILL_DOMAINS.put("CS Fundamentals", new String[]{
            "data structures", "algorithms", "system design", "object-oriented programming", "oop",
            "operating systems", "computer networks", "dbms", "software engineering", "agile", "scrum"
        });
        SKILL_DOMAINS.put("AI & ML", new String[]{
            "machine learning", "deep learning", "nlp", "natural language processing", "computer vision",
            "tensorflow", "pytorch", "scikit-learn", "opencv", "generative ai", "llm", "transformers",
            "hugging face", "openai", "langchain", "rag"
        });
        // Marketing & Content
        SKILL_DOMAINS.put("Content Creation", new String[]{
            "content creation", "content writing", "copywriting", "storytelling", "scriptwriting",
            "video editing", "reels", "short-form video", "youtube content", "podcasting"
        });
        SKILL_DOMAINS.put("Social Media", new String[]{
            "social media marketing", "instagram", "linkedin marketing", "youtube", "twitter", "facebook ads",
            "tiktok", "content calendar", "community management", "brand voice", "personal branding"
        });
        SKILL_DOMAINS.put("Design & Creative Tools", new String[]{
            "canva", "capcut", "adobe premiere", "adobe photoshop", "adobe illustrator", "figma",
            "davinci resolve", "after effects"
        });
        SKILL_DOMAINS.put("Digital Marketing", new String[]{
            "seo", "sem", "google analytics", "keyword research", "email marketing", "growth hacking",
            "a/b testing", "ctr", "engagement rate", "conversion rate optimization", "digital marketing",
            "performance marketing", "google ads", "meta ads"
        });
        SKILL_DOMAINS.put("AI Tools", new String[]{
            "chatgpt", "gemini", "claude", "midjourney", "dall-e", "ai video generation", "prompt engineering"
        });
        // Data & Analytics
        SKILL_DOMAINS.put("Data Analytics", new String[]{
            "data analysis", "tableau", "power bi", "ms excel", "microsoft excel", "google sheets", "statistics", "pandas",
            "numpy", "matplotlib", "data visualization"
        });
        // Product & Business
        SKILL_DOMAINS.put("Product & Business", new String[]{
            "product management", "project management", "market research", "user research",
            "wireframing", "prototyping", "ui/ux", "product roadmap"
        });
        // Finance & FinTech
        SKILL_DOMAINS.put("Finance & FinTech", new String[]{
            "blockchain", "web3", "smart contracts", "solidity", "defi", "fintech", "payment gateway",
            "financial modelling", "trading systems"
        });
    }

    public String analyzeResume(String resumeText, String jobDescription) {
        String prompt = buildAnalysisPrompt(resumeText, jobDescription);
        return callOpenAI(prompt, () -> generateAnalysisFallback(resumeText, jobDescription));
    }

    public String extractKeywords(String jobDescription) {
        String prompt = buildKeywordExtractionPrompt(jobDescription);
        return callOpenAI(prompt, () -> generateKeywordExtractionFallback(jobDescription));
    }

    public String rewriteBulletPoint(String bulletPoint, String rewriteType) {
        String prompt = buildBulletRewritePrompt(bulletPoint, rewriteType);
        return callOpenAI(prompt, () -> generateBulletRewriteFallback(bulletPoint, rewriteType));
    }

    public String generateSummary(String resumeText, String jobDescription) {
        String prompt = buildSummaryPrompt(resumeText, jobDescription);
        return callOpenAI(prompt, () -> generateSummaryFallback(resumeText, jobDescription));
    }

    public String suggestSkills(String resumeText, String jobDescription) {
        String prompt = buildSkillsPrompt(resumeText, jobDescription);
        return callOpenAI(prompt, () -> generateSkillsFallback(resumeText, jobDescription));
    }

    public String generateCoverLetter(String resumeText, String jobDescription, String userName) {
        String prompt = buildCoverLetterPrompt(resumeText, jobDescription, userName);
        return callOpenAI(prompt, () -> generateCoverLetterFallback(resumeText, jobDescription, userName));
    }

    private String callOpenAI(String prompt, FallbackSupplier fallbackSupplier) {
        if (openaiApiKey == null || openaiApiKey.trim().isEmpty() || openaiApiKey.contains("your-api-key")) {
            return fallbackSupplier.get();
        }

        try {
            OpenAiService service = new OpenAiService(openaiApiKey.trim());

            List<ChatMessage> messages = new ArrayList<>();
            messages.add(new ChatMessage(ChatMessageRole.SYSTEM.value(),
                "You are an expert ATS resume analyzer. Provide responses strictly in valid JSON format."));
            messages.add(new ChatMessage(ChatMessageRole.USER.value(), prompt));

            ChatCompletionRequest request = ChatCompletionRequest.builder()
                .model("gpt-3.5-turbo")
                .messages(messages)
                .build();

            String response = service.createChatCompletion(request)
                .getChoices()
                .get(0)
                .getMessage()
                .getContent();

            return response;
        } catch (Exception e) {
            log.warn("OpenAI API call failed: {}. Falling back to NLP heuristic engine.", e.getMessage());
            return fallbackSupplier.get();
        }
    }

    @FunctionalInterface
    private interface FallbackSupplier {
        String get();
    }

    // ── Prompt Builders ────────────────────────────────────────────────────────

    private String buildAnalysisPrompt(String resumeText, String jobDescription) {
        return String.format(
            "Analyze the following resume against the job description and provide a JSON response with this structure:\n" +
            "{\n" +
            "  \"atsScore\": <number 0-100>,\n" +
            "  \"matchedKeywords\": [\"keyword1\", \"keyword2\"],\n" +
            "  \"missingKeywords\": [\"keyword1\", \"keyword2\"],\n" +
            "  \"matchedSkills\": [\"skill1\", \"skill2\"],\n" +
            "  \"missingSkills\": [\"skill1\", \"skill2\"],\n" +
            "  \"sectionFeedback\": {\n" +
            "    \"summary\": \"feedback\",\n" +
            "    \"skills\": \"feedback\",\n" +
            "    \"experience\": \"feedback\",\n" +
            "    \"projects\": \"feedback\"\n" +
            "  },\n" +
            "  \"aiSuggestions\": [\"suggestion1\", \"suggestion2\"],\n" +
            "  \"improvedBullets\": [\n" +
            "    {\"before\": \"original\", \"after\": \"improved\"}\n" +
            "  ],\n" +
            "  \"finalRecommendation\": \"overall recommendation\"\n" +
            "}\n\n" +
            "Resume:\n%s\n\n" +
            "Job Description:\n%s",
            resumeText, jobDescription
        );
    }

    private String buildKeywordExtractionPrompt(String jobDescription) {
        return String.format(
            "Extract important keywords, skills, technologies, and qualifications from the following job description. " +
            "Return as JSON with structure: {\"keywords\": [\"keyword1\", \"keyword2\"], \"skills\": [\"skill1\", \"skill2\"], \"technologies\": [\"tech1\", \"tech2\"]}\n\n" +
            "Job Description:\n%s",
            jobDescription
        );
    }

    private String buildBulletRewritePrompt(String bulletPoint, String rewriteType) {
        String instruction = switch (rewriteType.toLowerCase()) {
            case "technical" -> "Make it more technical with specific keywords";
            case "shorter" -> "Make it more concise";
            case "fresher" -> "Make it suitable for a fresher/entry-level";
            default -> "Make it more professional with strong action verbs";
        };

        return String.format(
            "Rewrite the following resume bullet point to %s. " +
            "Return as JSON with structure: {\"originalBullet\": \"%s\", \"rewrittenBullet\": \"improved version\", \"explanation\": \"why this is better\"}\n\n" +
            "Bullet Point: %s",
            instruction, bulletPoint, bulletPoint
        );
    }

    private String buildSummaryPrompt(String resumeText, String jobDescription) {
        return String.format(
            "Write a professional summary for the resume based on the job description. " +
            "Return as JSON with structure: {\"summary\": \"professional summary text\"}\n\n" +
            "Resume:\n%s\n\n" +
            "Job Description:\n%s",
            resumeText, jobDescription
        );
    }

    private String buildSkillsPrompt(String resumeText, String jobDescription) {
        return String.format(
            "Suggest skills to add to the resume based on the job description. " +
            "Return as JSON with structure: {\"suggestedSkills\": [\"skill1\", \"skill2\"], \"reason\": \"explanation\"}\n\n" +
            "Resume:\n%s\n\n" +
            "Job Description:\n%s",
            resumeText, jobDescription
        );
    }

    private String buildCoverLetterPrompt(String resumeText, String jobDescription, String userName) {
        return String.format(
            "Write a professional cover letter based on the resume and job description. " +
            "Return as JSON with structure: {\"coverLetter\": \"cover letter text\"}\n\n" +
            "Applicant Name: %s\n\n" +
            "Resume:\n%s\n\n" +
            "Job Description:\n%s",
            userName, resumeText, jobDescription
        );
    }

    // ── Advanced NLP Heuristic Matching Engine ─────────────────────────────────

    /**
     * Extract ONLY real, meaningful skill/technology keywords from a JD.
     * Matches strictly against the curated SKILL_DOMAINS dictionary.
     * Never extracts raw English words, adjectives, verbs, or proper nouns.
     */
    private Set<String> extractJdKeywords(String jobDescription) {
        if (jobDescription == null || jobDescription.isBlank()) return Set.of();
        String jdLower = jobDescription.toLowerCase();

        Set<String> extracted = new LinkedHashSet<>();

        // Only scan against the curated, domain-specific skills dictionary.
        // Multi-word skills checked first (e.g. "spring boot" before "boot").
        for (Map.Entry<String, String[]> domain : SKILL_DOMAINS.entrySet()) {
            for (String skill : domain.getValue()) {
                // Use word-boundary-aware matching to avoid partial matches.
                // e.g. "sql" should not match inside "nosql" when looking for "sql"
                String escapedSkill = Pattern.quote(skill);
                Pattern p = Pattern.compile("(?i)(?<![a-z])" + escapedSkill + "(?![a-z])");
                if (p.matcher(jdLower).find()) {
                    // Store in display-friendly format
                    extracted.add(formatSkillDisplay(skill));
                }
            }
        }

        return extracted;
    }

    /** Format skill for display: uppercase known acronyms, title-case everything else */
    private String formatSkillDisplay(String skill) {
        Set<String> ACRONYMS = Set.of("sql", "nosql", "html", "css", "api", "rest api", "graphql",
            "aws", "gcp", "nlp", "llm", "oop", "dbms", "ci/cd", "ui/ux", "seo", "sem", "ctr",
            "a/b testing", "rag");
        if (ACRONYMS.contains(skill.toLowerCase())) {
            return skill.toUpperCase();
        }
        // Title case each word
        return Arrays.stream(skill.split(" "))
            .map(w -> w.isEmpty() ? w : Character.toUpperCase(w.charAt(0)) + w.substring(1))
            .collect(Collectors.joining(" "));
    }

    /**
     * Semantic Skill Synonyms & Equivalences dictionary.
     * Allows NoSQL to match MongoDB/Cassandra, SQL to match MySQL/Postgres,
     * DSA to match LeetCode, REST API to match RESTful/Endpoints, etc.
     */
    private static final Map<String, List<String>> SKILL_SYNONYMS = new HashMap<>();
    static {
        // NoSQL & Databases
        SKILL_SYNONYMS.put("nosql", List.of("nosql", "mongodb", "cassandra", "dynamodb", "redis", "firebase", "firestore", "couchdb", "hbase", "documentdb", "neo4j"));
        SKILL_SYNONYMS.put("mongodb", List.of("mongodb", "nosql", "documentdb"));
        SKILL_SYNONYMS.put("sql", List.of("sql", "mysql", "postgresql", "postgres", "sqlite", "oracle", "mariadb", "mssql", "sql server", "rdbms", "relational database"));
        SKILL_SYNONYMS.put("mysql", List.of("mysql", "sql", "rdbms"));
        SKILL_SYNONYMS.put("postgresql", List.of("postgresql", "postgres", "sql", "psql"));
        SKILL_SYNONYMS.put("sqlite", List.of("sqlite", "sql", "rdbms", "embedded database"));
        SKILL_SYNONYMS.put("redis", List.of("redis", "caching", "in-memory", "nosql"));

        // Backend & APIs
        SKILL_SYNONYMS.put("rest api", List.of("rest api", "rest apis", "restful", "rest", "api integration", "apis", "endpoints", "web services", "api"));
        SKILL_SYNONYMS.put("spring boot", List.of("spring boot", "springboot", "spring framework", "spring", "spring mvc"));
        SKILL_SYNONYMS.put("node.js", List.of("node.js", "nodejs", "node", "express", "express.js"));
        SKILL_SYNONYMS.put("django", List.of("django", "django rest framework", "drf", "django channels"));
        SKILL_SYNONYMS.put("jwt authentication", List.of("jwt", "jwt authentication", "json web token", "authentication", "auth"));

        // Frontend
        SKILL_SYNONYMS.put("react", List.of("react", "react.js", "reactjs", "react native"));
        SKILL_SYNONYMS.put("react.js", List.of("react", "react.js", "reactjs", "react native"));
        SKILL_SYNONYMS.put("html", List.of("html", "html5"));
        SKILL_SYNONYMS.put("css", List.of("css", "css3", "tailwind", "bootstrap", "sass", "scss"));
        SKILL_SYNONYMS.put("tailwind css", List.of("tailwind", "tailwind css", "tailwindcss"));
        SKILL_SYNONYMS.put("tailwind", List.of("tailwind", "tailwind css", "tailwindcss"));
        SKILL_SYNONYMS.put("javascript", List.of("javascript", "js", "es6", "ecmascript"));
        SKILL_SYNONYMS.put("typescript", List.of("typescript", "ts"));
        SKILL_SYNONYMS.put("c++", List.of("c++", "cpp"));

        // CS Core Fundamentals
        SKILL_SYNONYMS.put("data structures", List.of("data structures", "dsa", "algorithms", "leetcode", "problem solving", "competitive programming", "codechef", "hackerrank"));
        SKILL_SYNONYMS.put("algorithms", List.of("algorithms", "data structures", "dsa", "leetcode", "problem solving", "algorithmic", "codechef", "hackerrank"));
        SKILL_SYNONYMS.put("object-oriented programming", List.of("object-oriented programming", "oop", "oops", "object oriented", "object-oriented"));
        SKILL_SYNONYMS.put("oop", List.of("oop", "oops", "object-oriented programming", "object oriented"));
        SKILL_SYNONYMS.put("dbms", List.of("dbms", "database management", "rdbms", "database", "sql", "mysql", "mongodb", "postgresql"));
        SKILL_SYNONYMS.put("operating systems", List.of("operating systems", "os", "linux", "unix", "ubuntu"));
        SKILL_SYNONYMS.put("computer networks", List.of("computer networks", "networking", "tcp/ip", "http", "https", "network"));

        // Cloud & DevOps
        SKILL_SYNONYMS.put("docker", List.of("docker", "containerization", "containers", "dockerfile", "docker-compose"));
        SKILL_SYNONYMS.put("kubernetes", List.of("kubernetes", "k8s", "container orchestration"));
        SKILL_SYNONYMS.put("aws", List.of("aws", "amazon web services", "ec2", "s3", "lambda", "cloud"));
        SKILL_SYNONYMS.put("gcp", List.of("gcp", "google cloud", "google cloud platform"));
        SKILL_SYNONYMS.put("azure", List.of("azure", "microsoft azure"));
        SKILL_SYNONYMS.put("ci/cd", List.of("ci/cd", "cicd", "continuous integration", "jenkins", "github actions", "gitlab"));
        SKILL_SYNONYMS.put("git", List.of("git", "github", "version control", "gitlab"));
        SKILL_SYNONYMS.put("github", List.of("github", "git", "version control"));

        // AI / ML
        SKILL_SYNONYMS.put("machine learning", List.of("machine learning", "ml", "scikit-learn", "tensorflow", "pytorch", "deep learning", "amazon ml summer school"));
        SKILL_SYNONYMS.put("deep learning", List.of("deep learning", "neural networks", "cnn", "rnn", "transformers", "tensorflow", "pytorch"));
        SKILL_SYNONYMS.put("generative ai", List.of("generative ai", "genai", "gen ai", "llm", "large language models", "openai", "whisper", "transformers", "prompt engineering"));
        SKILL_SYNONYMS.put("llm", List.of("llm", "large language models", "generative ai", "gen ai", "openai", "transformers", "whisper"));
        SKILL_SYNONYMS.put("nlp", List.of("nlp", "natural language processing", "text processing", "transformers", "whisper", "bert"));
        SKILL_SYNONYMS.put("computer vision", List.of("computer vision", "opencv", "ocr", "tesseract", "image processing", "detection"));
        SKILL_SYNONYMS.put("opencv", List.of("opencv", "computer vision", "image processing", "ocr", "tesseract"));

        // Content & Marketing
        SKILL_SYNONYMS.put("content creation", List.of("content creation", "content creator", "content writing", "reels", "shorts", "blogging", "video editing"));
        SKILL_SYNONYMS.put("video editing", List.of("video editing", "capcut", "premiere", "after effects", "reels", "shorts", "video creation"));
        SKILL_SYNONYMS.put("social media marketing", List.of("social media", "social media marketing", "instagram", "linkedin", "youtube", "tiktok", "twitter"));
        SKILL_SYNONYMS.put("copywriting", List.of("copywriting", "content writing", "storytelling", "scriptwriting", "hooks", "captions"));
        SKILL_SYNONYMS.put("seo", List.of("seo", "search engine optimization", "keyword research", "sem", "search ranking"));
        SKILL_SYNONYMS.put("ui/ux", List.of("ui/ux", "ui design", "ux design", "figma", "wireframing", "prototyping", "user research"));
    }

    private boolean containsWord(String text, String target) {
        if (text == null || target == null || target.isEmpty()) return false;
        String key = target.toLowerCase().trim();

        // For short acronyms and language names (<= 4 chars like "go", "c", "r", "js", "sql", "git", "aws", "gcp"),
        // enforce strict word-boundary matching to prevent false positives inside words like "django", "google", "algorithms"
        String escaped = Pattern.quote(key);
        Pattern p = Pattern.compile("(?i)(?<![a-zA-Z0-9+#])" + escaped + "(?![a-zA-Z0-9+#])");
        return p.matcher(text).find();
    }

    private boolean isSkillMatchedInResume(String kw, String resLower) {
        if (kw == null || resLower == null) return false;
        String key = kw.toLowerCase().trim();

        // 1. Direct word-boundary match in resume text
        if (containsWord(resLower, key)) return true;

        // 2. Semantic synonym check
        List<String> synonyms = SKILL_SYNONYMS.get(key);
        if (synonyms != null) {
            for (String syn : synonyms) {
                if (containsWord(resLower, syn.toLowerCase())) {
                    return true;
                }
            }
        }
        return false;
    }

    private String generateAnalysisFallback(String resumeText, String jobDescription) {
        String resLower = resumeText != null ? resumeText.toLowerCase() : "";
        Set<String> jdKeywords = extractJdKeywords(jobDescription);

        if (jdKeywords.isEmpty()) {
            jdKeywords = Set.of("Communication", "Problem Solving", "Teamwork", "Projects");
        }

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String kw : jdKeywords) {
            if (isSkillMatchedInResume(kw, resLower)) {
                matched.add(kw);
            } else {
                missing.add(kw);
            }
        }

        int matchedCount = matched.size();
        int totalJdCount = jdKeywords.size();

        // Calculate realistic ATS match percentage
        int score = 30; // base score floor
        if (totalJdCount > 0) {
            double ratio = (double) matchedCount / totalJdCount;
            score = (int) Math.round(ratio * 100.0);
            score = Math.max(15, Math.min(98, score));
        }

        ObjectNode root = objectMapper.createObjectNode();
        root.put("atsScore", score);

        ArrayNode matchedArr = root.putArray("matchedKeywords");
        matched.forEach(matchedArr::add);

        ArrayNode missingArr = root.putArray("missingKeywords");
        missing.forEach(missingArr::add);

        ArrayNode matchedSkillsArr = root.putArray("matchedSkills");
        matched.forEach(matchedSkillsArr::add);

        ArrayNode missingSkillsArr = root.putArray("missingSkills");
        missing.forEach(missingSkillsArr::add);

        ObjectNode sectionFeedback = root.putObject("sectionFeedback");
        if (score < 50) {
            sectionFeedback.put("summary", "Major Domain Mismatch: Your resume highlights a different field (e.g. Software Engineering) than the target job requirements.");
            sectionFeedback.put("skills", "Missing key role requirements: " + String.join(", ", missing.subList(0, Math.min(5, missing.size()))));
            sectionFeedback.put("experience", "Re-frame experience bullet points to demonstrate relevant skills listed in the job description.");
            sectionFeedback.put("projects", "Add portfolio projects directly relevant to the target job domain.");
        } else {
            sectionFeedback.put("summary", "Align your professional summary directly with target job titles and responsibilities.");
            sectionFeedback.put("skills", missing.isEmpty() ? "Excellent skill match!" : "Consider highlighting: " + String.join(", ", missing.subList(0, Math.min(3, missing.size()))));
            sectionFeedback.put("experience", "Quantify accomplishments using action verbs and measurable metrics.");
            sectionFeedback.put("projects", "Ensure projects demonstrate practical application of target tools.");
        }

        ArrayNode suggestions = root.putArray("aiSuggestions");
        if (score < 50) {
            suggestions.add("CRITICAL GAP: Your resume domain does not match this job posting. Tailor your skills section to include target job requirements.");
            suggestions.add("Add target keywords such as: " + String.join(", ", missing.subList(0, Math.min(4, missing.size()))));
            suggestions.add("Highlight relevant transferable skills or domain-specific personal projects.");
        } else {
            suggestions.add("Incorporate missing target keywords directly into work experience bullets.");
            suggestions.add("Add measurable metrics (percentages, volume, impact) to project descriptions.");
            suggestions.add("Tailor your summary statement to mirror the specific job title.");
        }

        ArrayNode bullets = root.putArray("improvedBullets");
        ObjectNode b1 = bullets.addObject();
        if (!missing.isEmpty()) {
            String targetKw = missing.get(0);
            b1.put("before", "Worked on projects and delivered assigned tasks.");
            b1.put("after", "Spearheaded " + targetKw + " initiatives, optimizing workflow efficiency and driving key project outcomes.");
        } else {
            b1.put("before", "Worked on software applications.");
            b1.put("after", "Engineered scalable application features, increasing performance and user engagement by 25%.");
        }

        String matchLevel = score >= 80 ? "Excellent" : score >= 60 ? "Moderate" : "Low";
        root.put("finalRecommendation", String.format(
            "ATS Match Assessment (%s Match - %d%%): %s",
            matchLevel, score,
            score < 50
                ? "Significant skill & keyword gap detected. The job requires specific domain skills (" + String.join(", ", missing.subList(0, Math.min(4, missing.size()))) + ") that are currently missing from your resume."
                : "Your resume aligns well with key requirements. Adding the listed missing skills will further boost your ATS score."
        ));

        return root.toPrettyString();
    }

    private String generateKeywordExtractionFallback(String jobDescription) {
        Set<String> keywords = extractJdKeywords(jobDescription);

        ObjectNode root = objectMapper.createObjectNode();
        ArrayNode kwArr = root.putArray("keywords");
        keywords.forEach(kwArr::add);

        ArrayNode skillsArr = root.putArray("skills");
        keywords.forEach(skillsArr::add);

        ArrayNode techArr = root.putArray("technologies");
        keywords.forEach(techArr::add);

        return root.toPrettyString();
    }

    private String generateBulletRewriteFallback(String bulletPoint, String rewriteType) {
        String cleanBullet = bulletPoint != null ? bulletPoint.trim() : "Responsible for project execution.";
        String improved;

        String type = rewriteType != null ? rewriteType.toLowerCase() : "professional";
        switch (type) {
            case "technical" -> improved = "Engineered robust application workflows using industry best practices, optimizing performance and system reliability.";
            case "shorter" -> improved = "Streamlined project deliverables, boosting operational efficiency by 20%.";
            case "fresher" -> improved = "Collaborated with cross-functional teams to build, test, and deploy functional features on schedule.";
            default -> improved = "Spearheaded key initiatives using structured methodologies, accelerating project delivery and user engagement.";
        }

        ObjectNode root = objectMapper.createObjectNode();
        root.put("originalBullet", cleanBullet);
        root.put("rewrittenBullet", cleanBullet + " — " + improved);
        root.put("explanation", "Enhanced with metric-driven action verbs for improved ATS keyword ranking.");

        return root.toPrettyString();
    }

    private String generateSummaryFallback(String resumeText, String jobDescription) {
        Set<String> jdKeywords = extractJdKeywords(jobDescription);
        String topSkills = jdKeywords.stream().limit(4).collect(Collectors.joining(", "));

        ObjectNode root = objectMapper.createObjectNode();
        root.put("summary", String.format(
            "Adaptable professional with hands-on expertise in %s. Proven track record of executing projects, solving complex problems, and driving measurable results aligned with organizational goals.",
            topSkills.isEmpty() ? "technical development and domain problem-solving" : topSkills
        ));
        return root.toPrettyString();
    }

    private String generateSkillsFallback(String resumeText, String jobDescription) {
        String resLower = resumeText != null ? resumeText.toLowerCase() : "";
        Set<String> jdKeywords = extractJdKeywords(jobDescription);

        List<String> missing = jdKeywords.stream()
            .filter(kw -> !isSkillMatchedInResume(kw, resLower))
            .collect(Collectors.toList());

        if (missing.isEmpty()) {
            missing = List.of("System Design", "Distributed Systems", "Cloud Computing");
        }

        ObjectNode root = objectMapper.createObjectNode();
        ArrayNode arr = root.putArray("suggestedSkills");
        missing.forEach(arr::add);
        root.put("reason", "These core skills are emphasized in the target job description but absent from your resume.");

        return root.toPrettyString();
    }

    private String generateCoverLetterFallback(String resumeText, String jobDescription, String userName) {
        String name = (userName != null && !userName.trim().isEmpty()) ? userName : "Applicant";
        String resLower = resumeText != null ? resumeText.toLowerCase() : "";
        String jdLower = jobDescription != null ? jobDescription.toLowerCase() : "";

        // Extract Role Title from JD
        String targetRole = "Software Engineering Intern";
        if (jobDescription != null) {
            String[] firstLines = jobDescription.split("\\r?\\n");
            for (String line : firstLines) {
                String trimmed = line.trim();
                if (trimmed.length() > 3 && trimmed.length() < 60 && !trimmed.toLowerCase().startsWith("the") && !trimmed.contains("@")) {
                    targetRole = trimmed.replaceAll("^[#*\\-\\s]+", "");
                    break;
                }
            }
        }

        // Extract Company Name from JD
        String companyName = "your organization";
        if (jdLower.contains("coindcx")) companyName = "CoinDCX";
        else if (jdLower.contains("amazon")) companyName = "Amazon";
        else if (jdLower.contains("flipkart")) companyName = "Flipkart";
        else if (jdLower.contains("google")) companyName = "Google";
        else if (jdLower.contains("microsoft")) companyName = "Microsoft";
        else {
            // Try extracting from patterns like "At [Company]" or "Join [Company]"
            Pattern p = Pattern.compile("(?i)(?:at|join|with|welcome to)\\s+([A-Z][a-zA-Z0-9]+(?:\\s+[A-Z][a-zA-Z0-9]+)?)");
            if (jobDescription != null) {
                Matcher m = p.matcher(jobDescription);
                if (m.find() && !List.of("The", "Our", "This", "An", "You").contains(m.group(1).trim())) {
                    companyName = m.group(1).trim();
                }
            }
        }

        // Find Matched Skills
        Set<String> jdKeywords = extractJdKeywords(jobDescription);
        List<String> matchedSkills = jdKeywords.stream()
            .filter(kw -> isSkillMatchedInResume(kw, resLower))
            .collect(Collectors.toList());

        String keySkillsText = matchedSkills.isEmpty()
            ? "Data Structures, Algorithms, full-stack software development, and database architecture"
            : String.join(", ", matchedSkills.subList(0, Math.min(4, matchedSkills.size())));

        // Extract Key Projects from Resume
        List<String> highlightedProjects = new ArrayList<>();
        if (resLower.contains("resume analyzer")) highlightedProjects.add("AI Resume Analyzer & Corrector (built with Spring Boot, React, and MongoDB)");
        if (resLower.contains("bookswap")) highlightedProjects.add("Real-Time BookSwap Platform (utilizing Django, React, and WebSocket Channels)");
        if (resLower.contains("license plate")) highlightedProjects.add("License Plate Recognition System (leveraging OpenCV, OCR, and Node.js)");
        if (resLower.contains("meeting summarizer")) highlightedProjects.add("AI Meeting Summarizer (integrating Whisper NLP pipelines)");

        String projectHighlight = highlightedProjects.isEmpty()
            ? "architecting scalable web applications, designing REST APIs, and implementing robust database persistence"
            : String.join(" and ", highlightedProjects.subList(0, Math.min(2, highlightedProjects.size())));

        // Achievements mention
        String achievementsText = "";
        if (resLower.contains("650+") || resLower.contains("leetcode")) {
            achievementsText = "Backed by a track record of solving 650+ algorithmic challenges on LeetCode and active participation in competitive programming, ";
        } else if (resLower.contains("amazon ml summer school")) {
            achievementsText = "Having been selected for the competitive Amazon ML Summer School, ";
        }

        // Build Professional Cover Letter
        String letter = String.format(
            "Dear Hiring Manager,\n\n" +
            "I am writing to express my enthusiastic application for the %s position at %s. With a strong academic foundation in Information Technology, hands-on expertise across %s, and a passion for engineering scalable, reliable software systems, I am confident in my ability to make an immediate, positive impact on your engineering team.\n\n" +
            "Throughout my academic and project journey, I have focused on translating complex requirements into clean, production-quality code. For instance, I developed %s. These initiatives reinforced my abilities in REST API design, backend database integration (SQL and NoSQL), modular code structuring, and end-to-end debugging across the software development lifecycle.\n\n" +
            "%sI approach software engineering with strong analytical rigor and attention to detail. I am deeply drawn to %s's commitment to technological excellence, innovation, and user-centric problem solving. I thrive in collaborative, fast-paced environments where I can contribute to high-impact products while actively learning best practices from senior engineers.\n\n" +
            "Thank you for your time and consideration. I would welcome the opportunity to discuss how my technical skills, problem-solving mindset, and dedication align with %s's engineering goals.\n\n" +
            "Sincerely,\n%s",
            targetRole,
            companyName,
            keySkillsText,
            projectHighlight,
            achievementsText,
            companyName,
            companyName,
            name
        );

        ObjectNode root = objectMapper.createObjectNode();
        root.put("coverLetter", letter);
        return root.toPrettyString();
    }

    private String formatTitleCase(String str) {
        if (str == null || str.isEmpty()) return str;
        return Arrays.stream(str.split(" "))
            .map(w -> w.length() > 0 ? Character.toUpperCase(w.charAt(0)) + w.substring(1) : w)
            .collect(Collectors.joining(" "));
    }
}

