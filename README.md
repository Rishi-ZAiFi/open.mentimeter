# ⚡ OpenMenti / AirQuiz — Local-First Real-Time Assessment Engine

<div align="center">

[![Latest Release](https://img.shields.io/badge/Release-v1.0.0--Win64-blueviolet?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/your-username/openmenti/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io)
[![Zero Cloud](https://img.shields.io/badge/Zero--Cloud-100%25%20Offline-success?style=for-the-badge)]()

**A free, open-source, local-first alternative to Mentimeter & Kahoot.**  
*Host high-stakes live MCQ examinations, training assessments, and interactive classroom quizzes without internet, cloud subscriptions, Firebase, or external servers.*

[📦 **Download v1.0.0 (Windows .exe)**](https://github.com/your-username/openmenti/releases/latest) • [⚡ Quick Start](#-quick-start) • [✨ Key Features](#-key-features) • [⚖️ Feature Comparison](#-openmenti-vs-mentimeter-vs-kahoot) • [📝 Question Banks](#-custom-question-banks) • [📊 Excel Export](#-master-excel-export)

---

<!-- 🎥 Replace demo.gif with a 10-second screen capture of Trainer screen + Mobile phone joining & voting -->
<p align="center">
  <img src="https://raw.githubusercontent.com/your-username/openmenti/main/public/demo-preview.gif" alt="OpenMenti Live Demo Preview" width="850" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" onerror="this.onerror=null; this.src='https://placehold.co/850x420/1e293b/38bdf8?text=⚡+OpenMenti+Live+Demo+%7C+Zero-Cloud+Classroom+Engine';">
</p>

</div>

---

## ⚖️ OpenMenti vs Mentimeter vs Kahoot

| Feature | ⚡ **OpenMenti / DigiWarriors** | 🟣 Mentimeter | 🟢 Kahoot |
| :--- | :---: | :---: | :---: |
| **Pricing** | **100% Free & Open Source** | $12–$25 / month | $17–$60 / month |
| **Participant Limit** | **Unlimited** (Hardware bound) | 50 (Free tier) | 10–50 (Free tier) |
| **Internet Required?** | ❌ **Zero (Runs on local Hotspot/LAN)** | ✅ Requires Internet | ✅ Requires Internet |
| **Data Privacy** | 🔒 **100% On-Premises / Local JSON** | Cloud Hosted | Cloud Hosted |
| **Latency** | ⚡ **Sub-millisecond Local WebSockets** | 200–800ms Cloud | 200–800ms Cloud |
| **Standalone Desktop App** | ✅ **Native Windows `.exe` included** | ❌ Web Only | ❌ Web Only |
| **Student History & Profiles** | ✅ **Built-in Student Directory & Marks** | Paid Tier | Paid Tier |
| **Master Excel Export (.xlsx)** | ✅ **Multi-sheet automated workbook** | Paid Tier | Paid Tier |

---

## 💡 Why This Exists

Commercial tools like Mentimeter, Kahoot, Slido, and Quizizz are great—until you face:
- ❌ **Spotty or restricted internet** in exam halls, corporate training rooms, or rural centers.
- ❌ **Expensive paywalls** and strict participant limits ($15–$50+/month).
- ❌ **Cloud latency & privacy concerns** transmitting student data to third-party cloud servers.

**OpenMenti / AirQuiz** solves this by running a high-performance **local WebSocket server** directly from your laptop. 
- Participants simply connect to your laptop's **Wi-Fi hotspot or local LAN** from their phone/laptop browser.
- **Zero internet connection required.** Everything runs at sub-millisecond local network speeds.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 📴 **100% Local-First & Offline** | Air-gapped operation. Run assessments in basements, auditoriums, or off-grid classrooms. |
| ⚡ **Sub-Millisecond Live Sync** | Real-time question broadcasting, synchronized timers, and live response counters powered by WebSockets. |
| 🏎️ **Speed-Bonus Scoring** | Adaptive scoring: 100 base points for correct answers + up to 50 bonus points for lightning-fast responses. |
| 📱 **Zero-Install Mobile Flow** | Students join by navigating to a clean local URL or scanning a QR code on any mobile browser. |
| 👤 **Persistent Accounts & Anti-Duplicate** | Mobile number-based participant tracking. Prevents duplicate votes and tracks multi-exam student progress across days. |
| 📈 **Student Performance Profiles** | View student growth over time, historical exam timelines, and edit student details with real-time sync. |
| 📊 **Live Distribution & Explanations** | Beautiful animated bar charts showing cohort answer choices, correct answers, and rich technical explanations. |
| 🏷️ **Trainer Category Toggle** | Toggle question topic/category hints (e.g., *Formulas, Pivot Tables*) on or off to avoid giving premature hints. |
| 📑 **Master Excel Export (.xlsx)** | Single-click export producing multi-sheet Excel reports with student directories, marks logs, and question banks. |
| 🖥️ **Native Windows Executable** | Includes a standalone `DigiWarriors.exe` launcher with embedded icon and control dashboard. |

---

## 🚀 Quick Start

### Option A: One-Click Windows Launcher (No Command Line)
If you are on Windows, simply double-click:
```bash
DigiWarriors.exe
```
*(or run `Start_Digi_Warriors.bat`)*

This will automatically launch the local engine in the background and open your default browser to `http://localhost:3000`.

---

### Option B: Node.js (Cross-Platform: Windows, macOS, Linux)

#### 1. Clone the repository
```bash
git clone https://github.com/your-username/openmenti.git
cd openmenti
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Start the application
```bash
# Start the full stack (Vite frontend + Express/Socket.io backend)
npm start
```

#### 4. Open the Trainer Dashboard
Open your browser and navigate to:
```text
http://localhost:3000
```

---

## 📡 How It Works in a Live Classroom

```
                        ┌──────────────────────────────┐
                        │   Trainer Laptop (Server)    │
                        │    http://localhost:3000     │
                        └──────────────┬───────────────┘
                                       │
                      Local Wi-Fi / Hotspot (No Internet)
                                       │
       ┌───────────────────────────────┼───────────────────────────────┐
       ▼                               ▼                               ▼
┌──────────────┐                ┌──────────────┐                ┌──────────────┐
│  Student 1   │                │  Student 2   │                │  Student N   │
│ Mobile Phone │                │ Mobile Phone │                │ Laptop / Tab │
│ 192.168.x:3000                │ 192.168.x:3000                │ 192.168.x:3000
└──────────────┘                └──────────────┘                └──────────────┘
```

1. **Trainer creates a session**: Choose question timer (15s, 30s, 45s, 60s, or untimed), speed bonus option, and topic visibility.
2. **Trainer shares the join URL / QR code**: Display the big PIN screen (e.g. `http://192.168.1.100:3000` with session code `DW-7764`).
3. **Participants enter Mobile Number & Name**: Instant enrollment with duplicate prevention.
4. **Live Examination**:
   - Trainer controls question progression (`Space` or `Next Question`).
   - Timers tick down simultaneously across all participant screens.
   - When time expires or trainer clicks **Reveal**, all screens show option distribution & correct answers.
   - Live Leaderboard with animated podium ranking is revealed.
5. **Instant Export**: Trainer clicks **Export Excel** to download the master spreadsheet.

---

## 📝 Custom Question Banks

You can use the built-in 20-question technical question bank or upload your own custom JSON file from the **Trainer Setup** screen.

### Question JSON Schema (`questions.json`):
```json
[
  {
    "id": 1,
    "question": "What is the primary function of the INDEX-MATCH formula combination in Excel?",
    "options": [
      "To perform two-way dynamic lookups with superior flexibility over VLOOKUP",
      "To calculate the mathematical average of a filtered range",
      "To concatenate text strings from multiple disjoint cells",
      "To create 3D pivot charts automatically"
    ],
    "correctAnswer": 0,
    "category": "Lookup & Reference",
    "difficulty": "Advanced",
    "explanation": "INDEX-MATCH allows lookups in any direction (left or right) and does not break when columns are inserted or deleted."
  }
]
```

---

## 📊 Master Excel Export

Download comprehensive multi-sheet Excel reports (`.xlsx`) at any time via `/api/export-master` or through the UI:

- **Sheet 1 — Student Directory & Cumulative Performance**: Student IDs, mobile numbers, total quizzes attempted, cumulative marks, and average accuracy.
- **Sheet 2 — Exam Results Log**: Chronological attempt log with timestamps, session codes, ranks, and exact scores.
- **Sheet 3 — Sessions Log**: Complete archive of all past conducted quiz sessions.
- **Sheet 4 — Active Question Bank**: Complete record of questions, option distributions, and explanations.

---

## ⌨️ Trainer Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` / `→` | Advance to Next Question / Finish |
| `R` | Reveal Answer & Option Distribution |
| `L` | Toggle Live Leaderboard Podium |
| `P` | Pause / Resume Quiz Timer |
| `1` – `9` | Jump directly to Question number |

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: [React 18](https://react.dev/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/), [Canvas-Confetti](https://www.npmjs.com/package/canvas-confetti), [Recharts](https://recharts.org/)
- **Backend**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [Socket.io](https://socket.io/) (WebSockets), [SheetJS (xlsx)](https://sheetjs.com/)
- **Storage**: Local JSON database (`server/db.json`) with ACID-like atomic writes and multi-session historical timeline tracking.
- **Desktop Launcher**: Native C# Windows Forms Launcher (`launcher.cs` compiled to `DigiWarriors.exe`).

---

## 🧪 Testing

The repository includes end-to-end automated test suites for live socket connections, mobile accounts, state synchronization, and topic toggles:

```bash
# Test multi-session persistent student accounts & Excel export
node test_persistent_accounts.js

# Test live quiz socket synchronization & answer submissions
node test_quiz_flow.js

# Test browser reload state recovery
node test_reload_flow.js

# Test topic/category visibility toggles
node test_topic_toggle.js

# Test persistent trainer profiles & instant session reconnect
node test_trainer_profile_flow.js
```

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are warmly welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">
  <sub>Built with ❤️ for trainers, teachers, and developers who value privacy, speed, and offline reliability.</sub>
</div>
