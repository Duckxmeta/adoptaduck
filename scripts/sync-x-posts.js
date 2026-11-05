// Feature removed: X session cookie / headless scraping for #Adoptaduck posts.
// Manual bulletin updates via the admin portal continue to work.
// This file is retained as a stub to avoid breaking any residual references.

console.log('X sync feature has been removed for simplicity. Use admin portal for updates.');

module.exports = {
  syncPostPayload: async () => {
    console.warn('syncPostPayload is disabled.');
    return null;
  },
  getXCookieHeader: () => ''
};
