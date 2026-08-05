import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const incoming = await headers();
  const host = incoming.get("x-forwarded-host") ?? incoming.get("host") ?? "localhost:3000";
  const protocol = incoming.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    title: "United Trivia — Spin for Glory",
    description: "Spin through six Manchester United categories and answer ten questions correctly to lift the trophy.",
    openGraph: {
      title: "United Trivia — Spin for Glory",
      description: "Six categories. Ten questions. One perfect run.",
      type: "website",
      url: origin,
      images: [`${origin}/og.png`],
    },
    twitter: {
      card: "summary_large_image",
      title: "United Trivia — Spin for Glory",
      description: "Six categories. Ten questions. One perfect run.",
      images: [`${origin}/og.png`],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
