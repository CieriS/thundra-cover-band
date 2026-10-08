import type { APIRoute, GetStaticPaths } from 'astro';
import { listFlyerFiles, type FlyerFile } from '@/lib/flyers';

/**
 * Every flyer is a static file made at build time: one sheet per date in A4 (image and PDF)
 * and Instagram format, its link preview and thumbnail, the tour poster and the two promos.
 */
export const getStaticPaths: GetStaticPaths = async () =>
  (await listFlyerFiles(new URL(import.meta.env.SITE ?? 'http://localhost'))).map((file) => ({
    params: { file: file.name },
    props: { file },
  }));

export const GET: APIRoute<{ file: FlyerFile }> = async ({ props }) =>
  new Response(Buffer.from(await props.file.build()), { headers: { 'Content-Type': props.file.type } });
