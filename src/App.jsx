import './App.css'
import ChatDepartamento from './components/ChatDepartamento'

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Chat Departamentos - Condominio</h1>
        <p>Comunicación en tiempo real entre departamentos</p>
      </header>
      <main className="app-main">
        <ChatDepartamento />
      </main>
    </div>
  )
}

export default App
