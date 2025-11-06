import { NextResponse } from "next/server";
import { Client } from "pg";

export async function GET() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL not found" }, { status: 500 });
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const result = await client.query("SELECT NOW()");
    await client.end();
    return NextResponse.json({
      ok: true,
      connected: true,
      serverTime: result.rows[0].now,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        connected: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
