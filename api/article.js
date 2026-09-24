const { readPost, readIndex } = require('./_lib/store')
const { isSafeSlug } = require('./_lib/content')

const bundledBySlug = new Map(require('./_lib/seed/newsroom.json').map((post) => [post.slug, post]))

const SITE = 'https://www.avzdax.com'

const escapeHtml = (value) =>
  String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const absolute = (url) => (url && url.startsWith('/') ? SITE + url : url)

const page = ({ head, body }) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="icon" type="image/png" href="/favicon.png">
    <link rel="apple-touch-icon" href="/favicon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
${head}
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="/components/footer-styles.css" rel="stylesheet">
    <link href="/components/header-styles.css" rel="stylesheet">
    <link href="/components/article-styles.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600;900&family=JetBrains+Mono:wght@300;500&display=swap">
    <style>
        body { margin: 0; background: #fff; -webkit-font-smoothing: antialiased; }
    </style>
</head>
<body>
<div id="header-container"></div>
<script src="/components/header-loader.js"></script>
${body}
<div class="relative">
    <div id="footer-container"></div>
    <script src="/components/footer-loader.js"></script>
</div>
</body>
</html>`

function articlePage(post) {
  const title = escapeHtml(post.title)
  const description = escapeHtml(post.excerpt || post.title)
  const primarySlug = (post.slug === 'avzdax-welcomes-olabode-adegun-as-senior-strategic-advisor-national-security-and' || post.shortSlug === 'leadership')
    ? 'leadership'
    : (post.shortSlug || post.slug)
  const url = `${SITE}/news/${primarySlug}`
  const image = absolute(post.image) || `${SITE}/media/avzdax-logo.png`
  const bodyContent = (post.content || '').replace(/(?:<strong>|<b>)?(Predict\s*→\s*Prevent\s*→\s*Protect\.?)(?:<\/strong>|<\/b>)?/g, '<strong>$1</strong>')

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || undefined,
    image: image,
    datePublished: post.createdAt || post.updatedAt,
    dateModified: post.updatedAt || post.createdAt,
    mainEntityOfPage: url,
    author: { '@type': 'Organization', name: 'AVZDAX' },
    publisher: {
      '@type': 'Organization',
      name: 'AVZDAX',
      logo: { '@type': 'ImageObject', url: `${SITE}/media/avzdax-logo.png` }
    }
  }

  const head = `    <title>${title} | AVZDAX</title>
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${title} | AVZDAX" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title} | AVZDAX" />
    <meta name="twitter:description" content="${description}" />
    <script type="application/ld+json">${JSON.stringify(schema)}</script>`

  const hero = post.image
    ? `            <div class="article-hero"><img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}"></div>`
    : ''

  const body = `<main data-nav-theme="light" class="article-page">
    <div class="article-shell">
        <a href="/news" class="article-back" aria-label="Back to the newsroom" title="Back to the newsroom">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5"></path><path d="m11 6-6 6 6 6"></path></svg>
        </a>
        <h1 class="article-title">${post.headline || title}</h1>
        <div class="article-share">
            <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}" target="_blank" rel="noopener noreferrer" class="share-btn share-linkedin" aria-label="Share on LinkedIn" title="Share on LinkedIn">
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.2a1.64 1.64 0 0 0-1.64 1.63c0 .91.73 1.64 1.64 1.64s1.63-.73 1.63-1.64A1.64 1.64 0 0 0 7.83 6.2Z"/></svg>
                LinkedIn
            </a>
            <button type="button" class="share-btn" id="share-post">
                <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.6"></circle><circle cx="6" cy="12" r="2.6"></circle><circle cx="18" cy="19" r="2.6"></circle><path d="M8.4 10.8 15.6 6.9M8.4 13.2l7.2 3.9"></path></svg>
                Share
            </button>
            <button type="button" class="share-copy" id="copy-link" aria-label="Copy short link" title="Copy short link">
                <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15V6a2 2 0 0 1 2-2h9"></path></svg>
            </button>
            <span class="share-said" id="share-said" hidden></span>
        </div>
${hero}
        <div class="article-body">${bodyContent}</div>

        <div class="article-bottom-share">
            <div class="article-bottom-meta">
                <span class="share-tag">SHARE INTELLIGENCE</span>
                <p class="share-subtitle">Disseminate this announcement</p>
            </div>
            <div class="article-bottom-actions">
                <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}" target="_blank" rel="noopener noreferrer" class="share-btn share-linkedin-btn">
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.2a1.64 1.64 0 0 0-1.64 1.63c0 .91.73 1.64 1.64 1.64s1.63-.73 1.63-1.64A1.64 1.64 0 0 0 7.83 6.2Z"/></svg>
                    Share on LinkedIn
                </a>
                <button type="button" class="share-btn" id="copy-bottom-link">
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15V6a2 2 0 0 1 2-2h9"></path></svg>
                    <span id="copy-bottom-label">Copy Link</span>
                </button>
                <button type="button" class="share-btn" id="share-bottom-post">
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="18" cy="5" r="2.6"></circle><circle cx="6" cy="12" r="2.6"></circle><circle cx="18" cy="19" r="2.6"></circle><path d="M8.4 10.8 15.6 6.9M8.4 13.2l7.2 3.9"></path></svg>
                    Share
                </button>
            </div>
            <span class="share-said" id="share-bottom-said" hidden></span>
        </div>
    </div>
</main>
<script>
(function () {
    var link = '${url}'
    var said = document.getElementById('share-said')
    var bottomSaid = document.getElementById('share-bottom-said')
    var timer, bottomTimer

    function say(el, t, message) {
        if (!el) return
        el.textContent = message
        el.hidden = false
        clearTimeout(t)
        return setTimeout(function () { el.hidden = true }, 2600)
    }

    function copy(el, t) {
        if (!navigator.clipboard) return say(el, t, 'Copy: ' + link)
        navigator.clipboard.writeText(link).then(function () { say(el, t, 'Link copied') },
            function () { say(el, t, 'Could not copy') })
    }

    var shareTop = document.getElementById('share-post')
    if (shareTop) {
        shareTop.addEventListener('click', function () {
            if (!navigator.share) return copy(said, timer)
            navigator.share({ title: document.title, url: link }).catch(function () {})
        })
    }

    var copyTop = document.getElementById('copy-link')
    if (copyTop) {
        copyTop.addEventListener('click', function () { copy(said, timer) })
    }

    var shareBottom = document.getElementById('share-bottom-post')
    if (shareBottom) {
        shareBottom.addEventListener('click', function () {
            if (!navigator.share) return copy(bottomSaid, bottomTimer)
            navigator.share({ title: document.title, url: link }).catch(function () {})
        })
    }

    var copyBottom = document.getElementById('copy-bottom-link')
    if (copyBottom) {
        copyBottom.addEventListener('click', function () { copy(bottomSaid, bottomTimer) })
    }
})()
</script>`

  return page({ head, body })
}

const notFoundPage = () =>
  page({
    head: `    <title>Not found | AVZDAX</title>
    <meta name="robots" content="noindex" />`,
    body: `<main data-nav-theme="light" class="article-page">
    <div class="article-shell">
        <a href="/news" class="article-back" aria-label="Back to the newsroom" title="Back to the newsroom">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5"></path><path d="m11 6-6 6 6 6"></path></svg>
        </a>
        <h1 class="article-title">That entry is not here.</h1>
        <div class="article-body"><p>It may have been unpublished or the address mistyped.</p></div>
    </div>
</main>`
  })

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).send('Method Not Allowed')
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8')

  const slug = req.query.slug

  if (!isSafeSlug(slug)) {
    res.setHeader('Cache-Control', 'no-store')
    return res.status(404).send(notFoundPage())
  }

  try {
    const targetSlug = (slug === 'leadership' || slug === 'adegun')
      ? 'avzdax-welcomes-olabode-adegun-as-senior-strategic-advisor-national-security-and'
      : slug
    let post = await readPost(targetSlug)
    if (!post && !(await readIndex()).length) {
      post = bundledBySlug.get(targetSlug) || bundledBySlug.get(slug)
    }

    if (!post || post.status !== 'published' || post.kind !== 'article') {
      res.setHeader('Cache-Control', 'no-store')
      return res.status(404).send(notFoundPage())
    }

    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600')
    return res.status(200).send(articlePage(post))
  } catch (error) {
    console.error('Article render failed:', error.message)
    res.setHeader('Cache-Control', 'no-store')
    return res.status(500).send(notFoundPage())
  }
}
