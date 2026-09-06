import json
from pathlib import Path

from app.orchestrator.models import ChangeSet, DesignBlueprint, FileChange


def scene_blueprint() -> DesignBlueprint:
    return DesignBlueprint(
        project_type="three_d",
        template="react-three",
        audience="Visitors exploring an interactive material study",
        visual_direction="Restrained dark editorial layout with lavender material accents and a large procedural sculpture.",
        design_tokens={
            "background": "#11131c",
            "accent": "#b8a0ff",
            "type": "system-ui",
        },
        pages=["Interactive material study"],
        interactions=[
            "Switch geometry",
            "Change material color",
            "Pause/resume rotation",
        ],
        acceptance_criteria=[
            "Controls update the sculpture",
            "Resize and reduced motion are respected",
            "A fallback appears without WebGL",
        ],
        limitations=["Curated offline demo, not prompt-driven generation"],
    )


def scene_snapshot() -> ChangeSet:
    root = Path(__file__).parent
    files = {
        "src/main.tsx": "import {createRoot} from 'react-dom/client'; import App from './App'; createRoot(document.getElementById('root')!).render(<App/>);",
        "src/App.tsx": (root / "three_scene.tsx").read_text(encoding="utf-8"),
        "src/styles.css": (root / "three_scene.css").read_text(encoding="utf-8"),
        "index.html": '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Form Lab</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>',
        "package.json": json.dumps(
            {
                "name": "form-lab",
                "private": True,
                "type": "module",
                "scripts": {"dev": "vite", "build": "vite build"},
                "dependencies": {
                    "react": "19.2.8",
                    "react-dom": "19.2.8",
                    "three": "0.185.1",
                },
                "devDependencies": {"vite": "8.2.0"},
            }
        ),
    }
    return ChangeSet(
        summary="Offline React + Three.js material study",
        files=[
            FileChange(path=path, content=content) for path, content in files.items()
        ],
    )
