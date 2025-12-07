// src/app/page.js
import PokedexClient from "../components/PokedexClient";

// This function runs on the SERVER before the page is sent to the browser
async function getInitialPokemon() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20&offset=0");
  const data = await res.json();

  // We need to fetch the details (images/types) on the server too
  const detailedPromises = data.results.map(async (p) => {
    const r = await fetch(p.url);
    return r.json();
  });

  return Promise.all(detailedPromises);
}

export default async function Home() {
  // 1. Fetch data on Server
  const initialData = await getInitialPokemon();

  // 2. Pass data to the Client Component
  return (
    <main>
      <PokedexClient initialPokemon={initialData} />
    </main>
  );
}