<!-- [xihanzu-NR] -->
# Reyhan Akhtar Afriansyah (Hanz) — Developer Portfolio

Personal engineering portfolio of Reyhan Akhtar Afriansyah (Hanz), a 17-year-old developer and systems enthusiast from SMK Ma'arif 1 Kroya.

Authored entirely in pure HydraScript (`.hsx` and `.hs`), running on top of the Hydra meta-framework with zero TypeScript or JavaScript files in the source tree.

---

## Technical Highlights

* **100% HydraScript Source**: Every UI component is written in `.hsx` and every internal utility is written in `.hs`.
* **Zero Configuration Files**: Powered by `hydraconfig.json` in-memory orchestration. No `vite.config.ts`, `tailwind.config.ts`, or `tsconfig.json` required.
* **Component Architecture**:
  * Clean fullscreen hero with optical lift and viewport height adaptation.
  * Canvas-driven particle sparks (`ClickSpark.hsx`).
  * SVG stroke-draw title animation (`StrokeText.hsx`).
  * Staggered 3-layer underlay navigation drawer (`Navbar.hsx`).
  * Interactive 3D perspective background grid (`BackgroundGrid3D.hsx`).
  * Cardless editorial ledger layout for tech stack, credentials, and track record.
* **Toolchain**: Built using the native Rust Hydra compiler (`hydrascript`), compiled via Node-API in memory.

---

## Project Structure

```
├── hydraconfig.json     # Meta-framework server, compiler, and theme configuration
├── index.html           # HTML shell mounting /src/main.hsx directly
├── package.json         # Scripts and dependencies
├── public/              # Static assets and telemetry evidence images
└── src/
    ├── main.hsx         # Pure HydraScript browser entrypoint
    ├── App.hsx          # Root application shell
    ├── hydra.hs         # React hooks and runtime adapters
    ├── index.css        # Base stylesheet
    ├── components/      # UI components (.hsx)
    ├── data/            # Portfolio content and profile data (.hs)
    └── utils/           # Animation engines and helpers (.hs)
```

---

## Local Development

Ensure Node.js (v18+) is installed.

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Author

Reyhan Akhtar Afriansyah (Hanz)  
GitHub: [hanxthvy](https://github.com/hanxthvy)  
Compiler: [HydraScript](https://github.com/hanxthvy/hydrascript)

---

## License

MIT License. Copyright (c) 2026 Reyhan Akhtar Afriansyah.
