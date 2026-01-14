# NoFap Hydra 🐉

**NoFap Hydra** is a privacy-first, decentralized streak tracker and community designed to help you build discipline and self-mastery. Built on the **Nostr** protocol, Hydra ensures your data remains yours—encrypted, decentralized, and censorship-resistant.

![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)
![Protocol: Nostr](https://img.shields.io/badge/Protocol-Nostr-purple.svg)
![Platform: Android](https://img.shields.io/badge/Platform-Android-green.svg)

---

## 🚀 Key Features

### 🛡️ Decentralized Privacy
*   **NIP-44 (v2) Encryption**: Your streak and journal data are encrypted end-to-end. Only your private key can decrypt your progress.
*   **No Central Servers**: No accounts, no email, no central database. Your data lives on a global network of independent relays.
*   **Identity Sovereignty**: Manage your identity using standard Nostr keys (nsec/npub).

### 💬 Community & Chat
*   **Global Chat Room**: Connect with other warriors using a high-performance, real-time chat interface.
*   **Automatic Identity Discovery**: Hydra automatically fetches usernames and profiles (Kind 0) from the network, so you see people, not hex codes.
*   **Brutalist Aesthetic**: A high-contrast, minimalist UI designed for focus and impact.

### 📱 Premium Mobile Experience
*   **Neo-Brutalist Design**: A unique "Hydra" visual style that stands out from generic trackers.
*   **Offline-First**: Built with an intelligent offline queue. Your events are stored locally and sync automatically when you're back online.
*   **Automatic APK Builds**: Every update is automatically compiled into a fresh Android APK via GitHub Actions.

---

## 📥 Getting the App

### 🛠️ GitHub Actions (Latest Build)
The most up-to-date version of the app is always available as a downloadable artifact:
1.  Navigate to the **[Actions](https://github.com/darkmaster0345/nofaphydra/actions)** tab in this repository.
2.  Click on the most recent successful "Build Hydra APK" workflow run.
3.  Scroll down to **Artifacts** and download `Hydra-Chat-Debug-APK`.

### 📦 Releases
For stable versions, visit the **[Releases](https://github.com/darkmaster0345/nofaphydra/releases)** page and download the latest `.apk`.

---

## �️ For Developers

Hydra is built with **React**, **TypeScript**, **Vite**, and **Capacitor**.

### Prerequisites
*   Node.js 20+
*   Android Studio (for local native builds)

### Local Setup
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/darkmaster0345/nofaphydra.git
    cd nofaphydra
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
4.  **Sync Android Project**:
    ```bash
    npm run build
    npx cap sync android
    ```

---

## 🤝 Contributing & FOSS
NoFap Hydra is **Free and Open Source Software (FOSS)** under the MIT License. We welcome contributions to the code, design, and relay list.

*   **Zero Trackers**: No analytics, no ad-SDKs, no telemetry.
*   **Censorship Resistant**: Built on [Nostr](https://nostr.com/), an open protocol for global censorship-resistant networks.

---

*"Stay strong. Stay disciplined. Become legendary."* 🐉
