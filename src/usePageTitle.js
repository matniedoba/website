import { useEffect } from 'react'

const SUFFIX = 'Matthäus Niedoba'

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${SUFFIX}` : SUFFIX
  }, [title])
}
