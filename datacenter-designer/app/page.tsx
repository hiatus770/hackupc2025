"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { DatacenterStyle } from '@/types/datacenter';
import styles from '@/components/datacenter-designer.module.css';

// Define the datacenter interface based on the API response
interface Datacenter {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  style_id: string;
}

interface DatacenterResponse {
  total: number;
  datacenters: Datacenter[];
}

export default function SelectStylePage() {
  const [stylesList, setStylesList] = useState<DatacenterStyle[]>([]);
  const [datacenters, setDatacenters] = useState<Datacenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch datacenter styles
        const stylesResponse = await fetch('/api/datacenter-styles');
        if (!stylesResponse.ok) {
          throw new Error(`Failed to fetch styles: ${stylesResponse.statusText}`);
        }
        const stylesData: DatacenterStyle[] = await stylesResponse.json();
        setStylesList(stylesData);

        // Fetch datacenters
        try {
          //const datacentersResponse = await fetch('http://localhost:3000/api/datacenters-styles');
          const datacentersResponse = await fetch('http://localhost:8000/datacenters');
          if (!datacentersResponse.ok) {
            const errorText = await datacentersResponse.text();
            console.error('Error response:', errorText);
            throw new Error(`Failed to fetch datacenters: ${datacentersResponse.status} ${datacentersResponse.statusText}`);
          }
          const datacentersData = await datacentersResponse.json();
          setDatacenters(datacentersData.datacenters);
        } catch (err) {
          console.error('Fetch error details:', err);
          setError(err instanceof Error ? err.message : 'An unknown error occurred');
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-[#011627] text-white">
      <h1 className="text-3xl font-bold mb-8">
        {datacenters.length < 1 ? 'Select Datacenter Style' : 'Your Datacenters'}
      </h1>

      {loading && <p>Loading data...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <>
          {/* Horizontal Datacenter Cards */}
          <div className="w-full mb-10">
            <div className="relative">
              <div className="overflow-x-auto pb-4 flex space-x-4">
                {datacenters.length > 0 ? (
                  datacenters.map((datacenter) => (
                    <Link
                      key={datacenter.id}
                      href={`/datacenter/${encodeURIComponent(datacenter.id)}`}
                      className="flex-shrink-0 w-64 p-4 rounded-lg border border-[#0e3e7b] bg-[#012456] hover:bg-[#0a2d5e] transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-white truncate">{datacenter.name}</h3>
                      <p className="text-sm text-[#a3be8c] mb-2 h-12 overflow-hidden">{datacenter.description}</p>
                      <div className="flex justify-between text-xs text-[#88c0d0]">
                        <span>Created: {formatDate(datacenter.created_at)}</span>
                        <span>Style: {datacenter.style_id}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="w-full text-center py-6">
                    <p>No datacenters found. Create one to get started!</p>
                    <button className="mt-2 px-4 py-2 bg-[#0e3e7b] hover:bg-[#1a5aab] rounded-md">
                      Create New Datacenter
                    </button>
                  </div>
                )}
              </div>
              {/* Gradient fade effect for scrolling indicator */}
              {datacenters.length > 3 && (
                <div className="absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#011627] to-transparent pointer-events-none"></div>
              )}
            </div>
          </div>

          {/* Datacenter Style Grid */}
          <h2 className="text-2xl font-semibold mb-4">Create New Datacenter</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Custom Card */}
            <button
              className="block p-6 rounded-lg border-2 border-dashed border-[#3a7ca5] bg-[#011845] hover:bg-[#0a2d5e] transition-colors text-left w-full h-full"
              onClick={() => router.push("/designer/custom")}
              type="button"
            >
              <h2 className="text-xl font-semibold mb-2 text-[#3a7ca5]">Custom</h2>
              <p className="text-sm text-[#a3be8c]">Describe your ideal datacenter and generate a custom style using AI.</p>
            </button>
            {/* Standard Styles */}
            {stylesList.length > 0 ? (
              stylesList.map((style) => (
                <Link
                  key={style.id}
                  href={`/designer/${encodeURIComponent(style.id)}`}
                  className={`block p-6 rounded-lg border border-[#0e3e7b] bg-[#012456] hover:bg-[#0a2d5e] transition-colors ${styles.cardLink}`}
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
        </>
      )}
    </main>
  );
}
