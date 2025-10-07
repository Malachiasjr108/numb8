
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { db } from "@/lib/firebase-client";
import { doc, getDoc } from "firebase/firestore";

export default function EchoPage() {
  const params = useParams();
  const echoId = params?.id as string;
  const [imageData, setImageData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!echoId) return;

    // Fetch from Firestore
    const fetchEchoImage = async () => {
      try {
        const docRef = doc(db, "echoImages", echoId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Get signed URL from API
          const response = await fetch(`/api/echoes/${echoId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cloudStoragePath: data.cloudStoragePath }),
          });

          if (response.ok) {
            const urlData = await response.json();
            setImageData({
              imageUrl: urlData.imageUrl,
              uploadedAt: data.uploadedAt,
              hasImage: true,
            });
          }
        }
      } catch (error) {
        console.error("Error loading echo image:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEchoImage();
  }, [echoId]);

  // Determine which type based on echo number
  let echoType = "Portal";
  if (parseInt(echoId) > 800 && parseInt(echoId) <= 880) {
    echoType = "Circle";
  } else if (parseInt(echoId) > 880) {
    echoType = "Infinite";
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <a
          href="/"
          className="inline-block mb-8 text-[#00ccff] hover:text-[#a55cff] transition-colors"
        >
          ⟵ Back to Home
        </a>

        <div className="bg-gradient-to-br from-[#1a1a3e] to-[#0f0f2e] p-8 rounded-2xl border-2 border-[#00ccff] shadow-[0_0_30px_rgba(0,204,255,0.3)] mb-8">
          <h1 className="text-4xl font-bold text-[#00ccff] drop-shadow-[0_0_20px_#00ccff] mb-2">
            Echo #{echoId}
          </h1>
          <p className="text-[#a55cff] text-lg">The {echoType} Collection</p>
        </div>

        {loading ? (
          <div className="bg-[#1e1e3f] p-12 rounded-xl text-center text-[#00ccff]">
            Loading Echo...
          </div>
        ) : imageData?.hasImage ? (
          <div className="mb-8">
            <div className="relative w-full aspect-square max-w-2xl mx-auto rounded-2xl overflow-hidden border-2 border-[#00ccff] shadow-[0_0_40px_rgba(0,204,255,0.6)]">
              <Image
                src={imageData.imageUrl}
                alt={`Echo ${echoId}`}
                fill
                className="object-cover"
                priority
              />
            </div>
            <p className="text-center text-gray-400 mt-4 text-sm">
              Uploaded: {imageData.uploadedAt ? new Date(imageData.uploadedAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        ) : (
          <div className="bg-[#1e1e3f] p-12 rounded-xl text-center mb-8">
            <p className="text-gray-400 text-lg">
              No image uploaded for this Echo yet.
            </p>
            <p className="text-[#a55cff] text-sm mt-2">
              Upload from the admin dashboard to display it here.
            </p>
          </div>
        )}

        <div className="bg-gradient-to-br from-[#1a1a3e] to-[#0f0f2e] p-8 rounded-2xl border-2 border-[#a55cff]">
          <h2 className="text-2xl font-bold text-[#a55cff] mb-4">Echo Points – The {echoType}</h2>
          
          <div className="space-y-4 text-gray-300">
            <p>
              Within The {echoType}, Echo Points measure your journey. Collect Echoes, complete quests,
              and join the community to ascend through the cosmic realms.
            </p>

            <div className="mt-6">
              <h3 className="text-xl text-[#00ccff] mb-3">Missions</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Buy a {echoType} NFT → +100 ✦</li>
                <li>Hold {echoType} NFT for 30 days → +50 ✦</li>
                <li>Participate in Discord → +20 ✦</li>
                <li>Complete weekly quests → +80 ✦</li>
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="text-xl text-[#00ccff] mb-3">Benefits</h3>
              <ul className="space-y-2 list-disc list-inside">
                <li>Exclusive access to community events</li>
                <li>Discounts on limited edition prints</li>
                <li>Status as Echo Seeker</li>
                <li>Voting rights in governance</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          {parseInt(echoId) > 1 && (
            <a
              href={`/echo/${parseInt(echoId) - 1}`}
              className="bg-gradient-to-r from-[#00ccff] to-[#a55cff] px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform"
            >
              ← Previous Echo
            </a>
          )}
          {parseInt(echoId) < 888 && (
            <a
              href={`/echo/${parseInt(echoId) + 1}`}
              className="bg-gradient-to-r from-[#00ccff] to-[#a55cff] px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform ml-auto"
            >
              Next Echo →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
