# PDF-to-XML Converter Web Application

## Overview
This project is a **PDF-to-XML Converter Web Application** built using **Next.js, TypeScript, Prisma, PostgreSQL, and Supabase**. The application supports **user authentication, file uploads, PDF parsing, XML conversion, and result storage**. It meets all core requirements and includes Level 1 and Level 2 features as outlined in the assignment.

### **1. Code Quality & Best Practices**
- The project follows modern development practices using **TypeScript and Next.js app directory structure**.
- Utilizes **Prisma ORM** for database interactions with **PostgreSQL (via Supabase)**.
- Uses **JWT authentication with bcrypt** for user security.
- Implements **structured, modular, and reusable components** for maintainability.

### **2. Functionality & Core Features**
- **User Authentication** (JWT-based signup/login with bcrypt encryption)
- **File Upload System** (Handling PDF uploads securely)
- **PDF Parsing & XML Conversion** (Using pdf-lib to extract and transform data)
- **Data Storage & Management** (Converted XML is stored in PostgreSQL via Prisma & Supabase)
- **Result Management** (Users can view past conversions and download XML files)

### **3. Performance & Optimization**
- Uses **Next.js API routes** for efficient server-side processing.

### **4. User Interface & Experience**
- Built with **ShadCN components** for a modern UI/UX.
- Implemented **responsive design** for optimal usability across devices.
- Features a **dashboard with interactive charts (ShadCN Charts) for analytics**.

### **5. Deployment & DevOps**
- Deployed on **Vercel and Render** for frontend and backend management.
- Also Deployed on **AWS EC2 with PM2** for process management.
- Uses **Supabase for database hosting**.
- Configured **environment variables for secure deployment**.

## Screenshots & Code Snippets

### Application Screenshots

- Login Page
![alt text](frontend/public/cr_login.png)
- File Upload Section
![alt text](frontend/public/cr_fileUpload.png)
- Converted XML Display
![alt text](frontend/public/cr_xmlPreview.png)
- User Profile
![alt text](frontend/public/cr_userProfile.png)

### Code Snippets

Insert code snippets for important parts of the application:
- Authentication Logic
- File Upload & Parsing
- XML Conversion Function
- API Route Implementation

## Local Setup Guide

### Prerequisites
Ensure you have the following installed:
- **Node.js (>=16.x.x)**
- **PostgreSQL** (or use Supabase)
- **Git**
- **Docker** (optional for running PostgreSQL locally)

### Steps to Run Locally

1. **Clone the Repository**
   ```sh
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Install Dependencies**
   ```sh
   npm install
   ```

3. **Set Up Environment Variables**
   Create a `.env` file in the root directory and add:
   ```sh
   DATABASE_URL=<your_supabase_postgres_url>
   JWT_SECRET=<your_secret_key>
   NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
   ```

4. **Run Database Migrations**
   ```sh
   npx prisma migrate dev --name init
   ```

5. **Start the Development Server**
   ```sh
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## Deployment

For production deployment on **AWS EC2**, follow these steps:

1. **SSH into your EC2 instance**
   ```sh
   ssh -i <your-key.pem> ubuntu@your-ec2-ip
   ```
2. **Pull the latest code & install dependencies**
   ```sh
   git pull origin main
   npm install
   ```
3. **Run the application with PM2**
   ```sh
   pm2 start npm --name "pdf-xml-app" -- run start
   ```

## Conclusion
This project meets the Level 1 & Level 2 requirements, implementing all core functionalities efficiently. Additional improvements and Level 3 features can be added for further enhancements.

---

**Author:** [Your Name]  
**Date:** April 2025
