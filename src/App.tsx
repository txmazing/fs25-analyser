import AppContent from "./components/AppContent";
import { ThemeProvider } from "./components/ThemeProvider";
import "./index.css";

function App() {
	return (
		<ThemeProvider defaultTheme='light' storageKey='fs25-theme'>
			<AppContent />
		</ThemeProvider>
	);
}

export default App;
