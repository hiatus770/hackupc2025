// import DatacenterDesigner from "@/components/datacenter-designer"

// export default function Home() {
//   return (
//     <main className="flex min-h-screen flex-col">
//       <DatacenterDesigner />
//     </main>
//   )
// }

"use client" // Add this because we're using hooks (useState, useEffect)

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { DatacenterStyle } from '@/types/datacenter';
import styles from '@/components/datacenter-designer.module.css'; // Reuse styles for consistency

export default function SelectStylePage() {
  const [stylesList, setStylesList] = useState<DatacenterStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStyles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/datacenter-styles');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch styles: ${response.statusText}`);
        }
        const data: DatacenterStyle[] = await response.json();
        console.log(data); 
        setStylesList(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStyles();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-[#011627] text-white">
      <h1 className="text-3xl font-bold mb-8">Select Datacenter Style</h1>

      {loading && <p>Loading styles...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stylesList.length > 0 ? (
            stylesList.map((style) => (
              <Link
                key={style.id}
                href={`/designer/${encodeURIComponent(style.id)}`}
                className={`block p-6 rounded-lg border border-[#0e3e7b] bg-[#012456] hover:bg-[#0a2d5e] transition-colors ${styles.cardLink}`} // Added cardLink class for potential styling
              >
                <h2 className="text-xl font-semibold mb-2">{style.name}</h2>
                {style.dim[0] !== -1 && <p className="text-sm text-[#88c0d0] mb-1">
                  Grid Size: {style.dim[0]}m x {style.dim[1]}m
                </p>}
                <p className="text-sm text-[#a3be8c]">{style.description}</p>
              </Link>
            ))
          ) : (
            <p>No datacenter styles found.</p>
          )}
        </div>
      )}
    </main>
  );
}

// Optional: Add some basic CSS to datacenter-designer.module.css if needed
/*
.cardLink {
  text-decoration: none;
  color: inherit;
}
*/
