/**
 * LaTeX Template Generator for Teja Sri Lakshmi Illa's Resume
 * Supporting 4 Overleaf-style Templates:
 *  1. Modern Tech (Jake's Resume - Official Clean Template)
 *  2. Classic Executive (Traditional Serif Layout)
 *  3. Compact Two-Column (Sidebar Layout)
 *  4. Minimal Academic (Clean Professional Layout)
 */

export const TEMPLATE_OPTIONS = [
  { id: 'rendercv-engineering', name: "RenderCV Engineering (Famous ATS)", description: "Famous RenderCV engineering template using Charter font, paracol, and clean ATS highlights" },
  { id: 'modern-tech', name: "Modern Tech (Jake's Resume)", description: "Official clean ATS-optimized single-column layout" },
  { id: 'classic-executive', name: "Classic Executive", description: "Traditional serif typography with centered header & classic navy dividers" },
  { id: 'compact-sidebar', name: "Compact Two-Column", description: "Sidebar layout highlighting contact & skills alongside experience" },
  { id: 'minimal-academic', name: "Minimalist Academic", description: "Focused layout for projects, research, education & competitive programming" },
];

export const TEJA_DEFAULT_RESUME_DATA = {
  contactInfo: {
    name: 'TEJA SRI LAKSHMI ILLA',
    email: 'itejasrilakshmi@gmail.com',
    phone: '+91 9553348754',
    linkedin: 'https://linkedin.com/in/tejasrilakshmi',
    github: 'https://github.com/tejasrilakshmi',
    portfolio: '',
  },
  summary: 'Information Technology undergraduate with strong foundations in Data Structures and Algorithms, Object-Oriented Programming, DBMS, SQL, Operating Systems, and Computer Networks. Experienced in building backend and full-stack applications using Java, Spring Boot, Python, Django, Node.js, REST APIs, MySQL, MongoDB, and Docker. Strong problem-solving background with 650+ LeetCode problems and experience developing real-time applications, API-driven systems, and payment-related workflows. Interested in building high-performance, reliable, scalable backend and payment technology systems.',
  education: [
    {
      institution: 'Shri Vishnu Engineering College for Women',
      degree: 'B.Tech in Information Technology',
      year: '2023 – 2027',
      gpa: '9.15/10',
    }
  ],
  experience: [
    {
      title: 'Amazon ML Summer School 2026 – Machine Learning Trainee',
      company: 'Amazon',
      location: 'Remote',
      dates: 'Jul 2026 – Aug 2026',
      bullets: [
        "Selected for Amazon’s competitive Machine Learning Summer School 2026 program, studying Machine Learning, Deep Learning, Transformers, and Large Language Models.",
        "Implementing machine learning algorithms and optimization techniques using Python, NumPy, Pandas, Scikit-learn, and TensorFlow.",
        "Strengthened analytical problem-solving and model development skills through hands-on work with data processing, neural networks, and modern AI techniques."
      ]
    }
  ],
  skillCategories: {
    "Languages": "Java, Python, C++, C, JavaScript, SQL",
    "Backend": "Spring Boot, Django, Node.js, REST APIs, API Integration, JWT Authentication",
    "Core CS": "Data Structures and Algorithms, Object-Oriented Programming, DBMS, Operating Systems, Computer Networks, Software Engineering",
    "Databases": "MySQL, MongoDB, PostgreSQL, SQLite",
    "Systems & Tools": "Docker, Linux, Git, GitHub, Postman, AWS Basics",
    "Frontend": "React.js, JavaScript, HTML, CSS, Tailwind CSS",
    "AI / ML": "Machine Learning, TensorFlow, OpenCV, NLP, Generative AI, LLM Applications"
  },
  skills: [
    "Java", "Python", "C++", "C", "JavaScript", "SQL", "Spring Boot", "Django", "Node.js",
    "REST APIs", "MySQL", "MongoDB", "Docker", "Git", "GitHub", "React.js", "Machine Learning",
    "Data Structures", "Algorithms", "DBMS", "Operating Systems", "Computer Networks"
  ],
  projects: [
    {
      name: 'License Plate Recognition Parking System',
      tech: 'Python, OpenCV, Node.js, MongoDB',
      bullets: [
        "Developed an automated parking management system for vehicle identification, entry/exit tracking, parking operations, and payment-related workflows.",
        "Implemented automatic license plate detection and OCR using OpenCV and Tesseract, enabling automated vehicle identification.",
        "Integrated QR-based UPI payment processing into the parking workflow, connecting vehicle records with payment-related operations.",
        "Built backend services using Node.js and MongoDB for vehicle history, parking records, and real-time monitoring."
      ]
    },
    {
      name: 'AI Resume Analyzer & Corrector',
      tech: 'Java, Spring Boot, React, MongoDB',
      bullets: [
        "Developed a full-stack application with a Spring Boot backend and React frontend for resume analysis, job-description matching, and personalized recommendations.",
        "Designed and implemented REST APIs and backend services for resume processing, authentication, resume versions, and AI-powered analysis workflows.",
        "Implemented MongoDB persistence and modular backend components to support maintainable application development.",
        "Used Git, API testing, debugging, and modular software design practices throughout development."
      ]
    },
    {
      name: 'Real-Time BookSwap Platform',
      tech: 'Django, React, MySQL, REST APIs',
      bullets: [
        "Built a full-stack platform for buying, renting, exchanging, and discovering books through a responsive web application.",
        "Developed backend APIs and database operations for users, books, listings, and transaction-related workflows.",
        "Implemented Django Channels for real-time user communication and integrated Google Maps API for location-based discovery.",
        "Designed modular React components and integrated them with backend REST APIs."
      ]
    },
    {
      name: 'AI Meeting Summarizer',
      tech: 'Python, Whisper, NLP, SQLite',
      bullets: [
        "Built an AI-powered application that converts meeting audio into text and generates structured summaries and action items.",
        "Developed automated data-processing workflows using OpenAI Whisper and NLP techniques.",
        "Implemented SQLite persistence and SMTP integration for meeting information and automated summary delivery."
      ]
    }
  ],
  competitiveProgramming: [
    "LeetCode: Solved 650+ problems, demonstrating strong Data Structures, Algorithms, and problem-solving skills.",
    "CodeChef: Solved 1500+ programming problems.",
    "HackerRank: 5-star rating in Python and Problem Solving.",
    "Codeforces: Active competitive programming participant."
  ],
  achievements: [
    "Selected for Amazon ML Summer School 2026.",
    "Flipkart GRID 7.0: Semifinalist.",
    "AIGNITE GenAI Hackathon: Secured 5th position.",
    "GenAI Hackathon: Qualified for Round 3.",
    "GDG Figma Design Competition: Secured 2nd place.",
    "Recipient of the She Codes '24 Scholarship."
  ],
  leadership: [
    "Psychology Club Coordinator – Coordinated student activities and collaborated with students and faculty to organize club initiatives.",
    "Google Developer Groups (GDG) – Active member participating in technical workshops, hackathons, and developer events.",
    "Women Techmakers (WTM) – Participated in technical sessions, community initiatives, and professional development events."
  ],
  certifications: [
    "Java Completion Certificate – Infosys Pragati Cohort-5",
    "Python Basic Certificate – HackerRank",
    "Prompt Mastery – Naukri"
  ]
};

const escapeLatex = (str) => {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/&/g, '\\&')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
};

export const cleanProject = (proj) => {
  if (!proj) return { name: '', tech: '', bullets: [] };
  let name = (proj.name || '').trim();
  let tech = (proj.tech || '').trim();

  if (!tech && name) {
    // 1. Pipe / Bar delimiter: "Title | Tech"
    const pipeIdx = name.indexOf(' | ') !== -1 ? name.indexOf(' | ') : (name.indexOf(' |') !== -1 ? name.indexOf(' |') : name.indexOf('| '));
    if (pipeIdx !== -1) {
      tech = name.substring(pipeIdx + 1).replace(/\|/g, '').trim();
      name = name.substring(0, pipeIdx).trim();
    } else {
      // 2. Comma-separated tech detection (e.g. "SEBI Sentinel AI FastAPI, React, Python")
      const firstComma = name.indexOf(',');
      if (firstComma !== -1) {
        const beforeFirstComma = name.substring(0, firstComma);
        const techKeywords = [
          'FastAPI', 'React', 'React.js', 'Python', 'Java', 'Spring Boot', 'Django',
          'Node', 'Node.js', 'Express', 'C++', 'TensorFlow', 'PyTorch', 'OpenCV',
          'Whisper', 'NLP', 'LLM', 'LLMs', 'MongoDB', 'MySQL', 'PostgreSQL', 'SQLite',
          'Docker', 'Kubernetes', 'AWS', 'Flutter', 'HTML', 'CSS', 'TypeScript', 'JavaScript'
        ];
        for (const kw of techKeywords) {
          const regex = new RegExp(`\\b${kw}$`, 'i');
          const match = beforeFirstComma.match(regex);
          if (match) {
            const startOfTech = beforeFirstComma.lastIndexOf(match[0]);
            tech = name.substring(startOfTech).trim();
            name = beforeFirstComma.substring(0, startOfTech).replace(/[–\-\s]+$/, '').trim();
            break;
          }
        }
      }
    }
  }

  return { ...proj, name, tech };
};

export function buildCategorizedSkills(skillsList, customCats = {}) {
  const allSkills = Array.isArray(skillsList) && skillsList.length > 0
    ? skillsList
    : TEJA_DEFAULT_RESUME_DATA.skills;

  const buckets = {
    "Languages": new Set(["Java", "Python", "C++", "C", "JavaScript", "SQL"]),
    "Backend": new Set(["Spring Boot", "Django", "Node.js", "REST APIs", "API Integration", "JWT Authentication"]),
    "Core CS": new Set(["Data Structures and Algorithms", "Object-Oriented Programming", "DBMS", "Operating Systems", "Computer Networks"]),
    "Databases": new Set(["MySQL", "MongoDB", "PostgreSQL", "SQLite"]),
    "Systems & Tools": new Set(["Docker", "Linux", "Git", "GitHub", "Postman", "AWS Basics"]),
    "Frontend": new Set(["React.js", "JavaScript", "HTML", "CSS", "Tailwind CSS"]),
    "AI / ML": new Set(["Machine Learning", "TensorFlow", "OpenCV", "NLP", "Generative AI", "LLM Applications"])
  };

  // If custom categories exist with text, add their tokens
  if (customCats && typeof customCats === 'object') {
    Object.entries(customCats).forEach(([cat, val]) => {
      if (!val) return;
      if (!buckets[cat]) buckets[cat] = new Set();
      val.split(',').map(s => s.trim()).filter(Boolean).forEach(s => buckets[cat].add(s));
    });
  }

  // Categorize all individual skills into their respective buckets
  allSkills.forEach(s => {
    if (!s || !s.trim()) return;
    const skill = s.trim();
    const sLower = skill.toLowerCase();

    if (sLower === 'go' || sLower === 'rust' || sLower === 'c' || sLower === 'c++' || sLower === 'java' || sLower === 'python' || sLower === 'javascript' || sLower === 'typescript' || sLower === 'sql') {
      buckets["Languages"].add(skill);
    } else if (sLower.includes('blockchain') || sLower.includes('web3') || sLower.includes('solidity') || sLower.includes('spring') || sLower.includes('django') || sLower.includes('node') || sLower.includes('api') || sLower.includes('jwt')) {
      buckets["Backend"].add(skill);
    } else if (sLower.includes('structure') || sLower.includes('algorithm') || sLower.includes('oop') || sLower.includes('dbms') || sLower.includes('operating') || sLower.includes('network') || sLower.includes('system design') || sLower.includes('software engineering')) {
      buckets["Core CS"].add(skill);
    } else if (sLower.includes('sql') || sLower.includes('mongo') || sLower.includes('postgres') || sLower.includes('redis') || sLower.includes('database')) {
      buckets["Databases"].add(skill);
    } else if (sLower.includes('docker') || sLower.includes('linux') || sLower.includes('git') || sLower.includes('postman') || sLower.includes('aws') || sLower.includes('ci/cd') || sLower.includes('cloud')) {
      buckets["Systems & Tools"].add(skill);
    } else if (sLower.includes('react') || sLower.includes('html') || sLower.includes('css') || sLower.includes('tailwind') || sLower.includes('frontend')) {
      buckets["Frontend"].add(skill);
    } else if (sLower.includes('machine learning') || sLower.includes('ai') || sLower.includes('nlp') || sLower.includes('tensor') || sLower.includes('vision') || sLower.includes('llm') || sLower.includes('cv')) {
      buckets["AI / ML"].add(skill);
    } else {
      buckets["Systems & Tools"].add(skill);
    }
  });

  const result = {};
  Object.entries(buckets).forEach(([cat, set]) => {
    if (set.size > 0) {
      result[cat] = Array.from(set).join(', ');
    }
  });
  return result;
}

export const generateLatexCode = (data = {}, templateId = 'modern-tech') => {
  const isDataEmpty = !data || (
    !data.contactInfo?.name &&
    (!data.experience || data.experience.length === 0) &&
    (!data.projects || data.projects.length === 0)
  );

  const baseData = isDataEmpty ? TEJA_DEFAULT_RESUME_DATA : data;

  const contact = baseData.contactInfo || {};
  const name = escapeLatex(contact.name || '');
  const email = escapeLatex(contact.email || '');
  const phone = escapeLatex(contact.phone || '');
  const linkedin = escapeLatex(contact.linkedin || '');
  const github = escapeLatex(contact.github || '');
  const summary = escapeLatex(baseData.summary || '');
  const expList = baseData.experience || [];
  const eduList = baseData.education || [];
  const rawProjList = baseData.projects || [];
  const projList = rawProjList.map(cleanProject);
  const categories = buildCategorizedSkills(baseData.skills || [], baseData.skillCategories || {});
  const compProg = baseData.competitiveProgramming || [];
  const achievements = baseData.achievements || [];
  const leadership = baseData.leadership || [];
  const certs = baseData.certifications || [];

  if (templateId === 'rendercv-engineering') {
    return `\\documentclass[10pt, letterpaper]{article}

% Packages:
\\usepackage[
    ignoreheadfoot,
    top=1.8 cm,
    bottom=1.8 cm,
    left=1.8 cm,
    right=1.8 cm,
    footskip=1.0 cm,
]{geometry}
\\usepackage{titlesec}
\\usepackage{tabularx}
\\usepackage{array}
\\usepackage[dvipsnames]{xcolor}
\\definecolor{primaryColor}{RGB}{0, 0, 0}
\\usepackage{enumitem}
\\usepackage{amsmath}
\\usepackage[
    pdftitle={${name} - Resume},
    pdfauthor={${name}},
    pdfcreator={LaTeX with RenderCV},
    colorlinks=true,
    urlcolor=primaryColor
]{hyperref}
\\usepackage[pscoord]{eso-pic}
\\usepackage{calc}
\\usepackage{bookmark}
\\usepackage{lastpage}
\\usepackage{changepage}
\\usepackage{paracol}
\\usepackage{ifthen}
\\usepackage{needspace}
\\usepackage{iftex}

\\ifPDFTeX
    \\input{glyphtounicode}
    \\pdfgentounicode=1
    \\usepackage[T1]{fontenc}
    \\usepackage[utf8]{inputenc}
    \\usepackage{lmodern}
\\fi

\\usepackage{charter}

\\raggedright
\\AtBeginEnvironment{adjustwidth}{\\partopsep0pt}
\\pagestyle{empty}
\\setcounter{secnumdepth}{0}
\\setlength{\\parindent}{0pt}
\\setlength{\\topskip}{0pt}
\\setlength{\\columnsep}{0.15cm}
\\pagenumbering{gobble}

\\titleformat{\\section}{\\needspace{4\\baselineskip}\\bfseries\\large}{}{0pt}{}[\\vspace{1pt}\\titlerule]
\\titlespacing{\\section}{-1pt}{0.3 cm}{0.2 cm}

\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\small$\\bullet$}}$}
\\newenvironment{highlights}{
    \\begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=0 cm + 10pt
    ]
}{
    \\end{itemize}
}

\\newenvironment{onecolentry}{
    \\begin{adjustwidth}{0 cm + 0.00001 cm}{0 cm + 0.00001 cm}
}{
    \\end{adjustwidth}
}

\\newenvironment{twocolentry}[2][]{
    \\onecolentry
    \\def\\secondColumn{#2}
    \\setcolumnwidth{\\fill, 4.5 cm}
    \\begin{paracol}{2}
}{
    \\switchcolumn \\raggedleft \\secondColumn
    \\end{paracol}
    \\endonecolentry
}

\\newenvironment{header}{
    \\setlength{\\topsep}{0pt}\\par\\kern\\topsep\\centering\\linespread{1.4}
}{
    \\par\\kern\\topsep
}

\\let\\hrefWithoutArrow\\href

\\begin{document}
    \\newcommand{\\AND}{\\unskip
        \\cleaders\\copy\\ANDbox\\hskip\\wd\\ANDbox
        \\ignorespaces
    }
    \\newsavebox\\ANDbox
    \\sbox\\ANDbox{$|$}

    \\begin{header}
        \\fontsize{24 pt}{24 pt}\\selectfont \\textbf{${name}}

        \\vspace{5 pt}

        \\normalsize
        \\mbox{\\hrefWithoutArrow{mailto:${email}}{${email}}}%
        \\kern 5.0 pt%
        \\AND%
        \\kern 5.0 pt%
        \\mbox{${phone}}%
        \\kern 5.0 pt%
        \\AND%
        \\kern 5.0 pt%
        \\mbox{\\hrefWithoutArrow{${linkedin}}{LinkedIn}}%
        \\kern 5.0 pt%
        \\AND%
        \\kern 5.0 pt%
        \\mbox{\\hrefWithoutArrow{${github}}{GitHub}}%
    \\end{header}

    \\vspace{5 pt - 0.3 cm}

    \\section{Profile}
    \\begin{onecolentry}
        ${summary}
    \\end{onecolentry}

    \\section{Experience}
${expList.map(exp => `
    \\begin{twocolentry}{
        ${escapeLatex(exp.dates)}
    }
        \\textbf{${escapeLatex(exp.title)}}, ${escapeLatex(exp.company)}\\end{twocolentry}

    \\vspace{0.10 cm}
    \\begin{onecolentry}
        \\begin{highlights}
${(exp.bullets || []).map(b => `            \\item ${escapeLatex(b)}`).join('\n')}
        \\end{highlights}
    \\end{onecolentry}
`).join('\n')}

    \\section{Education}
${eduList.map(edu => `
    \\begin{twocolentry}{
        ${escapeLatex(edu.year)}
    }
        \\textbf{${escapeLatex(edu.institution)}}, ${escapeLatex(edu.degree)}\\end{twocolentry}

    \\vspace{0.10 cm}
    \\begin{onecolentry}
        \\begin{highlights}
            \\item CGPA: \\textbf{${escapeLatex(edu.gpa)}}
        \\end{highlights}
    \\end{onecolentry}
`).join('\n')}

    \\section{Technologies \\& Skills}
${Object.entries(categories).map(([cat, val]) => `
    \\begin{onecolentry}
        \\textbf{${escapeLatex(cat)}:} ${escapeLatex(val)}
    \\end{onecolentry}
`).join('\n')}

    \\section{Projects}
${projList.map(proj => `
    \\begin{twocolentry}{
        \\emph{${escapeLatex(proj.tech)}}
    }
        \\textbf{${escapeLatex(proj.name)}}\\end{twocolentry}

    \\vspace{0.10 cm}
    \\begin{onecolentry}
        \\begin{highlights}
${(proj.bullets || []).map(b => `            \\item ${escapeLatex(b)}`).join('\n')}
        \\end{highlights}
    \\end{onecolentry}
`).join('\n')}

    \\section{Competitive Programming}
    \\begin{onecolentry}
        \\begin{highlights}
${compProg.map(c => `            \\item ${escapeLatex(c)}`).join('\n')}
        \\end{highlights}
    \\end{onecolentry}

    \\section{Achievements}
    \\begin{onecolentry}
        \\begin{highlights}
${achievements.map(a => `            \\item ${escapeLatex(a)}`).join('\n')}
        \\end{highlights}
    \\end{onecolentry}

    \\section{Certifications}
    \\begin{onecolentry}
        \\begin{highlights}
${certs.map(c => `            \\item ${escapeLatex(c)}`).join('\n')}
        \\end{highlights}
    \\end{onecolentry}

\\end{document}`;
  }

  if (templateId === 'classic-executive') {
    return `\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{charter}
\\usepackage{hyperref}
\\usepackage{xcolor}

\\pagestyle{empty}
\\definecolor{darknavy}{RGB}{20, 35, 60}

\\begin{document}

\\begin{center}
    {\\huge \\scshape \\color{darknavy} ${name}} \\\\[4pt]
    \\small ${phone} \\ $|$ \\ \\href{mailto:${email}}{${email}} \\ $|$ \\ \\href{${linkedin}}{LinkedIn} \\ $|$ \\ \\href{${github}}{GitHub}
\\end{center}

\\vspace{4pt}
\\hrule
\\vspace{10pt}

\\section*{Profile}
${summary}

\\section*{Experience}
${expList.map(exp => `
\\noindent \\textbf{${escapeLatex(exp.title)}} \\hfill {\\small ${escapeLatex(exp.dates)}} \\\\
\\textit{${escapeLatex(exp.company)}}
\\begin{itemize}
${(exp.bullets || []).map(b => `  \\item ${escapeLatex(b)}`).join('\n')}
\\end{itemize}
\\vspace{4pt}
`).join('\n')}

\\section*{Education}
${eduList.map(edu => `
\\noindent \\textbf{${escapeLatex(edu.institution)}} \\hfill {\\small ${escapeLatex(edu.year)}} \\\\
\\textit{${escapeLatex(edu.degree)}} \\hfill \\textbf{CGPA}: ${escapeLatex(edu.gpa)}
`).join('\n')}

\\section*{Technical Skills}
\\begin{itemize}
${Object.entries(categories).map(([cat, val]) => `  \\item \\textbf{${escapeLatex(cat)}}: ${escapeLatex(val)}`).join('\n')}
\\end{itemize}

\\section*{Projects}
${projList.map(proj => `
\\noindent \\textbf{${escapeLatex(proj.name)}} \\hfill {\\small \\textit{${escapeLatex(proj.tech)}}}
\\begin{itemize}
${(proj.bullets || []).map(b => `  \\item ${escapeLatex(b)}`).join('\n')}
\\end{itemize}
\\vspace{4pt}
`).join('\n')}

\\section*{Competitive Programming}
\\begin{itemize}
${compProg.map(c => `  \\item ${escapeLatex(c)}`).join('\n')}
\\end{itemize}

\\section*{Achievements}
\\begin{itemize}
${achievements.map(a => `  \\item ${escapeLatex(a)}`).join('\n')}
\\end{itemize}

\\section*{Leadership \\& Clubs}
\\begin{itemize}
${leadership.map(l => `  \\item ${escapeLatex(l)}`).join('\n')}
\\end{itemize}

\\section*{Certifications}
\\begin{itemize}
${certs.map(c => `  \\item ${escapeLatex(c)}`).join('\n')}
\\end{itemize}

\\end{document}`;
  }

  if (templateId === 'compact-sidebar') {
    return `\\documentclass[10pt,a4paper]{article}
\\usepackage[margin=0.5in]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}
\\usepackage{color}

\\pagestyle{empty}

\\begin{document}

\\begin{center}
{\\Large \\textbf{${name}}} \\\\[2pt]
\\small ${email} $|$ ${phone} $|$ \\href{${linkedin}}{LinkedIn} $|$ \\href{${github}}{GitHub}
\\end{center}

\\hrule
\\vspace{6pt}

\\textbf{PROFILE} \\\\
${summary} \\\\[6pt]

\\textbf{TECHNICAL SKILLS}
\\begin{itemize}[leftmargin=1.5em, noitemsep]
${Object.entries(categories).map(([cat, val]) => `  \\item \\textbf{${escapeLatex(cat)}}: ${escapeLatex(val)}`).join('\n')}
\\end{itemize}

\\vspace{6pt}
\\textbf{EXPERIENCE}
\\begin{itemize}[leftmargin=1.5em, noitemsep]
${expList.map(exp => `
  \\item \\textbf{${escapeLatex(exp.title)}} (${escapeLatex(exp.dates)})
  ${(exp.bullets || []).map(b => `    \\\\ - ${escapeLatex(b)}`).join('\n')}
`).join('\n')}
\\end{itemize}

\\vspace{6pt}
\\textbf{PROJECTS}
\\begin{itemize}[leftmargin=1.5em, noitemsep]
${projList.map(proj => `
  \\item \\textbf{${escapeLatex(proj.name)}} [${escapeLatex(proj.tech)}]
  ${(proj.bullets || []).map(b => `    \\\\ - ${escapeLatex(b)}`).join('\n')}
`).join('\n')}
\\end{itemize}

\\vspace{6pt}
\\textbf{EDUCATION} \\\\
${eduList.map(edu => `${escapeLatex(edu.institution)} -- ${escapeLatex(edu.degree)} (${escapeLatex(edu.year)}) -- CGPA: ${escapeLatex(edu.gpa)}`).join(' \\\\ ')}

\\end{document}`;
  }

  if (templateId === 'minimal-academic') {
    return `\\documentclass[11pt,letterpaper]{article}
\\usepackage[margin=0.8in]{geometry}
\\usepackage{titlesec}
\\usepackage{hyperref}

\\pagestyle{empty}
\\titleformat{\\section}{\\large\\bfseries\\uppercase}{}{0em}{}[\\titlerule]

\\begin{document}

\\begin{center}
{\\LARGE \\textbf{${name}}} \\\\[4pt]
${email} \\quad $|$ \\quad ${phone} \\quad $|$ \\quad \\href{${linkedin}}{LinkedIn} \\quad $|$ \\quad \\href{${github}}{GitHub}
\\end{center}

\\section{Profile}
${summary}

\\section{Experience}
${expList.map(exp => `
\\textbf{${escapeLatex(exp.title)}} \\hfill ${escapeLatex(exp.dates)} \\\\
\\begin{itemize}
${(exp.bullets || []).map(b => `  \\item ${escapeLatex(b)}`).join('\n')}
\\end{itemize}
`).join('\n')}

\\section{Education}
${eduList.map(edu => `
\\textbf{${escapeLatex(edu.institution)}} \\hfill CGPA: ${escapeLatex(edu.gpa)} \\\\
${escapeLatex(edu.degree)} \\hfill ${escapeLatex(edu.year)}
`).join('\n\n')}

\\section{Technical Skills}
\\begin{itemize}
${Object.entries(categories).map(([cat, val]) => `  \\item \\textbf{${escapeLatex(cat)}}: ${escapeLatex(val)}`).join('\n')}
\\end{itemize}

\\section{Projects}
${projList.map(proj => `
\\textbf{${escapeLatex(proj.name)}} \\hfill \\textit{${escapeLatex(proj.tech)}}
\\begin{itemize}
${(proj.bullets || []).map(b => `  \\item ${escapeLatex(b)}`).join('\n')}
\\end{itemize}
`).join('\n')}

\\section{Competitive Programming}
\\begin{itemize}
${compProg.map(c => `  \\item ${escapeLatex(c)}`).join('\n')}
\\end{itemize}

\\section{Achievements \\& Certifications}
\\begin{itemize}
${achievements.map(a => `  \\item ${escapeLatex(a)}`).join('\n')}
${certs.map(c => `  \\item ${escapeLatex(c)}`).join('\n')}
\\end{itemize}

\\end{document}`;
  }

  // Default: Modern Tech (Jake's Resume - Official Template Exact Replica)
  return `%-------------------------
% Resume in LaTeX (Jake's Resume Template)
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\vspace{-5pt}\\line(1,0){500}]

\\begin{document}

\\begin{center}
    \\textbf{\\Huge \\scshape ${name}} \\\\[2pt]
    \\small \\href{mailto:${email}}{\\underline{${email}}} $|$ 
    ${phone} $|$ 
    \\href{${linkedin}}{\\underline{LinkedIn}} $|$ 
    \\href{${github}}{\\underline{GitHub}}
\\end{center}

%----------- PROFILE -----------
\\section{Profile}
\\small{${summary}}

%----------- EXPERIENCE -----------
\\section{Experience}
  \\begin{itemize}[leftmargin=0.15in, label={}]
${expList.map(exp => `
    \\item
      \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
        \\textbf{${escapeLatex(exp.title)}} & ${escapeLatex(exp.dates)} \\\\
      \\end{tabular*}\\vspace{-5pt}
      \\begin{itemize}
${(exp.bullets || []).map(b => `        \\item \\small{${escapeLatex(b)}}`).join('\n')}
      \\end{itemize}
`).join('\n')}
  \\end{itemize}

%----------- EDUCATION -----------
\\section{Education}
  \\begin{itemize}[leftmargin=0.15in, label={}]
${eduList.map(edu => `
    \\item
      \\begin{tabular*}{\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
        \\textbf{${escapeLatex(edu.institution)}} & \\textbf{CGPA: ${escapeLatex(edu.gpa)}} \\\\
        \\textit{\\small ${escapeLatex(edu.degree)}} & \\textit{\\small ${escapeLatex(edu.year)}} \\\\
      \\end{tabular*}\\vspace{-5pt}
`).join('\n')}
  \\end{itemize}

%----------- PROGRAMMING SKILLS -----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${Object.entries(categories).map(([cat, val]) => `     \\textbf{${escapeLatex(cat)}}{: ${escapeLatex(val)}}`).join(' \\\\\n')}
    }}
 \\end{itemize}

%----------- PROJECTS -----------
\\section{Projects}
    \\begin{itemize}[leftmargin=0.15in, label={}]
${projList.map(proj => `
      \\item
        \\textbf{${escapeLatex(proj.name)}} $|$ \\emph{${escapeLatex(proj.tech)}}
        \\begin{itemize}
${(proj.bullets || []).map(b => `          \\item \\small{${escapeLatex(b)}}`).join('\n')}
        \\end{itemize}
`).join('\n')}
    \\end{itemize}

%----------- COMPETITIVE PROGRAMMING -----------
\\section{Competitive Programming}
 \\begin{itemize}[leftmargin=0.15in]
${compProg.map(c => `   \\item \\small{${escapeLatex(c)}}`).join('\n')}
 \\end{itemize}

%----------- ACHIEVEMENTS -----------
\\section{Achievements}
 \\begin{itemize}[leftmargin=0.15in]
${achievements.map(a => `   \\item \\small{${escapeLatex(a)}}`).join('\n')}
 \\end{itemize}

%----------- LEADERSHIP & CLUBS -----------
\\section{Leadership \\& Clubs}
 \\begin{itemize}[leftmargin=0.15in]
${leadership.map(l => `   \\item \\small{${escapeLatex(l)}}`).join('\n')}
 \\end{itemize}

%----------- CERTIFICATIONS -----------
\\section{Certifications}
 \\begin{itemize}[leftmargin=0.15in]
${certs.map(c => `   \\item \\small{${escapeLatex(c)}}`).join('\n')}
 \\end{itemize}

\\end{document}`;
};

export const unescapeLatexText = (str) => {
  if (!str) return '';
  return str
    .replace(/\\txt\{([^}]+)\}/g, '$1')
    .replace(/\\textbackslash\{\}/g, '\\')
    .replace(/\\%/g, '%')
    .replace(/\\\$ /g, '$')
    .replace(/\\\$/g, '$')
    .replace(/\\&/g, '&')
    .replace(/\\#/g, '#')
    .replace(/\\_/g, '_')
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}')
    .replace(/\\textasciitilde\{\}/g, '~')
    .replace(/\\textasciicircum\{\}/g, '^')
    .replace(/\\underline\{([^}]+)\}/g, '$1')
    .replace(/\\textbf\{([^}]+)\}/g, '$1')
    .replace(/\\textit\{([^}]+)\}/g, '$1')
    .replace(/\\emph\{([^}]+)\}/g, '$1')
    .replace(/\\small\{([^}]+)\}/g, '$1')
    .replace(/\\large\{([^}]+)\}/g, '$1')
    .replace(/\\Huge\{([^}]+)\}/g, '$1')
    .replace(/\\HUGE\{([^}]+)\}/g, '$1')
    .replace(/\\mbox\{([^}]+)\}/g, '$1')
    .replace(/\\href\{[^}]*\}\{([^}]+)\}/g, '$1')
    .replace(/\\hrefWithoutArrow\{[^}]*\}\{([^}]+)\}/g, '$1')
    .replace(/\\vspace\{[^}]*\}/g, '')
    .replace(/\\hspace\{[^}]*\}/g, '')
    .replace(/\\\\/g, '\n')
    .trim();
};

export const parseLatexToResumeData = (latexStr, defaultData = TEJA_DEFAULT_RESUME_DATA) => {
  if (!latexStr || typeof latexStr !== 'string' || latexStr.trim().length < 15) {
    return defaultData;
  }

  try {
    const raw = latexStr;
    const cleanStr = raw.replace(/\r\n/g, '\n');

    let name = defaultData?.contactInfo?.name || '';
    let email = defaultData?.contactInfo?.email || '';
    let phone = defaultData?.contactInfo?.phone || '';
    let linkedin = defaultData?.contactInfo?.linkedin || '';
    let github = defaultData?.contactInfo?.github || '';
    let portfolio = defaultData?.contactInfo?.portfolio || '';

    // Find Header Block (before first \section)
    const firstSecIdx = cleanStr.search(/\\section\*?\{/i);
    const headerBlock = firstSecIdx !== -1 ? cleanStr.substring(0, firstSecIdx) : cleanStr;

    // Extract Name
    const nameMatch = headerBlock.match(/\\textbf\{\\Huge\s*\\scshape\s*([^}]+)\}/i) ||
                      headerBlock.match(/\\fontsize\{24\s*pt\}\{24\s*pt\}\\selectfont\s*\\textbf\{([^}]+)\}/i) ||
                      headerBlock.match(/\\huge\s*\\scshape\s*(?:\\color\{[^}]*\}\s*)?([^}\\\n]+)/i) ||
                      headerBlock.match(/\\Large\s*\\textbf\{([^}]+)\}/i) ||
                      headerBlock.match(/\\textbf\{([^}]+)\}/i);
    if (nameMatch && nameMatch[1]) {
      const extractedName = unescapeLatexText(nameMatch[1]);
      if (extractedName && extractedName.length >= 2) {
        name = extractedName;
      }
    }

    // Extract Email
    const emailMatch = headerBlock.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i) ||
                       cleanStr.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch && emailMatch[1]) email = emailMatch[1].trim();

    // Extract Phone
    const phoneMatch = headerBlock.match(/(\+?\d{1,3}[\s-]?\d{8,14})/);
    if (phoneMatch && phoneMatch[1]) phone = phoneMatch[1].trim();

    // Extract LinkedIn
    const liMatch = cleanStr.match(/(https?:\/\/(?:www\.)?linkedin\.com\/in\/[^\s{}|\\]+)/i) ||
                    cleanStr.match(/(linkedin\.com\/in\/[^\s{}|\\]+)/i);
    if (liMatch && liMatch[1]) {
      linkedin = liMatch[1].startsWith('http') ? liMatch[1] : 'https://' + liMatch[1];
    }

    const ghMatch = cleanStr.match(/(https?:\/\/(?:www\.)?github\.com\/[^\s{}|\\]+)/i) ||
                    cleanStr.match(/(github\.com\/[^\s{}|\\]+)/i);
    if (ghMatch && ghMatch[1]) {
      github = ghMatch[1].startsWith('http') ? ghMatch[1] : 'https://' + ghMatch[1];
    }

    // 2. Dynamic Section Parsing (Extract ALL \section{...} blocks)
    const sectionRegex = /\\section\*?\{([^}]+)\}([\s\S]*?)(?=\\section\*?\{|\\end\{document\}|$)/gi;
    const parsedSections = [];
    let secMatch;

    while ((secMatch = sectionRegex.exec(cleanStr)) !== null) {
      const sTitle = unescapeLatexText(secMatch[1]);
      const sBody = secMatch[2];

      if (!sTitle) continue;

      // Extract Bullet Items
      const itemMatches = [...sBody.matchAll(/\\item\s*(?:\\small\{|\\item\s*)?([^\n\\{}]+(?:\{[^}]*\}[^\n\\{}]*)*)/gi)];
      const items = itemMatches
        .map(m => unescapeLatexText(m[1]))
        .filter(t => t && t.length > 1);

      // Extract Paragraph / Plain Text
      let text = sBody
        .replace(/\\begin\{onecolentry\}/g, '')
        .replace(/\\end\{onecolentry\}/g, '')
        .replace(/\\begin\{twocolentry\}[\s\S]*?\\end\{twocolentry\}/g, '')
        .replace(/\\begin\{highlights\}[\s\S]*?\\end\{highlights\}/g, '')
        .replace(/\\begin\{itemize\}[\s\S]*?\\end\{itemize\}/g, '')
        .replace(/\\small\{/g, '')
        .replace(/\\large\{/g, '')
        .replace(/\}$/gm, '')
        .trim();
      text = unescapeLatexText(text);

      parsedSections.push({
        title: sTitle,
        text,
        items,
      });
    }

    // Populate standard properties for backward compatibility
    const summarySec = parsedSections.find(s => /profile|summary/i.test(s.title));
    const summary = summarySec ? (summarySec.text || (summarySec.items || []).join(' ')) : (defaultData.summary || '');

    const skillsSec = parsedSections.find(s => /skill|technology|programming/i.test(s.title));
    const skillsList = skillsSec
      ? (skillsSec.items.length > 0 ? skillsSec.items : skillsSec.text.split(',').map(s => s.trim()).filter(Boolean))
      : (defaultData.skills || []);

    return {
      ...defaultData,
      contactInfo: {
        name,
        email,
        phone,
        linkedin,
        github,
        portfolio,
      },
      summary,
      skills: skillsList,
      sections: parsedSections,
    };
  } catch (err) {
    console.warn('LaTeX parsing fallback:', err);
    return defaultData;
  }
};

