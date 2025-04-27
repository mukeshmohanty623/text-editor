import TextEditor from "./components/TextEditor";
import './index.css'
function App() {
  return (
    <div>
      <h1 className="max-w-[80%] mx-auto mb-9 mt-4 text-5xl font-bold border-b border-dashed border-b-slate-400 pb-3">Text Editor</h1>
      <TextEditor />
    </div>
  );
}

export default App;