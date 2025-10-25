// Content script to extract page HTML and send it to the background script

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractPageHTML') {
    try {
      // Get the page HTML
      const pageHTML = document.documentElement.outerHTML;

      // Get the page title
      const pageTitle = document.title;

      // Get the URL
      const pageURL = window.location.href;

      // Get visible text content (cleaner extraction)
      const visibleText = extractVisibleText();

      // Get meta information
      const metaInfo = extractMetaInfo();

      sendResponse({
        success: true,
        data: {
          html: pageHTML,
          title: pageTitle,
          url: pageURL,
          visibleText: visibleText,
          metaInfo: metaInfo
        }
      });
    } catch (error) {
      sendResponse({
        success: false,
        error: error.message
      });
    }
    return true; // Keep the message channel open for async response
  }
});

/**
 * Extract visible text from the page, excluding scripts, styles, and hidden elements
 */
function extractVisibleText() {
  // Clone the body to avoid modifying the actual page
  const clone = document.body.cloneNode(true);

  // Remove script and style elements
  const scripts = clone.querySelectorAll('script, style, noscript');
  scripts.forEach(el => el.remove());

  // Remove hidden elements
  const allElements = clone.querySelectorAll('*');
  allElements.forEach(el => {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') {
      el.remove();
    }
  });

  // Get text content and clean it up
  let text = clone.textContent || '';

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();

  // Limit to reasonable size (100KB)
  if (text.length > 100000) {
    text = text.substring(0, 100000) + '... [truncated]';
  }

  return text;
}

/**
 * Extract meta information from the page
 */
function extractMetaInfo() {
  const metaInfo = {
    description: '',
    keywords: '',
    author: '',
    ogTitle: '',
    ogDescription: '',
    eventSchema: []
  };

  // Get meta tags
  const metaTags = document.querySelectorAll('meta');
  metaTags.forEach(tag => {
    const name = tag.getAttribute('name') || tag.getAttribute('property');
    const content = tag.getAttribute('content');

    if (name && content) {
      switch (name.toLowerCase()) {
        case 'description':
          metaInfo.description = content;
          break;
        case 'keywords':
          metaInfo.keywords = content;
          break;
        case 'author':
          metaInfo.author = content;
          break;
        case 'og:title':
          metaInfo.ogTitle = content;
          break;
        case 'og:description':
          metaInfo.ogDescription = content;
          break;
      }
    }
  });

  // Look for JSON-LD event schema
  const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
  jsonLdScripts.forEach(script => {
    try {
      const data = JSON.parse(script.textContent);
      if (data['@type'] === 'Event' || (Array.isArray(data) && data.some(item => item['@type'] === 'Event'))) {
        metaInfo.eventSchema.push(data);
      }
    } catch (e) {
      // Ignore parsing errors
    }
  });

  return metaInfo;
}

// Signal that the content script is loaded
console.log('Event Extractor content script loaded');
