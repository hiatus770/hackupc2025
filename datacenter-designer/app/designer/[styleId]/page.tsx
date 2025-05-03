import DatacenterDesigner from '@/components/datacenter-designer';
import type { DatacenterStyle } from '@/types/datacenter';
import { notFound } from 'next/navigation'; // Import notFound

// Helper function to fetch styles (could be moved to a lib/api file)
async function getDatacenterStyles(): Promise<DatacenterStyle[]> {
    // Assuming your API is running at the same origin
    // Use absolute URL if running elsewhere or during build time if needed
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/datacenter-styles`, { cache: 'no-store' }); // Fetch fresh data
    if (!res.ok) {
        throw new Error('Failed to fetch datacenter styles');
    }
    return res.json();
}

interface DesignerPageProps {
    params: {
        styleId: string;
    };
}

// This is a Server Component by default
export default async function DesignerPage({ params }: DesignerPageProps) {
    const { styleId } = params;
    let selectedStyle: DatacenterStyle | undefined;
    let error: string | null = null;

    try {
        const styles = await getDatacenterStyles();
        selectedStyle = styles.find(style => style.id === decodeURIComponent(styleId));
    } catch (err) {
        console.error("Error fetching style data:", err);
        error = err instanceof Error ? err.message : "Failed to load style data";
    }

    if (error) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-[#011627] text-white">
                <h1 className="text-red-500">Error loading designer</h1>
                <p>{error}</p>
            </main>
        );
    }

    if (!selectedStyle) {
        notFound(); // Use Next.js notFound helper
    }

    return (
        <main className="flex min-h-screen flex-col">
            {/* Pass the required style info as props */}
            <DatacenterDesigner
                styleId={selectedStyle.id}
                styleData={selectedStyle} 
            />
        </main>
    );
}