// pyodide.worker.ts

// Define the shape of Pyodide (simplified)
interface Pyodide {
    loadPackage: (packages: string[]) => Promise<void>;
    runPythonAsync: (code: string) => Promise<void>;
    setStdout: (options: { batched: (msg: string) => void }) => void;
    setStderr: (options: { batched: (msg: string) => void }) => void;
}

// Import Pyodide as an ES Module
// @ts-ignore - Importing from URL is authentic JS behavior but TS complains without config
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.mjs";

let pyodide: Pyodide | null = null;

async function loadPython() {
    try {
        // @ts-ignore - loadPyodide is available globally after importScripts
        pyodide = await loadPyodide({
            stdout: (msg: string) => postMessage({ type: 'output', content: msg }),
            stderr: (msg: string) => postMessage({ type: 'error', content: msg })
        });

        console.log("Pyodide loaded successfully inside worker.");
        postMessage({ type: 'loaded' });
    } catch (err: any) {
        postMessage({ type: 'error', content: `Failed to load Pyodide: ${err.message}` });
    }
}

// Start loading immediately
loadPython();

// Listen for code from the main thread
self.onmessage = async (event: MessageEvent<string>) => {
    const pythonCode = event.data;

    if (!pyodide) {
        postMessage({ type: 'error', content: "Python is still loading... please wait." });
        return;
    }

    try {
        // Run the code!
        await pyodide.runPythonAsync(pythonCode);
    } catch (error: any) {
        postMessage({ type: 'error', content: error.message });
    }
};
