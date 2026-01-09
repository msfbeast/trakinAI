
import { getTools } from "@/lib/data";
import ClientHome from "@/components/ClientHome";

export const dynamic = 'force-dynamic'; // Ensure we always fetch fresh data on refresh

export default async function Home() {
  const tools = await getTools();
  return <ClientHome initialTools={tools} />;
}
