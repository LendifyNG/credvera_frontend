import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';

// Renders a page to HTML at build time (scripts/prerender.mjs), so search
// engines, AI assistants and link previews get the page's words without
// running JavaScript. In the browser the app then starts as usual (main.tsx).

export { headTags, indexablePaths, lastModified, metaFor, SITE_URL } from './lib/seo';

export function render(url: string) {
  return renderToString(
    <StrictMode>
      <QueryClientProvider client={new QueryClient()}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </QueryClientProvider>
    </StrictMode>,
  );
}
