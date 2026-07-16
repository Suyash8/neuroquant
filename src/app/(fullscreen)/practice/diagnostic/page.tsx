import { createClient } from "@/utils/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import DiagnosticClient from "./DiagnosticClient";
import { withPerf } from "@/lib/perf";

export default async function DiagnosticPage(props: {
  searchParams: Promise<{ persona?: string; horizon?: string; source?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const { data: { user } } = await withPerf("Supabase Auth (getUser)", () => supabase.auth.getUser());

  if (!user) {
    redirect("/login");
  }

  const persona = searchParams.persona || null;
  const horizon = searchParams.horizon || null;
  const source = searchParams.source || null;

  return (
    <div className="w-full flex-1 min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-foreground">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center">
        <DiagnosticClient 
          persona={persona} 
          horizon={horizon} 
          source={source}
        />
      </div>
    </div>
  );
}
