import { AuthPanel } from "./components/auth/AuthPanel";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthPanel/>
      </div>
    </div>
  );
}

export default App;
