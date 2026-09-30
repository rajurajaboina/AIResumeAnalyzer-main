# AI Resume Analyzer & ATS Optimizer

A full-stack AI-powered resume optimization platform that helps users improve their resumes for specific job roles using artificial intelligence. Upload your resume, paste a job description, get an ATS score, receive AI-based improvement suggestions, edit your resume directly in the platform, and download the optimized resume as PDF or DOCX.

## Features

### Core Features
- **User Authentication**: Secure login and registration with JWT authentication
- **Resume Upload**: Support for PDF and DOCX file formats with automatic text extraction
- **ATS Score Analysis**: Comprehensive ATS scoring (0-100) with detailed feedback
- **Keyword Matching**: Identify matched and missing keywords from job descriptions
- **Skills Gap Analysis**: Compare resume skills with job requirements
- **AI-Powered Suggestions**: Get intelligent recommendations to improve your resume
- **Resume Editor**: Edit your resume directly in the platform with live preview
- **Bullet Point Rewriter**: AI-powered bullet point improvement with multiple rewrite options
- **Download Options**: Download optimized resume in PDF or DOCX format
- **Cover Letter Generator**: Generate professional cover letters using AI
- **Analysis History**: View and manage previous resume analysis reports
- **Dashboard**: Track your resume optimization progress

### Advanced Features
- Re-analyze updated resumes to see improvement
- Section-wise AI suggestions (summary, skills, projects, experience)
- ATS-friendly resume templates
- Real-time resume preview
- Multiple rewrite options for bullet points
- Professional, fresher-friendly suggestions

## Tech Stack

### Frontend
- **React.js** (v18.2.0) - UI framework
- **Tailwind CSS** (v3.3.6) - Styling
- **React Router** (v6.20.0) - Routing
- **Axios** (v1.6.2) - HTTP client
- **Framer Motion** (v10.16.16) - Animations
- **React Hook Form** (v7.48.2) - Form management
- **Lucide React** (v0.294.0) - Icons
- **React Circular Progressbar** (v2.1.0) - Progress visualization

### Backend
- **Spring Boot** (v3.2.0) - Java framework
- **Spring Security** - Authentication and authorization
- **JWT** (io.jsonwebtoken v0.12.3) - Token-based authentication
- **Spring Data MongoDB** - Database integration
- **Apache PDFBox** (v2.0.29) - PDF processing
- **Apache POI** (v5.2.4) - DOCX processing
- **iText PDF** (v5.5.13.3) - PDF generation
- **OpenAI API** (v0.18.2) - AI integration
- **Lombok** - Code generation

### Database
- **MongoDB** - NoSQL database for storing user data, resumes, and analyses

## Project Structure

```
ai-resume-analyzer/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/resumeanalyzer/
│   │       │   ├── AiResumeAnalyzerApplication.java
│   │       │   ├── config/
│   │       │   │   ├── CorsConfig.java
│   │       │   │   └── SecurityConfig.java
│   │       │   ├── controller/
│   │       │   │   ├── AuthController.java
│   │       │   │   ├── AnalysisController.java
│   │       │   │   ├── AiController.java
│   │       │   │   ├── DownloadController.java
│   │       │   │   └── ResumeController.java
│   │       │   ├── dto/
│   │       │   │   ├── AnalysisRequest.java
│   │       │   │   ├── AnalysisResponse.java
│   │       │   │   ├── AuthRequest.java
│   │       │   │   ├── AuthResponse.java
│   │       │   │   ├── BulletRewriteRequest.java
│   │       │   │   ├── BulletRewriteResponse.java
│   │       │   │   └── LoginRequest.java
│   │       │   ├── model/
│   │       │   │   ├── CoverLetter.java
│   │       │   │   ├── Resume.java
│   │       │   │   ├── ResumeAnalysis.java
│   │       │   │   ├── ResumeTemplate.java
│   │       │   │   └── User.java
│   │       │   ├── repository/
│   │       │   │   ├── CoverLetterRepository.java
│   │       │   │   ├── ResumeAnalysisRepository.java
│   │       │   │   ├── ResumeRepository.java
│   │       │   │   └── UserRepository.java
│   │       │   ├── security/
│   │       │   │   ├── CustomUserDetailsService.java
│   │       │   │   ├── JwtAuthenticationFilter.java
│   │       │   │   ├── JwtUtil.java
│   │       │   │   └── SecurityConfig.java
│   │       │   ├── service/
│   │       │   │   ├── AiService.java
│   │       │   │   ├── AnalysisService.java
│   │       │   │   ├── AuthService.java
│   │       │   │   ├── ResumeDownloadService.java
│   │       │   │   └── ResumeService.java
│   │       │   └── utils/
│   │       │       ├── DocxTextExtractor.java
│   │       │       ├── FileUploadUtil.java
│   │       │       ├── PdfTextExtractor.java
│   │       │       └── ResumeTextExtractor.java
│   │       └── resources/
│   │           └── application.properties
│   └── pom.xml
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── ProtectedRoute.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── AnalysisResult.js
│   │   │   ├── CoverLetterGenerator.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Home.js
│   │   │   ├── JobDescription.js
│   │   │   ├── Login.js
│   │   │   ├── PreviousReports.js
│   │   │   ├── Register.js
│   │   │   ├── ResumeEditor.js
│   │   │   └── UploadResume.js
│   │   ├── App.js
│   │   ├── index.css
│   │   └── index.js
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- MongoDB 6.0 or higher
- Maven 3.6 or higher
- OpenAI API Key (for AI features)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-resume-analyzer
```

### 2. Backend Setup

#### Configure MongoDB
- Install MongoDB locally or use MongoDB Atlas
- Update the MongoDB connection string in `backend/src/main/resources/application.properties`

#### Configure Environment Variables
Create or edit `backend/src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080
spring.application.name=ai-resume-analyzer

# MongoDB Configuration
spring.data.mongodb.uri=mongodb://localhost:27017/resume_analyzer
spring.data.mongodb.auto-index-creation=true

# JWT Configuration
jwt.secret=your-secret-key-change-this-in-production-at-least-256-bits
jwt.expiration=86400000

# AI API Configuration
openai.api.key=your-openai-api-key-here
gemini.api.key=your-gemini-api-key-here

# CORS Configuration
cors.allowed.origins=http://localhost:3000,http://localhost:5173

# File Upload Configuration
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
file.upload.dir=./uploads
```

#### Build and Run Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Start Development Server

```bash
npm start
```

The frontend will start on `http://localhost:3000`

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Resume Endpoints

#### Upload Resume
```http
POST /api/resume/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

file: <resume-file>
```

#### Get Resume
```http
GET /api/resume/{id}
Authorization: Bearer <token>
```

#### Update Resume
```http
PUT /api/resume/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "optimizedResumeText": "...",
  "resumeData": {...}
}
```

### Analysis Endpoints

#### Analyze Resume
```http
POST /api/analysis/analyze
Content-Type: application/json
Authorization: Bearer <token>

{
  "resumeId": "resume-id",
  "jobDescription": "Job description text..."
}
```

#### Re-analyze Resume
```http
POST /api/analysis/reanalyze/{id}
Authorization: Bearer <token>
```

#### Get Analysis
```http
GET /api/analysis/{id}
Authorization: Bearer <token>
```

### AI Endpoints

#### Extract Keywords
```http
POST /api/ai/extract-keywords
Content-Type: text/plain

Job description text...
```

#### Improve Bullet Point
```http
POST /api/ai/improve-bullet
Content-Type: application/json

{
  "originalBullet": "Made a project using React",
  "rewriteType": "professional"
}
```

### Download Endpoints

#### Download PDF
```http
GET /api/download/resume/pdf/{id}
Authorization: Bearer <token>
```

#### Download DOCX
```http
GET /api/download/resume/docx/{id}
Authorization: Bearer <token>
```

## Docker Deployment

### Using Docker Compose

```bash
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Backend on port 8080
- Frontend on port 3000

### Manual Docker Build

#### Backend Dockerfile
```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Deployment

### Backend Deployment (Render/Railway/AWS)

1. Build the backend:
```bash
cd backend
mvn clean package
```

2. Deploy the JAR file to your preferred platform
3. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
   - `FRONTEND_URL`

### Frontend Deployment (Vercel)

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy to Vercel:
```bash
vercel deploy
```

3. Set environment variable:
   - `REACT_APP_API_URL`

### Database Deployment (MongoDB Atlas)

1. Create a MongoDB Atlas account
2. Create a cluster
3. Get the connection string
4. Update the backend configuration

## Usage

### 1. Register/Login
- Create an account or login with existing credentials

### 2. Upload Resume
- Upload your resume in PDF or DOCX format
- The system will extract text automatically

### 3. Enter Job Description
- Paste the job description you want to apply for
- Include all requirements and responsibilities

### 4. View Analysis Results
- See your ATS score (0-100)
- View matched and missing keywords
- Check skills gap analysis
- Read AI-powered suggestions

### 5. Edit Resume
- Use the resume editor to make improvements
- Apply AI suggestions
- Rewrite bullet points with AI assistance
- Preview changes in real-time

### 6. Download Optimized Resume
- Download your improved resume in PDF or DOCX format
- The resume is ATS-friendly and professionally formatted

### 7. Generate Cover Letter
- Use the cover letter generator to create a professional cover letter
- Based on your resume and job description

## Security Features

- JWT-based authentication
- Password hashing with BCrypt
- CORS configuration
- File type validation
- File size limits
- Protected API endpoints
- Secure token storage

## Future Enhancements

- [ ] Resume version comparison
- [ ] One-click AI optimization
- [ ] LinkedIn profile analyzer
- [ ] Grammar checker integration
- [ ] Action verb checker
- [ ] Admin dashboard
- [ ] Role-based resume templates
- [ ] Resume score history graph
- [ ] Export analysis report as PDF
- [ ] Email notifications
- [ ] Resume sharing feature
- [ ] Multiple language support

## Troubleshooting

### Backend Issues

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check connection string in application.properties
- Verify MongoDB credentials

**AI API Error**
- Check your OpenAI API key
- Ensure you have sufficient API credits
- Verify API endpoint configuration

### Frontend Issues

**CORS Error**
- Check CORS configuration in backend
- Verify frontend URL in allowed origins
- Ensure backend is running

**Build Errors**
- Delete node_modules and package-lock.json
- Run `npm install` again
- Check Node.js version (should be 18+)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub or contact the development team.

## Acknowledgments

- OpenAI for GPT API
- Spring Boot team
- React team
- MongoDB team
- All open-source contributors
