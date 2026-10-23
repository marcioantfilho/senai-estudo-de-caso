import { useState } from 'react'
import PlayersPage from './modules/players/PlayersPage'
import ClubsPage from './modules/clubs/ClubsPage'
import LeaguePage from './modules/league/LeaguePage'
import './App.css'

const modules = [
  { id: 'players', label: 'Jogadores', Page: PlayersPage },
  { id: 'clubs', label: 'Clubes', Page: ClubsPage },
  { id: 'league', label: 'Liga', Page: LeaguePage },
] as const

type ModuleId = (typeof modules)[number]['id']

function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('players')
  const { Page } = modules.find((module) => module.id === activeModule) ?? modules[0]

  return (
    <>
      <a className="skip-link" href="#main-content">Ir para o conteúdo</a>

      <header className="app-header">
        <div className="app-brand">
          <span className="brand-mark" aria-hidden="true">LF</span>
          <div>
            <p className="brand-title">Liga de Futebol</p>
            <p className="brand-description">Gestão da liga</p>
          </div>
        </div>
      </header>

      <div className="app-layout">
        <nav className="module-navigation" aria-label="Módulos">
          {modules.map((module) => (
            <button
              key={module.id}
              type="button"
              aria-current={module.id === activeModule ? 'page' : undefined}
              onClick={() => setActiveModule(module.id)}
            >
              {module.label}
            </button>
          ))}
        </nav>

        <main id="main-content" className="main-content" tabIndex={-1}>
          <Page />
        </main>
      </div>
    </>
  )
}

export default App
