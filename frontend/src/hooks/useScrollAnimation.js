import { useEffect, useRef } from 'react'

export default function useScrollAnimation(options = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.15,
        ...options
      }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [options])

  return ref
}
