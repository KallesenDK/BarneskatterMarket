"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

export default function ThankYouPage() {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    // Hent thank you content fra site_settings
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase
      .from("site_settings")
      .select("value")
      .eq("key", "thank_you_content")
      .single()
      .then(({ data }) => {
        setContent(data?.value || null);
      });
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col justify-center items-center bg-white rounded shadow p-8 mx-auto max-w-xl mt-16">
      {content ? (
        <div className="prose prose-lg mb-8" dangerouslySetInnerHTML={{ __html: content }} />
      ) : (
        <>
          <h1 className="text-3xl font-bold text-green-600 mb-4">Tak for din ordre!</h1>
          <p className="mb-6 text-lg text-gray-700">Din betaling er gennemført og vi har modtaget din bestilling.<br />Du modtager en ordrebekræftelse på e-mail.</p>
        </>
      )}
      <Link href="/" className="text-primary font-semibold underline">Til forsiden</Link>
    </div>
  );
}
