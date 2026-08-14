import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import About from './pages/About.jsx'
import Projects from './pages/Projects.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<About />} />
        <Route path="projects" element={<Projects />} />
        {/* Add further subpages here, e.g.:
            <Route path="work/anchorpoint" element={<Anchorpoint />} /> */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
