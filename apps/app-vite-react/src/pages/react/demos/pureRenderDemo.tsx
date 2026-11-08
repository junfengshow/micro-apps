export default function OrderTotal({
  prices = [12, 28, 16],
}: { prices?: number[] } = {}) {
  const total = prices.reduce((sum, price) => sum + price, 0);
  return <p>合计 ¥{total}</p>;
}
