# Troubleshooting Guide

## Common Issues and Solutions

### "Could not establish connection. Receiving end does not exist"

This error occurs when the extension popup tries to communicate with the content script, but the content script isn't available.

#### Causes:
1. **Invalid page type**: You're on a system page (chrome://, edge://, about:, etc.)
2. **Content script not loaded**: The page was opened before the extension was installed
3. **Page restrictions**: Some pages (like the Chrome Web Store) block content scripts

#### Solutions:

**For Users:**
1. **Refresh the page** - Press F5 or Ctrl+R (Cmd+R on Mac) to reload the page
2. **Navigate to a regular web page** - Make sure you're on an http:// or https:// page
3. **Avoid system pages** - The extension doesn't work on:
   - chrome:// pages (like chrome://extensions/)
   - edge:// pages
   - about: pages
   - Chrome Web Store pages
   - file:// pages

**For Developers:**
We've implemented several fixes:

1. **URL Validation**: The extension now checks if the page is a valid web page before attempting extraction
2. **Programmatic Injection**: If the content script isn't loaded, we attempt to inject it
3. **Better Error Messages**: Users get clear, actionable error messages
4. **Content Script Filtering**: Only inject on http:// and https:// pages

### "Claude API error: CORS..."

This was fixed by adding the required header. See the main README for details.

### "Please configure your Anthropic API key"

You need to:
1. Click the settings (⚙️) button in the extension popup
2. Enter your Anthropic API key (get one at https://console.anthropic.com/)
3. Click "Save"

### Extension Icon Not Showing

1. Make sure the extension is enabled in chrome://extensions/
2. You may need to pin the extension:
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "Event to Google Calendar"
   - Click the pin icon

### No Events Found

If the extension reports no events found:

1. **Check the page content**: Make sure the page actually contains event information
2. **Try a different page**: Some pages have event info in images or inaccessible formats
3. **Structured data helps**: Pages with schema.org Event markup work best
4. **Refresh and retry**: Sometimes a page refresh helps

### Google Calendar Integration Issues

If you can't add events to Google Calendar:

1. **Check OAuth setup**: Make sure you've configured your Google Cloud OAuth credentials
2. **Grant permissions**: When prompted, allow the extension to access your calendar
3. **Verify Client ID**: Check that the client ID in manifest.json is correct
4. **Revoke and re-authorize**: Visit https://myaccount.google.com/permissions and remove the extension, then try again

## Best Practices

### For Users:
- **Always refresh** the page after installing or updating the extension
- **Use regular web pages** (http:// or https://)
- **Check your API key** is entered correctly in settings

### For Developers:
- **Test on various page types** to ensure proper error handling
- **Check console logs** in the popup (right-click popup → Inspect)
- **Reload the extension** after code changes (chrome://extensions/ → reload button)
- **Monitor API quotas** for both Anthropic and Google

## Debugging Steps

1. **Open the popup DevTools**: Right-click the extension popup → Inspect
2. **Check the Console tab**: Look for error messages
3. **Check the background service worker**:
   - Go to chrome://extensions/
   - Find your extension
   - Click "service worker" link
   - Check console for errors
4. **Verify content script loaded**:
   - Open DevTools on the web page (F12)
   - Console tab should show: "Event Extractor content script loaded"

## Getting Help

If you encounter issues not covered here:

1. Check the browser console for detailed error messages
2. Verify all prerequisites are met (API keys, OAuth setup)
3. Try the extension on a simple test page first
4. Create an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Browser version
   - Page URL (if not sensitive)

## Feature Limitations

The extension currently:
- ✅ Works on regular web pages (http:// and https://)
- ✅ Extracts text-based event information
- ✅ Handles multiple events per page
- ❌ Cannot access chrome:// or other system pages
- ❌ Cannot extract events from images
- ❌ Cannot access pages before content script loads (refresh fixes this)
- ❌ May not work on heavily restricted pages (banking sites, etc.)
