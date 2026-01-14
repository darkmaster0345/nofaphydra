# NoFap Hydra 🐉

**NoFap Hydra** is a privacy-first, decentralized streak tracker designed to help you build discipline and self-mastery. Unlike other apps that sell your data or require accounts, Hydra is built on the **Nostr** protocol, ensuring your data remains yours—encrypted, decentralized, and censorship-resistant.

---

## 🛡️ Privacy & Security (Nostr Integration)

We believe your journey is personal. Hydra is engineered for maximum privacy using open standards:

*   **NIP-44 (v2) Encryption**: All streak data is encrypted end-to-end. Only your private key can decrypt the `content` of the notes.
*   **NIP-19 (nsec/npub)**: Standardized key encoding for secure export and sharing.
*   **NIP-01**: Basic event protocol for publishing and querying relays.
*   **No Central Servers**: There is no "Hydra Cloud." Your encrypted data is stored on decentralized Nostr relays (`wss://nos.lol`, `wss://relay.damus.io`, `wss://relay.snort.social`).
*   **Offline-First**: Built with a robust offline queue. Track your progress anywhere; Hydra syncs securely when you reconnect.

> **Pro-Tip: Verification (NIP-05)** 
> To get a verification checkmark in Hydra, host a `nostr.json` file on your domain at `/.well-known/nostr.json` with your pubkey. Then, simply enter your `name@domain.com` in the Hydra profile settings.

## 🦅 Freedom & Open Source

NoFap Hydra is Free and Open Source Software (FOSS).

*   **License**: MIT License. You are free to audit, fork, and modify the code.
*   **Zero Trackers**: We include zero analytics, trackers, or advertising SDKs.
*   **Decentralized**: Built on [Nostr](https://nostr.com/), an open protocol for censorship-resistant global networks.

---

## 📥 How to Install

### Option A: F-Droid (Recommended for Privacy)
*Coming soon to the F-Droid repository.*

1.  Download the F-Droid client.
2.  Search for "NoFap Hydra".
3.  Install and enjoy automatic updates.

### Option B: GitHub Releases (Direct Download)
1.  Go to the [Releases](https://github.com/darkmaster0345/nofaphydra/releases) page.
2.  Download the latest `NoFapHydra-vX.X.X.apk`.
3.  Open the file on your Android device and confirm installation.

---

## 🔧 For Developers & F-Droid Maintainers

Hydra is built with **React**, **TypeScript**, **Vite**, and **Capacitor**.

### Prerequisites
*   Node.js 20+
*   Android Studio (for building APKs)

### Reproducible Build Instructions

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/darkmaster0345/nofaphydra.git
    cd nofaphydra
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Build Web Assets**:
    ```bash
    npm run build
    ```

4.  **Sync Native Project**:
    ```bash
    npx cap sync android
    ```

5.  **Build Signed APK**:
    ```bash
    cd android
    ./gradlew assembleRelease
    ```

    *Note: The `dependenciesInfo` block is configured to exclude dependency metadata for reproducible builds.*

---

## 🤝 Contributing

We welcome contributions! Whether it's fixing bugs, improving the UI, or adding new relays.

1.  Fork the project.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

---

*"Stay strong. Stay disciplined. Become legendary."*
