/**
 * Simple price fetching service.
 * Uses CoinGecko free API (no key needed) to get current prices.
 * Falls back to a mock if the API is unreachable.
 */

const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BC: "bitcoin-cash",
};

const priceCache: Record<string, { price: number; ts: number }> = {};
const CACHE_TTL = 15_000; // 15 seconds

export async function getPrice(symbol: string): Promise<number> {
  const key = symbol.toUpperCase();
  const cached = priceCache[key];
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.price;

  const cgId = COINGECKO_IDS[key];
  if (!cgId) throw new Error(`Unknown symbol: ${symbol}`);

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${cgId}&vs_currencies=usd`
    );
    if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
    const json = await res.json();
    const price = json[cgId]?.usd;
    if (typeof price !== "number") throw new Error("No price in response");
    priceCache[key] = { price, ts: Date.now() };
    return price;
  } catch (err) {
    // return cached even if stale, or throw
    if (cached) return cached.price;
    throw err;
  }
}
