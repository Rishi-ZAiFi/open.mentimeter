# OpenMenti

An open-source, local-first interactive polling and assessment platform. Run live quizzes, audience polls, and Q&A sessions over your local network (LAN or Wi-Fi hotspot) with zero cloud dependencies or subscription paywalls.

---

## Overview

OpenMenti is designed for classrooms, workshops, and training rooms where internet connectivity is unreliable, restricted, or unavailable. The host machine runs a lightweight local server, and participants connect directly from their mobile or laptop browsers without downloading any apps.

### Key Highlights
- **100% Offline & Local-First**: Operates entirely over local Wi-Fi or a mobile hotspot. No external internet connection required.
- **Real-Time Synchronization**: Instant question delivery, synchronized countdown timers, and live audience response counts via WebSockets.
- **Audience Engagement**: Interactive Q&A wall with upvoting, live word clouds, and floating reaction emojis.
- **Presenter Remote (Mentimote)**: Mobile-friendly controller (`?role=remote`) allowing hosts to advance slides, manage timers, and view speaker notes directly from their phone.
- **Offline Audio**: Web Audio synthesizer for countdown urgency, answer reveals, and leaderboard celebrations.
- **Participant Profiles & Scoring**: Mobile-number-based participant tracking to prevent duplicate submissions, with optional speed-bonus scoring.
- **Analytics & Excel Export**: Instant multi-sheet `.xlsx` report generation covering student directories, exam results, and question banks.
- **Desktop Launcher**: Includes a standalone Windows executable (`DigiWarriors.exe`) for one-click startup without using the terminal.

---

## Comparison

| Feature | OpenMenti | Mentimeter | Kahoot |
| :--- | :---: | :---: | :---: |
| **Pricing** | Free & Open Source | Subscription / Paid | Subscription / Paid |
| **Participant Limit** | Hardware bound | 50 (Free tier) | 10–50 (Free tier) |
| **Internet Required** | No (Local LAN / Hotspot) | Yes | Yes |
| **Data Hosting** | Local JSON Store | Cloud | Cloud |
| **Export Formats** | Multi-sheet Excel (.xlsx) | Paid tier | Paid tier |
| **Mobile Remote Control** | Included | Included | Included |

---

## Architecture

```
                     ┌──────────────────────────────┐
                     │     Host Laptop (Server)     │
                     │    http://localhost:3000     │
                     └──────────────┬───────────────┘
                                    │
                   Local Wi-Fi / Hotspot (No Internet)
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│ Participant 1│             │ Participant 2│             │ Participant N│
│ Mobile Phone │             │ Mobile Phone │             │ Laptop / Tab │
│ 192.168.x:3000             │ 192.168.x:3000             │ 192.168.x:3000
└──────────────┘             └──────────────┘             └──────────────┘
```

1. **Host Starts Session**: Choose timer durations (15s, 30s, 45s, 60s, or untimed), speed bonuses, and category visibility.
2. **Participants Join**: Scan the on-screen QR code or visit the host IP (e.g., `http://192.168.1.100:3000`) and enter their name and phone number.
3. **Live Examination & Polls**: Host advances questions; countdown timers and live response charts update across all participant devices synchronously.
4. **Data Export**: Export complete session logs and scorecards to Excel with one click.

---

## Quick Start

### Option A: Windows Launcher (No Command Line)
Double-click `DigiWarriors.exe` (or run `Start_Digi_Warriors.bat`). This starts the local server in the background and opens the dashboard in your default browser.

### Option B: Node.js (Windows, macOS, Linux)

#### Prerequisites
- Node.js (v18 or newer)
- npm

#### Installation & Setup
```bash
# 1. Clone the repository
git clone https://github.com/Rishi-ZAiFi/open.mentimeter.git
cd open.mentimeter

# 2. Install dependencies
npm install

# 3. Start the application
npm start
```

Open your browser and navigate to:
```text
http://localhost:3000
```

---

## Custom Question Banks

You can use the built-in question bank or load custom questions via JSON from the Trainer Setup screen.

### Question Schema (`questions.json`)
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

## Presenter Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` / `→` | Advance to next question / Finish |
| `R` | Reveal answer & voting breakdown |
| `L` | Toggle live leaderboard podium |
| `P` | Pause / Resume timer |
| `1` – `9` | Jump directly to question number |

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti, Recharts
- **Backend**: Node.js, Express, Socket.io (WebSockets), SheetJS (xlsx)
- **Data Persistence**: Local JSON store (`server/db.json`)
- **Desktop Launcher**: Native C# Windows Forms (`launcher.cs` compiled to `DigiWarriors.exe`)

---

## Automated Tests

Run the test suites to verify WebSocket synchronization, session recovery, and account persistence:

```bash
# Test multi-session persistent student accounts & Excel export
node test_persistent_accounts.js

# Test live quiz socket synchronization & answer submissions
node test_quiz_flow.js

# Test browser reload state recovery
node test_reload_flow.js

# Test topic/category visibility toggles
node test_topic_toggle.js

# Test persistent trainer profiles & session reconnect
node test_trainer_profile_flow.js
```

---

## License

Distributed under the [MIT License](LICENSE).
