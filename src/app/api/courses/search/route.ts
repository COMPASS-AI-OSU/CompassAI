import { createClient } from "@/lib/supabase/server";

const MAX_QUERY_LENGTH = 60;
const MAX_RESULTS = 20;

export interface CourseSearchResult {
  id: string;
  code: string | null;
  name: string | null;
  term: string | null;
  professor: string | null;
}

/**
 * Search published courses by code, name or professor (issue #11). Plain code, no AI.
 * Open to everyone, including logged-out visitors (roles table: "Search published courses").
 */
export async function GET(request: Request) {
  // Keep only characters a course code, name or professor needs. This also keeps commas
  // and parentheses out of the database filter below.
  const query = (new URL(request.url).searchParams.get("q") ?? "")
    .replace(/[^\p{L}\p{N} .&'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_QUERY_LENGTH);

  if (!query) {
    return Response.json({ courses: [] satisfies CourseSearchResult[] });
  }

  // Acts as the visitor, so row-level security applies. RLS also lets instructors read their
  // own drafts, so we ask for published courses explicitly: search never shows drafts.
  const supabase = await createClient();
  const pattern = `%${query}%`;
  const { data, error } = await supabase
    .from("courses")
    .select("id, code, name, term, professor")
    .eq("status", "published")
    .or(`code.ilike.${pattern},name.ilike.${pattern},professor.ilike.${pattern}`)
    .order("code", { ascending: true })
    .limit(MAX_RESULTS);

  if (error) {
    console.error("Course search failed:", error.message);
    return Response.json({ error: "Couldn't search courses right now." }, { status: 500 });
  }

  return Response.json({ courses: (data ?? []) as CourseSearchResult[] });
}
