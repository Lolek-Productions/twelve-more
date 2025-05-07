import { NextResponse } from 'next/server';

export async function POST(req) {
  // Only import Mux in server-side context
  const { MUX_TOKEN_ID, MUX_TOKEN_SECRET } = process.env;
  if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
    return NextResponse.json({ error: 'Missing Mux credentials' }, { status: 500 });
  }

  const Mux = (await import('@mux/mux-node')).default;
  const mux = new Mux(MUX_TOKEN_ID, MUX_TOKEN_SECRET);

  try {
    const upload = await mux.video.uploads.create({
      new_asset_settings: { playback_policy: 'public' },
      cors_origin: '*',
    });
    return NextResponse.json({
      url: upload.url,
      id: upload.id,
      status: upload.status,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
