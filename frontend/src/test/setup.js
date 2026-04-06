import '@testing-library/jest-dom'

class MockIntersectionObserver {
  observe(target) {
    target.classList.add('is-visible')
  }

  unobserve() {}

  disconnect() {}
}

global.IntersectionObserver = MockIntersectionObserver
