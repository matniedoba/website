import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import About from './pages/About.jsx'
import Projects from './pages/Projects.jsx'
import Gallery from './pages/Gallery.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<About />} />
        <Route path="projects" element={<Projects />} />
        <Route path="photography/:galleryName" element={<Gallery />} />
        {/* Add further subpages here, e.g.:
            <Route path="work/anchorpoint" element={<Anchorpoint />} /> */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
