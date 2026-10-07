const { readIndex, readPost, toCard, DELETED_SLUGS } = require('./_lib/store')
const { normalizeParagraphs } = require('./_lib/content')

// Until the store is seeded — or if it is ever unreachable — the newsroom falls back to
// the entries shipped with the deployment so the page is never empty.
const bundled = require('./_lib/seed/newsroom.json')
const bundledCards = bundled
  .filter((post) => post.status === 'published' && (!DELETED_SLUGS || !DELETED_SLUGS.has(post.slug)))
  .map(toCard)
const bundledBySlug = new Map(bundled.map((post) => [post.slug, post]))

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')

  try {
    const { slug, category } = req.query

    if (slug) {
      if (DELETED_SLUGS && DELETED_SLUGS.has(slug)) {
        return res.status(404).json({ error: 'Not found' })
      }
      // A miss only falls back while the store is unseeded. Once it holds entries it is
      // the single source of truth, so a deleted post stays deleted.
      let post = await readPost(slug)
      if (!post && !(await readIndex()).length) post = bundledBySlug.get(slug)

      if (!post || post.status !== 'published' || (DELETED_SLUGS && DELETED_SLUGS.has(post.slug))) {
        return res.status(404).json({ error: 'Not found' })
      }
      if (post.content) {
        post = {
          ...post,
          content: normalizeParagraphs(post.content)
        }
      }
      return res.status(200).json(post)
    }

    const stored = (await readIndex()).filter((card) => card.status === 'published' && (!DELETED_SLUGS || !DELETED_SLUGS.has(card.slug)))
    const published = stored.length ? stored : bundledCards
    const filtered = published.filter((card) => !DELETED_SLUGS || !DELETED_SLUGS.has(card.slug))
    const cards = category && category !== 'all'
      ? filtered.filter((card) => card.category === category)
      : filtered

    return res.status(200).json({ posts: cards })
  } catch (error) {
    console.error('Newsroom read failed, serving bundled entries:', error.message)
    const fallback = bundledCards.filter((card) => !DELETED_SLUGS || !DELETED_SLUGS.has(card.slug))
    return res.status(200).json({ posts: fallback })
  }
}
