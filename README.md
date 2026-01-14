# BYOS Hub (Build Your Own Standard)

A custom deck builder designed for the **Build Your Own Standard (BYOS)** Magic: The Gathering format. This application allows users to select a Core Set, Traditional Blocks, and Modern Era sets to define their own custom Standard environment and build valid decks within it.

## Features

- **Format Validation**: Automatically validates decks against your chosen BYOS configuration.
- **Card Browser**: Integrated card search and filtering powered by Scryfall.
- **Customizable Environment**:
  - Select 1 Core Set
  - Select Traditional Blocks
  - Select Modern Era sets (custom block logic included)
- **Import/Export**: Easy deck sharing and saving.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [Git](https://git-scm.com/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/HeadlessWing/ByosHub.git
    cd ByosHub
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the App

**Desktop App (Recommended)**
To launch the Electron desktop application:
```bash
npm run start:electron
```

**Web Version (Development)**
To run the web version in your browser (some desktop features may be limited):
```bash
npm run dev
```

### Building for Release

To create a standalone executable for Windows:
```bash
npm run build:packager
```
The output will be in the `dist-packager` folder.

## Technologies

- **Frontend**: React + Vite
- **Desktop Wrapper**: Electron
- **Data Source**: [Scryfall API](https://scryfall.com/docs/api)
