"use client";

import { useState, useEffect } from "react";
import DatacenterDesigner from '@/components/datacenter-designer';
import type { DatacenterStyle } from '@/types/datacenter';
import { notFound } from 'next/navigation';

async function getDatacenterStyles(): Promise<DatacenterStyle[]> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/datacenter-styles`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch datacenter styles');
    return res.json();
}

async function generate_custom(prompt: string) {
    const res = await fetch('/api/generate-custom-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error('Failed to generate style');
    const style = await res.json();
    console.log("Generated style:", style);
    return style;
}

export default function DesignerPage({ params }: { params: { styleId: string } }) {
    const { styleId } = params;
    const [customPrompt, setCustomPrompt] = useState('');
    const [showPrompt, setShowPrompt] = useState(styleId === "custom");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedStyle, setSelectedStyle] = useState<DatacenterStyle | null>(null);

    console.log("STYLE JSON:", selectedStyle);  

    // Handle custom prompt submission
    const handleCustomSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const style = await generate_custom(customPrompt);
            setSelectedStyle(style);
            setShowPrompt(false);
        } catch (err: any) {
            setError(err.message || "Failed to generate custom style");
        } finally {
            setLoading(false);
        }
    };

    // Fetch style if not custom
    useEffect(() => {
        if (styleId !== "custom") {
            setLoading(true);
            setError(null);
            getDatacenterStyles()
                .then(styles => {
                    const found = styles.find(style => style.id === decodeURIComponent(styleId));
                    if (!found) {
                        setError("Style not found");
                    } else {
                        setSelectedStyle(found);
                    }
                })
                .catch(err => setError(err.message || "Failed to load style data"))
                .finally(() => setLoading(false));
        }
    }, [styleId]);

    if (error) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-[#011627] text-white">
                <h1 className="text-red-500">Error loading designer</h1>
                <p>{error}</p>
            </main>
        );
    }

    if (showPrompt) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-[#011627] text-white">
                <form
                    onSubmit={handleCustomSubmit}
                    className="bg-[#012456] p-8 rounded-xl shadow-lg flex flex-col gap-4 min-w-[320px] max-w-[90vw]"
                >
                    <h2 className="text-xl font-bold mb-2 text-[#3a7ca5]">Describe Your Custom Datacenter</h2>
                    <textarea
                        className="p-2 rounded bg-[#011627] border border-[#0e3e7b] text-white resize-none"
                        rows={4}
                        value={customPrompt}
                        onChange={e => setCustomPrompt(e.target.value)}
                        required
                        placeholder="Describe your datacenter requirements..."
                        disabled={loading}
                    />
                    {error && <div className="text-red-400">{error}</div>}
                    <div className="flex gap-3 justify-end">
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-[#3a7ca5] hover:bg-[#1a5aab] font-semibold"
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'Generate'}
                        </button>
                    </div>
                </form>
            </main>
        );
    }

    if (!selectedStyle) {
        return null; // or loading spinner
    }

    return (
        <main className="flex min-h-screen flex-col">
            <DatacenterDesigner
                styleId={selectedStyle.id}
                styleData={selectedStyle}
            />
        </main>
    );
}