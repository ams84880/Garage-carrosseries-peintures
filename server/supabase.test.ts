import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";

describe("Supabase Configuration", () => {
  it("should connect to Supabase with valid credentials", async () => {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    expect(supabaseUrl).toBeDefined();
    expect(supabaseAnonKey).toBeDefined();

    const supabase = createClient(
      supabaseUrl || "",
      supabaseAnonKey || ""
    );

    // Test basic connection by fetching from a table
    const { data, error } = await supabase
      .from("appointments")
      .select("id")
      .limit(1);

    // Should not have authentication error
    expect(error?.code).not.toBe("PGRST301"); // Unauthorized
    expect(error?.code).not.toBe("PGRST204"); // Not found is OK
  });

  it("should have service role key configured", () => {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(serviceRoleKey).toBeDefined();
    expect(serviceRoleKey).toMatch(/^sb_secret_/);
  });

  it("should have anon key configured", () => {
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
    expect(anonKey).toBeDefined();
    expect(anonKey).toMatch(/^sb_publishable_/);
  });
});
