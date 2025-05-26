import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol')?.toLowerCase();
  const supply = parseFloat(searchParams.get('supply') || '0');

  if (!symbol || !supply) {
    return new NextResponse('Missing parameters', { status: 400 });
  }

  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`);
    const data = await res.json();

    const similarToken = data.find((token: any) => token.symbol.toLowerCase() === symbol);
    if (!similarToken) {
      return new NextResponse('Token not found in top 100', { status: 404 });
    }

    const targetMarketCap = similarToken.market_cap;
    const fairPrice = targetMarketCap / supply;

    const html = `<!DOCTYPE html>
<html>
  <head>
    <meta property="og:title" content="Fair Price Estimation" />
    <meta property="og:description" content="Estimated fair price for ${symbol.toUpperCase()} is $${fairPrice.toFixed(6)}" />
    <meta property="og:image" content="https://dummyimage.com/600x400/000/fff&text=${symbol.toUpperCase()}+Fair+Price" />
    <meta name="fc:frame" content="vNext" />
    <meta name="fc:frame:image" content="https://dummyimage.com/600x400/000/fff&text=${symbol.toUpperCase()}+Fair+Price" />
    <meta name="fc:frame:button:1" content="Recalculate" />
    <meta name="fc:frame:button:1:action" content="post" />
  </head>
  <body>
    <h1>Estimated fair price: $${fairPrice.toFixed(6)}</h1>
  </body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html'
      }
    });

  } catch (error) {
    return new NextResponse('Error fetching data', { status: 500 });
  }
}
