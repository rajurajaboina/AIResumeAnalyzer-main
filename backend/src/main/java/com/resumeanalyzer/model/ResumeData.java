package com.resumeanalyzer.model;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ResumeData {
    private Map<String, String> contactInfo = new HashMap<>();
    private String summary = "";
    private List<String> skills = new ArrayList<>();
    private Map<String, String> skillCategories = new HashMap<>();
    private List<Map<String, Object>> experience = new ArrayList<>();
    private List<Map<String, Object>> education = new ArrayList<>();
    private List<Map<String, Object>> projects = new ArrayList<>();
    private List<String> certifications = new ArrayList<>();
    private List<String> achievements = new ArrayList<>();

    public ResumeData() {}

    public Map<String, String> getSkillCategories() { return skillCategories; }
    public void setSkillCategories(Map<String, String> skillCategories) { this.skillCategories = skillCategories; }

    public Map<String, String> getContactInfo() { return contactInfo; }
    public void setContactInfo(Map<String, String> contactInfo) { this.contactInfo = contactInfo; }

    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public List<Map<String, Object>> getExperience() { return experience; }
    public void setExperience(List<Map<String, Object>> experience) { this.experience = experience; }

    public List<Map<String, Object>> getEducation() { return education; }
    public void setEducation(List<Map<String, Object>> education) { this.education = education; }

    public List<Map<String, Object>> getProjects() { return projects; }
    public void setProjects(List<Map<String, Object>> projects) { this.projects = projects; }

    public List<String> getCertifications() { return certifications; }
    public void setCertifications(List<String> certifications) { this.certifications = certifications; }

    public List<String> getAchievements() { return achievements; }
    public void setAchievements(List<String> achievements) { this.achievements = achievements; }
}
