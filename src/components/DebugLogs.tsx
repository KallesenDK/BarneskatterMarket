'use client';

import { useEffect, useState } from 'react';

export default function DebugLogs() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Hent logs fra response headers
    const middlewareLogs = document.cookie
      .split('; ')
      .find(row => row.startsWith('x-middleware-logs='))
      ?.split('=')[1];

    if (middlewareLogs) {
      // Split på pipe og dekoder
      const decodedLogs = decodeURIComponent(middlewareLogs)
        .split('|')
        .map(log => {
          // Gør logs mere læsbare
          return log
            .replace(/_/g, ' ')
            .replace(/^([A-Z]+)/, (match) => 
              match.split('_').join(' ').toLowerCase()
            );
        });
      setLogs(decodedLogs);
    }
  }, []);

  if (logs.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg max-w-2xl max-h-[80vh] overflow-auto">
      <h3 className="text-lg font-bold mb-2">Debug Logs</h3>
      <pre className="text-xs whitespace-pre-wrap">
        {logs.join('\n')}
      </pre>
    </div>
  );
} 