<div align="center">

# OpenMenti

**Local-first interactive polling, quizzes, and live audience Q&A.**

An open-source presentation and assessment platform designed to run entirely over local networks with zero cloud dependencies.

</div>

---

## 📖 About

**OpenMenti** enables educators, trainers, and presenters to host interactive live quizzes, word clouds, polls, and Q&A sessions without relying on an active internet connection.

The presenter's laptop acts as the local server over standard Wi-Fi, Ethernet, or a mobile hotspot. Participants connect instantly using their browser—no app installations, cloud sign-ins, or subscription tiers required.

---

## ✨ Features

- **Local-First & Offline**: Operates seamlessly over local Wi-Fi or mobile hotspots without external internet access.
- **Instant Synchronization**: Real-time slide broadcast, synchronized timers, and live response charting powered by WebSockets.
- **Audience Interaction**:
  - Live multiple-choice quizzes with optional speed bonuses.
  - Interactive Q&A wall with audience upvoting and moderation.
  - Real-time word cloud generation and floating live reactions.
- **Presenter Remote**: Dedicated mobile controller view (`?role=remote`) to manage slides, timers, and speaker notes directly from your phone.
- **Offline Audio**: Synthesized sound effects for countdowns, reveals, and podium celebrations.
- **Participant Profiles**: Persistent local scoring and duplicate-submission prevention via participant phone/identifier.
- **Comprehensive Reports**: Single-click multi-sheet Excel (`.xlsx`) export including participant scorecards, session logs, and question banks.
- **Windows Launcher**: Standalone executable (`DigiWarriors.exe`) for one-click startup without command-line setup.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rishi-ZAiFi/open.mentimeter.git
   cd open.mentimeter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open the presenter dashboard**
   Navigate to `http://localhost:3000` in your web browser.

> **Windows Users:** You can also launch directly by double-clicking `DigiWarriors.exe` or `Start_Digi_Warriors.bat`.

---

## 🔄 How It Works

```
                     ┌──────────────────────────────┐
                     │     Host Laptop (Server)     │
                     │    http://localhost:3000     │
                     └──────────────┬───────────────┘
                                    │
                    Local Wi-Fi / Hotspot / LAN
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    ▼                               ▼                               ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│ Participant  │             │ Participant  │             │ Participant  │
│ Mobile Phone │             │ Mobile Phone │             │ Laptop / Tab │
│ 192.168.x:3000             │ 192.168.x:3000             │ 192.168.x:3000
└──────────────┘             └──────────────┘             └──────────────┘
```

1. **Host configures session**: Select question timer, category visibility, and scoring options.
2. **Audience connects**: Participants scan the QR code or visit the displayed local IP address.
3. **Run assessment**: Advance questions with real-time synchronized responses and leaderboards.
4. **Export data**: Download full session results directly to Excel.

---

## ⌨️ Presenter Shortcuts

| Key | Action |
| :--- | :--- |
| `Space` / `→` | Advance to next question / Finish |
| `R` | Reveal correct answer & distribution |
| `L` | Toggle leaderboard podium |
| `P` | Pause / Resume timer |
| `1` – `9` | Jump directly to question number |

---

## 📁 Custom Question Format

You can upload custom question banks via JSON directly from the setup dashboard:

```json
[
  {
    "id": 1,
    "question": "What is the primary function of INDEX-MATCH in spreadsheet software?",
    "options": [
      "Dynamic two-way lookups across rows and columns",
      "Calculating mathematical averages of filtered ranges",
      "Concatenating strings from multiple disjoint cells",
      "Creating 3D charts automatically"
    ],
    "correctAnswer": 0,
    "category": "Data Analysis",
    "difficulty": "Intermediate",
    "explanation": "INDEX-MATCH performs flexible lookups in any direction without breaking when columns are shifted."
  }
]
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Canvas Confetti
- **Backend**: Node.js, Express, Socket.io
- **Data & Export**: Local JSON store (`server/db.json`), SheetJS (`xlsx`)
- **Desktop Launcher**: C# / Windows Forms (`launcher.cs`)

---

## 🧪 Testing

Run the included end-to-end verification suites:

```bash
# Verify socket synchronization and submissions
node test_quiz_flow.js

# Verify participant accounts & Excel export
node test_persistent_accounts.js

# Verify state recovery after reload
node test_reload_flow.js

# Verify category toggle functionality
node test_topic_toggle.js
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
