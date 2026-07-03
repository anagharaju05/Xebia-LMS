# Xebia LMS Portal - Full-Stack Integrated Platform

An enterprise-grade, full-stack Learning Management System (LMS) portal designed for Xebia. This repository integrates a Vite + React Frontend with a Java 17 Spring Boot REST Backend, featuring PostgreSQL database connectivity, Flyway migrations, Spring Security, MapStruct for DTO mappings, and interactive data visualization using Recharts.

## 1. Tech Stack

### Frontend Client
- **Framework**: Vite
- **Runtime**: React (v18.3.1)
- **Routing**: React Router DOM (v7)
- **Styling**: Vanilla CSS (no Tailwind)
- **Visualizations**: Recharts
- **Icons**: Lucide React

### Backend Services
- **Framework**: Spring Boot (v3.2.5) & Spring Web MVC
- **Language**: Java 17
- **Database**: PostgreSQL (with Flyway for migrations)
- **Security**: Spring Security
- **Data Mapping**: MapStruct & Lombok
- **API Documentation**: Springdoc OpenAPI (Swagger)
- **Build Tool**: Maven

## 2. Folder Structure

```text
xebia-lms-portal/
├── backend/                  # Spring Boot Maven Project
│   ├── src/main/java/com/xebia/lms/
│   │   ├── analytics/        # Analytics & Reporting endpoints
│   │   ├── category/         # Course category management
│   │   ├── config/           # Application & Security configurations
│   │   ├── content/          # Course content management
│   │   ├── course/           # Core course models & endpoints
│   │   ├── exception/        # Global exception handling
│   │   ├── module/           # Course module organization
│   │   ├── security/         # Authentication & Authorization services
│   │   ├── student/          # Student management and portal controllers
│   │   ├── submodule/        # Granular submodule organization
│   │   └── util/             # Helper utilities
│   ├── src/main/resources/
│   │   ├── db/               # Flyway SQL migrations
│   │   └── application.yml   # Spring configuration settings
│   └── pom.xml               # Maven Dependency Configuration
├── frontend/                 # Vite + React Source
│   ├── public/               # Static assets
│   ├── src/                  
│   │   ├── app/              # Global App setup & routes mapping
│   │   ├── components/       # Reusable UI widgets (cards, common, layout, preview)
│   │   ├── features/         # Feature-specific implementations (e.g., student portal)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API fetching logic
│   │   ├── styles/           # CSS stylesheets
│   │   ├── utils/            # Frontend utility functions
│   │   ├── index.css         # Global styles
│   │   └── main.jsx          # Application entry point
│   ├── package.json          # Node package configurations
│   └── vite.config.js        # Vite configuration & server setup
└── Workflow.png              # Architectural workflow diagram
```

## 3. Environment Variables

### Backend Configuration
Database configuration is defined in `backend/src/main/resources/application.yml` and expects the following environment variables (with fallback defaults):

```env
DB_HOST=localhost       # Default: localhost
DB_PORT=5432            # Default: 5432
DB_NAME=lms_course      # Default: lms_course
DB_USERNAME=postgres    # Default: postgres
DB_PASSWORD=            # Your local postgres password
```

## 4. Local Installation & Startup

### Prerequisites
Before you begin, ensure you have the following installed on your machine:
- **Git**: To clone the repository.
- **Java 17 (JDK)**: Required for the Spring Boot backend.
- **Maven**: To build and manage Java dependencies.
- **Node.js (v18+)**: Required for the React frontend.
- **PostgreSQL (v14+)**: Required for the local database.

### Step 1: Clone the Repository
Open your terminal or command prompt and run the following command to clone the project to your local machine:
```bash
git clone https://github.com/anagharaju05/Xebia-LMS.git
cd Xebia-LMS
```

### Step 2: Setup the Database (PostgreSQL)
1. Ensure your PostgreSQL server is running.
2. Open a database tool (like pgAdmin, DBeaver, or the `psql` command line).
3. Create a new, empty database named **`lms_course`**.
   *(Note: The Flyway migrations in our project will automatically create all the necessary tables for you when the backend starts up!)*

### Step 3: Start the Backend (Spring Boot)
Open a terminal and navigate into the `backend` folder:
```bash
cd backend
```
The application requires your PostgreSQL password. Set the `DB_PASSWORD` environment variable in your terminal:
- **On Windows (PowerShell)**: `$env:DB_PASSWORD="your_postgres_password"`
- **On Mac/Linux**: `export DB_PASSWORD="your_postgres_password"`

Next, download the Java dependencies and run the server:
```bash
mvn clean install
mvn spring-boot:run
```
The backend server will spin up on `http://localhost:8080`. 
*You can view and test all the API endpoints via Swagger UI at `http://localhost:8080/swagger-ui.html`.*

### Step 4: Start the Frontend (Vite + React)
Open a **new, separate terminal window**, ensure you are in the root `Xebia-LMS` folder, and navigate to the `frontend` folder:
```bash
cd frontend
```
Install all the necessary Node modules:
```bash
npm install
```
Launch the development server:
```bash
npm run dev
```
The frontend application is now active! Open your browser and navigate to `http://127.0.0.1:5173`.

## 5. REST API Endpoints Mapping

The backend exposes the following primary context paths, which can be explored in detail via Swagger UI:

| Endpoint Context | Purpose / Description |
|---|---|
| `/api/analytics` | Analytical data for reporting and dashboards. |
| `/api/categories` | Management of course categories. |
| `/api/content` | Handling of granular course content materials. |
| `/api/courses` | Creation, retrieval, and management of core courses. |
| `/api/modules` | Course module structuring and mapping. |
| `/api/auth` | Authentication, login, and token generation. |
| `/api/management/students` | Administrator endpoints for student management. |
| `/api/portal/students/{studentId}` | Learner-facing endpoints for student profiles and progress. |
| `/api/submodules` | Granular submodule tracking and configuration. |
