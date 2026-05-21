import Papa from 'papaparse'

const normalizeKey = (k) => k.trim().toLowerCase().replace(/\s+/g, '_')

export function parseMatchCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => normalizeKey(h),
      complete: ({ data, errors }) => {
        if (errors.length) return reject(new Error(errors[0].message))

        const matches = data.map((row) => ({
          id: crypto.randomUUID(),
          date: row.date || row.match_date || '',
          opponent: row.opponent || row.team || '',
          isHome: String(row.home_away || row.venue || 'home').toLowerCase().startsWith('h'),
          location: row.location || row.venue || row.ground || '',
          scoreHome: null,
          scoreAway: null,
          attendance: [],
          lineup: [],
        }))

        resolve(matches)
      },
      error: reject,
    })
  })
}

export function compressPhoto(file, maxPx = 200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}
