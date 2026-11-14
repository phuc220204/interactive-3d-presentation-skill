import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Fonts: only the latin + vietnamese subsets (keeps the single-file build small). Swap families in content/theme.ts + here.
import '@fontsource/playfair-display/latin-600.css';
import '@fontsource/playfair-display/vietnamese-600.css';
import '@fontsource/playfair-display/latin-700.css';
import '@fontsource/playfair-display/vietnamese-700.css';
import '@fontsource/playfair-display/latin-700-italic.css';
import '@fontsource/playfair-display/vietnamese-700-italic.css';
import '@fontsource/be-vietnam-pro/latin-300.css';
import '@fontsource/be-vietnam-pro/vietnamese-300.css';
import '@fontsource/be-vietnam-pro/latin-400.css';
import '@fontsource/be-vietnam-pro/vietnamese-400.css';
import '@fontsource/be-vietnam-pro/latin-600.css';
import '@fontsource/be-vietnam-pro/vietnamese-600.css';
import '@fontsource/be-vietnam-pro/latin-800.css';
import '@fontsource/be-vietnam-pro/vietnamese-800.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/vietnamese-400.css';
import '@fontsource/jetbrains-mono/latin-600.css';
import '@fontsource/jetbrains-mono/vietnamese-600.css';
// Preset fonts (all with Vietnamese subsets). Browsers download a face only when a theme uses it.
import '@fontsource/space-grotesk/latin-500.css';
import '@fontsource/space-grotesk/vietnamese-500.css';
import '@fontsource/space-grotesk/latin-700.css';
import '@fontsource/space-grotesk/vietnamese-700.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/vietnamese-400.css';
import '@fontsource/ibm-plex-mono/latin-600.css';
import '@fontsource/ibm-plex-mono/vietnamese-600.css';
import '@fontsource/lora/latin-400.css';
import '@fontsource/lora/vietnamese-400.css';
import '@fontsource/lora/latin-600.css';
import '@fontsource/lora/vietnamese-600.css';
import '@fontsource/pangolin/latin-400.css';
import '@fontsource/pangolin/vietnamese-400.css';
import '@fontsource/patrick-hand/latin-400.css';
import '@fontsource/patrick-hand/vietnamese-400.css';
import '@fontsource/itim/latin-400.css';
import '@fontsource/itim/vietnamese-400.css';
import '@fontsource/mali/latin-400.css';
import '@fontsource/mali/vietnamese-400.css';
import '@fontsource/mali/latin-600.css';
import '@fontsource/mali/vietnamese-600.css';
import './index.css';
import { applyTheme } from './lib/applyTheme';
import { deck } from './content';
import App from './App';

applyTheme();
document.title = deck.title;
document.documentElement.lang = deck.lang ?? 'vi';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
