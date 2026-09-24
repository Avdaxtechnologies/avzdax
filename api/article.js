const { readPost, readIndex } = require('./_lib/store')
const { isSafeSlug, normalizeParagraphs } = require('./_lib/content')

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
    <link href="/components/article-styles.css" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@200;400;600;800;900&family=JetBrains+Mono:wght@300;500&display=swap">
    <style>
        body { margin: 0; background: #fff; -webkit-font-smoothing: antialiased; }
    </style>
</head>
<body>
${body}
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
  let ogImage = image
  if (primarySlug === 'leadership' || post.slug.includes('adegun') || post.slug.includes('olabode')) {
    ogImage = `${SITE}/media/olabode-adegun.jpg`
  } else if (ogImage.endsWith('.webp')) {
    ogImage = `${SITE}/media/avzdax-logo.png`
  }
  const isJpg = ogImage.endsWith('.jpg') || ogImage.endsWith('.jpeg')
  const isPng = ogImage.endsWith('.png')
  const ogImageType = isJpg ? 'image/jpeg' : isPng ? 'image/png' : 'image/jpeg'
  const ogWidth = (primarySlug === 'leadership' || post.slug.includes('adegun')) ? '549' : '1200'
  const ogHeight = (primarySlug === 'leadership' || post.slug.includes('adegun')) ? '490' : '630'

  const bodyContent = normalizeParagraphs(post.content || '')

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || undefined,
    image: ogImage,
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
    <meta property="og:site_name" content="AVZDAX" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${title} | AVZDAX" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${escapeHtml(ogImage)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(ogImage)}" />
    <meta property="og:image:type" content="${ogImageType}" />
    <meta property="og:image:width" content="${ogWidth}" />
    <meta property="og:image:height" content="${ogHeight}" />
    <meta property="og:image:alt" content="${title}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@AVZDAX" />
    <meta name="twitter:title" content="${title} | AVZDAX" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
    <script type="application/ld+json">${JSON.stringify(schema)}</script>`

  const hero = post.image
    ? `        <div class="r-hero-image"><img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}"></div>`
    : ''

  const body = `
    <div class="reader-nav-fixed">
        <a href="/news" class="reader-back-btn" aria-label="Back to newsroom">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            BACK
        </a>
    </div>
    <div class="reader-container">
${hero}
        <div class="r-header">
            <h1 class="r-title">${post.headline || title}</h1>
        </div>
        <div class="r-content-grid">
            <div class="r-main-text">
                <div class="r-body">${bodyContent}</div>
                <div class="r-share-bottom">
                    <div class="r-share-actions">
                        <button type="button" class="r-share-btn r-share-copy" data-url="${url}" aria-label="Copy Link" id="copy-bottom-link">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15V6a2 2 0 0 1 2-2h9"></path></svg>
                            <span class="copy-label" id="copy-bottom-label">Copy Link</span>
                        </button>
                        <button type="button" class="r-share-btn r-share-native" data-url="${url}" data-title="${title}" aria-label="Share" id="share-bottom-post">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="2.6"></circle><circle cx="6" cy="12" r="2.6"></circle><circle cx="18" cy="19" r="2.6"></circle><path d="M8.4 10.8 15.6 6.9M8.4 13.2l7.2 3.9"></path></svg>
                            <span id="share-bottom-label">Share</span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="r-side-meta"></div>
        </div>
    </div>
<script>
(function () {
    var link = '${url}'
    var copyLabel = document.getElementById('copy-bottom-label')
    var shareLabel = document.getElementById('share-bottom-label')
    var copyTimer, shareTimer

    function copy() {
        if (!navigator.clipboard) {
            prompt('Copy link:', link)
            return
        }
        navigator.clipboard.writeText(link).then(function () {
            if (copyLabel) {
                copyLabel.textContent = 'Copied!'
                clearTimeout(copyTimer)
                copyTimer = setTimeout(function () { copyLabel.textContent = 'Copy Link' }, 2200)
            }
        }, function () {
            prompt('Copy link:', link)
        })
    }

    var shareBottom = document.getElementById('share-bottom-post')
    if (shareBottom) {
        shareBottom.addEventListener('click', function () {
            if (navigator.share) {
                navigator.share({ title: document.title, url: link }).catch(function () {})
            } else {
                navigator.clipboard.writeText(link).then(function () {
                    if (shareLabel) {
                        shareLabel.textContent = 'Copied!'
                        clearTimeout(shareTimer)
                        shareTimer = setTimeout(function () { shareLabel.textContent = 'Share' }, 2200)
                    }
                }, function () {
                    prompt('Copy link:', link)
                })
            }
        })
    }

    var copyBottom = document.getElementById('copy-bottom-link')
    if (copyBottom) {
        copyBottom.addEventListener('click', copy)
    }
})()
</script>`

  return page({ head, body })
}

const notFoundPage = () =>
  page({
    head: `    <title>Not found | AVZDAX</title>
    <meta name="robots" content="noindex" />`,
    body: `
    <div class="reader-nav-fixed">
        <a href="/news" class="reader-back-btn" aria-label="Back to newsroom">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            BACK
        </a>
    </div>
    <div class="reader-container">
        <div class="r-header">
            <h1 class="r-title">That entry is not here.</h1>
        </div>
        <div class="r-body"><p>It may have been unpublished or the address mistyped.</p></div>
    </div>`
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
