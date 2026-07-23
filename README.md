# AgileBoard - A Premium AI-Orchestrated Kanban Board

> **Submission for Forage / AI Agent Challenge by Karan Pratap Singh**

AgileBoard is a collaborative, Trello-style Kanban board application featuring a modern Light/Dark glassmorphic user interface inspired by the **Cursor developer brand guidelines** (warm cream editorial canvas, dark slate theme, hairline depth, and Cursor Orange accents), built with React (Vite) and backed by a robust REST API built with Laravel (PHP 8.3 & SQLite).

This project was built entirely by orchestrating a two-agent system (**Hermes** as the Brain/Planner & **OpenClaw** as the Hands/Coder) wired through dedicated Slack sockets.

---

## 🎯 Submission Deliverables & Quick Access Links

| Deliverable | Location / Access Link | Description |
| :--- | :--- | :--- |
| 🌐 **Live App URL** | [forage2karan.vercel.app](https://forage2karan.vercel.app) | Deployed live web application on Vercel |
| 🐙 **Public GitHub Repo** | [github.com/SypherKx/forge2-qualifier-KaranPratapSingh](https://github.com/SypherKx/forge2-qualifier-KaranPratapSingh) | Public cloneable code repository |
| 📹 **Walkthrough Video** | [evidence/walkthrough.mp4](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/evidence/walkthrough.mp4) | 60-90s screen-recording evidence inside repo (32.7 MB) |
| 💬 **Slack Export Logs** | [evidence/slack_export/](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/evidence/slack_export/) | JSON exports of `#sprint-main`, `#agent-coder`, `#agent-log` |
| 📸 **UI Screenshots** | [evidence/screenshots/](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/evidence/screenshots/) | High-res dark slate & warm cream theme screenshots |
| 📜 **Agent Work Log** | [agent-log.md](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/agent-log.md) | Unedited execution trace of Hermes & OpenClaw |
| 🛠️ **Developer & Contributor Guide** | [DEVELOPER_GUIDE.md](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/DEVELOPER_GUIDE.md) | Full codebase map, folder structure & developer extension guide |
| 🏗️ **System Architecture** | [ARCHITECTURE.md](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/ARCHITECTURE.md) | Agent breakdown, Slack scheme & model routing logic |

---

## 📹 Evidence Walkthrough Video

> [!IMPORTANT]
> **Evaluators & Reviewers**: The full screen-recording demonstration video required for submission guidelines is committed directly inside the repository at:
> 
> 📁 **[evidence/walkthrough.mp4](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/evidence/walkthrough.mp4)** (32.7 MB)
> 
> **Demonstrates**:
> 1. ✅ **Demo Board Seeding**: Pre-populated card initialization.
> 2. ✅ **Fluid Swimlane Drag & Drop**: Card movement across `To Do`, `In Progress`, and `Done`.
> 3. ✅ **Card Customization**: Tag toggles, assignee assignment, and due date picking.
> 4. ✅ **Overdue Date Flagging**: Red boundary highlights denoting past due tasks.
> 5. ✅ **Board & Column Management**: Multi-board creation and column customization.

---

## 💬 Slack Export Files (`/evidence/slack_export`)

All agent and human communication channels are exported in standard Slack JSON format in the repository:

- 💬 **[channels.json](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/evidence/slack_export/channels.json)**: Channel directory (`#sprint-main`, `#agent-coder`, `#agent-log`).
- 👤 **[users.json](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/evidence/slack_export/users.json)**: User definitions for Karan, Hermes (Brain), and OpenClaw (Hands).
- 📢 **[sprint-main.json](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/evidence/slack_export/sprint-main.json)**: `#sprint-main` channel transcript (Goal setting & plan formulation).
- 🛠️ **[agent-coder.json](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/evidence/slack_export/agent-coder.json)**: `#agent-coder` channel transcript (Task dispatch & execution).
- 📜 **[agent-log.json](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/evidence/slack_export/agent-log.json)**: `#agent-log` channel transcript (System notifications & automated shell output).
- 📄 **[SLACK_EXPORT_SUMMARY.md](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/evidence/slack_export/SLACK_EXPORT_SUMMARY.md)**: Full Slack export audit guide.

---

## 📸 Screenshots Gallery (`/evidence/screenshots`)

- 🌙 **[01_kanban_board_dark_theme.svg](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/evidence/screenshots/01_kanban_board_dark_theme.svg)**: Cursor Dark Slate Theme with overdue card highlighting.
- ☀️ **[02_kanban_board_light_theme.svg](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/evidence/screenshots/02_kanban_board_light_theme.svg)**: Warm Cream Editorial Theme canvas.
- 📄 **[SCREENSHOTS.md](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/evidence/screenshots/SCREENSHOTS.md)**: Visual screenshots walkthrough document.

---

## Core Features

- **Multi-Board Workspace**: Create, switch, and delete boards dynamically.
- **Structured Columns (Swimlanes)**: Boards start with `To Do`, `In Progress`, and `Done` lists. Add new columns on the fly.
- **Interactive Cards**: Create, edit, and delete cards within lists.
- **Interactive Drag-and-Drop**: Drag cards between lists using HTML5 drag-and-drop actions.
- **Task Assignment**: Add board members and assign cards.
- **Categorization Tags**: Create colored tags and toggle them on cards.
- **Due Date Tracking**: Select a due date/time. Overdue tasks are highlighted with a soft crimson boundary glow.
- **Theme Toggle**: Toggle between **Warm Cream (Light)** and **Premium Slate (Dark)** themes.
- **Built-in LocalStorage Fallback**: Fully functional Offline Mode that detects backend offline state and saves all data to local browser storage automatically.
- **AI Agent Build Simulation**: An interactive in-workspace simulation demonstrating Hermes & OpenClaw planning, editing, and compiling the board inside Slack in real-time.

---

## Tech Stack & Configuration Files

- **Backend**: Laravel (PHP 8.3), SQLite Database, Eloquent ORM.
- **Frontend**: React 19 (Vite), Vanilla CSS (Custom Glassmorphism, Google Fonts).
- **Orchestration Config**: [hermes-config.yaml](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/hermes-config.yaml) and [openclaw.json](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/openclaw.json) (No secrets hardcoded, all credentials loaded from host environment).
- **Agent Work Logs**: Read [agent-log.md](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/agent-log.md) for the unedited task execution trace.
- **Agent Skills**: Configured under the [skills/status-report](file:///c:/Users/itska/OneDrive/Desktop/forage2/forge2-qualifier-karan-main/skills/status-report) folder.

---

## Model Routing Rationale

All models used in this build are 100% free:

1. **Hermes (Brain / Planning)**: Guided by **Google Gemini 2.5 Flash** & **Groq gpt-oss-120b**.
   - *Why*: Gemini and Groq's high-tier models have outstanding logic structure and zero-shot reasoning. This is crucial for Hermes to break down abstract user goals into task files.
2. **OpenClaw (Hands / Execution)**: Guided by **Ollama qwen2.5-coder** (local) & **Groq llama-3.3-70b-versatile**.
   - *Why*: Local Ollama execution offers unlimited token throughput, bypassing API rate limit thresholds, while Groq provides extremely fast compilation and syntax validation checks.

---

## Local Run Instructions

### 1. Launch the Frontend (Includes Offline Mode & Simulation)
Since the app features a built-in LocalStorage fallback database, you can run the entire frontend immediately without setting up PHP or Laravel locally:

1. Navigate to the `/frontend` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173/` in your browser.
5. Inside the Workspace, click **"Seed Demo Board"** to populate lists or click **"🤖 Simulate AI Build"** to run the agent compile simulation.

### 2. Launch the Backend API (Optional)
If you have PHP 8.2+ and Composer installed:

1. Navigate to the `/backend` directory:
   ```bash
   cd backend
   ```
2. Copy the environment template:
   ```bash
   copy .env.example .env
   ```
3. Generate the application key:
   ```bash
   php artisan key:generate
   ```
4. Run the database migrations (creates the SQLite database and tables):
   ```bash
   php artisan migrate
   ```
5. Start the local development server:
   ```bash
   php artisan serve
   ```
   The API will now be running at `http://127.0.0.1:8000`.

---

## Deployment & Repository Info

- **Public GitHub Repository**: [https://github.com/SypherKx/forge2-qualifier-KaranPratapSingh](https://github.com/SypherKx/forge2-qualifier-KaranPratapSingh)
- **Live Demo App**: [https://forage2karan.vercel.app](https://forage2karan.vercel.app)
- **Backend API (Render)**: [https://forge2-laravel-api.onrender.com](https://forge2-laravel-api.onrender.com)
- **Author / Developer**: Karan Pratap Singh
