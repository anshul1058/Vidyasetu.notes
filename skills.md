# Study Material Sharing Platform - Project Requirements Document (PRD)

## 1. Executive Summary & Platform Vision
The **Study Material Sharing Platform** is a centralized, collaborative hub designed to empower students by enabling them to easily share, discover, and collaborate on educational resources. The platform aims to reduce the friction in finding high-quality study materials—such as lecture notes, previous year question papers (PYQs), assignments, and reference books—while fostering a community-driven learning environment.

## 2. Target Audience & Roles
The platform caters to three primary user personas:
- **Student (Consumer)**: Can search, browse, preview, and download materials, join study groups, and leave ratings/comments.
- **Contributor (Uploader)**: Has all Student privileges, plus the ability to upload materials, manage their uploads, and compete on the Leaderboard.
- **Admin (Moderator)**: Manages platform integrity, approves/rejects flagged materials, oversees user accounts, and reviews usage analytics.

## 3. Detailed Feature Specifications

### 3.1 User Profiles & Gamification
- **Authentication**: Secure Sign-Up/Login with JWT or OAuth (Google/GitHub).
- **Profile Dashboard**: Personal hub to track uploaded materials, download history, and saved items.
- **Leaderboard System**: A gamified ranking system that showcases top contributors who have shared the most highly-rated notes, encouraging sustained platform engagement.

### 3.2 Material Management
- **Secure Uploads**: Support for PDFs, PPTs, DOCX, and image formats with file size limits and virus scanning (optional/future scope).
- **Deep Metadata Categorization**: Materials must be strictly tagged by:
  - *Branch* (e.g., Computer Science, Mechanical)
  - *Semester* (e.g., Semester 1 - 8)
  - *Subject* (e.g., Data Structures, Engineering Mathematics)
  - *Category* (e.g., Notes, PyQs, Assignments)
- **In-Browser File Preview**: Integrated document viewer allowing users to read PDFs or view images directly in the browser *before* deciding to download.
- **Download Management**: Track download counts for popularity metrics.

### 3.3 Discovery Engine
- **Global Search**: Powerful, fuzzy-search capabilities across all material titles, descriptions, and tags.
- **Advanced Filtering**: Narrow down search results dynamically by Branch, Semester, Subject, Date Uploaded, and Popularity (Rating/Downloads).
- **Recommended Notes Engine**: A smart recommendation feed on the dashboard and material pages that suggests related content based on the user's previous downloads and current branch/semester.

### 3.4 Community & Collaboration
- **Study Groups**: Dedicated spaces where students can join groups specific to their *Subject*, *Exam Prep*, or *Branch* to chat, share specific resources, and study collaboratively.
- **Rating & Review System**: 5-star rating and text reviews for downloaded materials to ensure high-quality content floats to the top.
- **Upvote/Downvote System**: Reddit-style voting on comments and specific forum posts within study groups.

### 3.5 AI Integrations
- **AI Summaries of Notes**: Automatic extraction and summarization of text from uploaded notes, providing a quick, readable overview of the document's contents on its detail page.
- **AI YouTube Video Recommendations**: Context-aware suggestions of relevant YouTube educational videos based on the specific *Subject* and *Topic* of the notes currently being viewed.

### 3.6 UX Enhancements
- **Dark Mode Toggle**: First-class support for switching between light and dark UI themes, crucial for late-night student study sessions.
- **Responsive Design**: Pixel-perfect usability across mobile, tablet, and desktop screens.

## 4. Technical Architecture & Stack
*Note: This stack is a recommendation and can be adjusted as development progresses.*
- **Frontend Framework**: Next.js (App Router) or React (Vite) for fast, dynamic, and SEO-friendly rendering.
- **Styling**: Tailwind CSS with custom curated color palettes. Focus on modern UI aesthetics (glassmorphism nuances, smooth micro-animations).
- **Backend/API**: Next.js Server Actions / API Routes OR a dedicated Node.js/Express REST/GraphQL API.
- **Database**: PostgreSQL (Structured relations for Users, Materials, Groups) or MongoDB (Flexible document storage for varied metadata).
- **File Storage**: AWS S3, Supabase Storage, or Appwrite Storage for secure file handling.
- **AI Services**: OpenAI API / Gemini API for generating summaries and keyword extraction for YouTube queries.

## 5. High-Level Database Entities (Proposed)
1. `Users` (id, name, email, role, avatar, reputation_score)
2. `Materials` (id, title, description, file_url, uploader_id, branch, semester, subject, category, downloads, avg_rating)
3. `Reviews` (id, material_id, user_id, rating, comment, created_at)
4. `StudyGroups` (id, name, branch, subject, created_by)
5. `GroupMessages` (id, group_id, sender_id, message, created_at)

## 6. Agent Instructions (CRITICAL)
When working on this platform, the AI Assistant must **ALWAYS**:
1. **Assume this Context**: Strictly adhere to the vision and feature set outlined in this PRD. Do not ask the user to re-explain the project concept.
2. **Prioritize Aesthetics & UX**: Deliver "Wow" factor designs. Never default to basic, plain MVP UIs. Utilize curated color palettes, modern typography, excellent contrast (especially in Dark Mode), and clean layouts.
3. **Write Scalable Code**: Break down frontend features into highly modular, reusable, and typed components.
4. **Implement Best Practices**: Ensure proper SEO tags, accessibility (ARIA roles), and robust client/server-side error handling in all code.
5. **Use Placeholders Wisely**: If a specific asset (logo, sample document, avatar) is not provided, dynamically generate a mockup or use a highly polished placeholder.

---
*End of Document. This file serves as the permanent context map and PRD for the project.*
