export const getLatestNews = async () => {
  const index = await getNewsIndex()
  if (!index || index.length === 0) throw new Error('No news available')
  const latestDate = index[0].date
  const response = await fetch(`/data/${latestDate}.json`)
  if (!response.ok) throw new Error('Failed to load latest post')
  return response.json()
}

export const getNewsByDate = async (date) => {
  const response = await fetch(`/data/${date}.json`)
  if (!response.ok) throw new Error('Post not found')
  return response.json()
}

export const getNewsIndex = async () => {
  const response = await fetch('/data/index.json')
  if (!response.ok) return []
  return response.json()
}
