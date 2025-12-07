"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "firebase/auth";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyCVriJV3fkWwYPPfhjTvIzebxAs-9KCmHY",
    authDomain: "pokedex-auth-7b0d2.firebaseapp.com",
    projectId: "pokedex-auth-7b0d2",
    storageBucket: "pokedex-auth-7b0d2.firebasestorage.app",
    messagingSenderId: "741396894834",
    appId: "1:741396894834:web:e04312c22823ff588e1eeb",
    measurementId: "G-CS6ETZXERD"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// --- STYLING HELPERS (Gradients & Colors) ---
const getTypeStyles = (type) => {
    const styles = {
        fire: { bg: 'bg-orange-500', gradient: 'from-orange-400 to-red-500' },
        water: { bg: 'bg-blue-500', gradient: 'from-blue-400 to-blue-600' },
        grass: { bg: 'bg-green-500', gradient: 'from-green-400 to-emerald-600' },
        electric: { bg: 'bg-yellow-400', gradient: 'from-yellow-300 to-yellow-500' },
        psychic: { bg: 'bg-pink-500', gradient: 'from-pink-400 to-rose-500' },
        ice: { bg: 'bg-cyan-300', gradient: 'from-cyan-300 to-blue-400' },
        dragon: { bg: 'bg-indigo-600', gradient: 'from-indigo-500 to-purple-700' },
        dark: { bg: 'bg-gray-800', gradient: 'from-gray-700 to-gray-900' },
        fairy: { bg: 'bg-pink-300', gradient: 'from-pink-300 to-rose-400' },
        normal: { bg: 'bg-gray-400', gradient: 'from-gray-300 to-gray-500' },
        fighting: { bg: 'bg-red-700', gradient: 'from-red-600 to-red-800' },
        flying: { bg: 'bg-indigo-400', gradient: 'from-indigo-300 to-blue-500' },
        poison: { bg: 'bg-purple-500', gradient: 'from-purple-400 to-purple-600' },
        ground: { bg: 'bg-yellow-600', gradient: 'from-yellow-600 to-orange-700' },
        rock: { bg: 'bg-yellow-800', gradient: 'from-yellow-700 to-orange-800' },
        bug: { bg: 'bg-lime-500', gradient: 'from-lime-400 to-green-600' },
        ghost: { bg: 'bg-purple-700', gradient: 'from-purple-600 to-indigo-800' },
        steel: { bg: 'bg-gray-400', gradient: 'from-gray-300 to-blue-200' },
    };
    return styles[type] || { bg: 'bg-gray-400', gradient: 'from-gray-300 to-gray-500' };
};

// --- STAT BAR COMPONENT ---
const StatBar = ({ label, value, max = 255 }) => (
    <div className="flex items-center text-xs mb-2">
        <span className="w-16 font-bold text-gray-500 uppercase">{label}</span>
        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden ml-2">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(value / max) * 100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-blue-500 rounded-full"
            />
        </div>
        <span className="w-8 text-right font-bold text-gray-700">{value}</span>
    </div>
);

// --- MODAL COMPONENT (Updated with Stats & Blur) ---
const PokemonModal = ({ pokemon, onClose, isFavorite, toggleFavorite }) => {
    if (!pokemon) return null;
    const typeStyle = getTypeStyles(pokemon.types[0].type.name);

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
                >
                    {/* Header */}
                    <div className={`h-40 bg-linear-to-br ${typeStyle.gradient} relative`}>
                        <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-48 h-48">
                            <img
                                src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                                alt={pokemon.name}
                                className="w-full h-full object-contain drop-shadow-xl"
                            />
                        </div>
                    </div>

                    <div className="pt-20 px-8 pb-8">
                        <div className="text-center mb-6">
                            <h2 className="text-4xl font-extrabold capitalize text-gray-800 mb-2">{pokemon.name}</h2>
                            <div className="flex justify-center gap-2">
                                {pokemon.types.map((t) => (
                                    <span key={t.type.name} className={`px-4 py-1 text-white text-sm font-bold rounded-full ${getTypeStyles(t.type.name).bg} shadow-sm uppercase text-[10px] tracking-wider`}>
                                        {t.type.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Base Stats</h3>
                            <StatBar label="HP" value={pokemon.stats?.find(s => s.stat.name === 'hp')?.base_stat || 0} />
                            <StatBar label="ATK" value={pokemon.stats?.find(s => s.stat.name === 'attack')?.base_stat || 0} />
                            <StatBar label="DEF" value={pokemon.stats?.find(s => s.stat.name === 'defense')?.base_stat || 0} />
                            <StatBar label="SPD" value={pokemon.stats?.find(s => s.stat.name === 'speed')?.base_stat || 0} />
                        </div>

                        <button
                            onClick={() => toggleFavorite(pokemon)}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2 ${isFavorite
                                ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200'
                                : 'bg-gray-900 text-white hover:bg-black'
                                }`}
                        >
                            <span>{isFavorite ? '★ Remove from Team' : '☆ Add to Team'}</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// --- MAIN CLIENT COMPONENT ---
export default function PokedexClient({ initialPokemon }) {
    const [user, setUser] = useState(null);

    // Data State
    const [pokemonList, setPokemonList] = useState(initialPokemon || []);
    const [loading, setLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("");
    const [selectedPokemon, setSelectedPokemon] = useState(null);
    const [favorites, setFavorites] = useState([]);

    const allTypes = ["fire", "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fairy", "normal", "fighting", "flying", "poison", "ground", "rock", "bug", "ghost", "steel"];

    // Auth & Storage Effects
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const saved = localStorage.getItem("favorites");
        if (saved) setFavorites(JSON.parse(saved));
    }, []);

    useEffect(() => {
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }, [favorites]);

    // --- LIVE SEARCH (DEBOUNCED) & FILTER LOGIC ---
    useEffect(() => {
        if (!user) return;

        // We use a timeout to wait for the user to stop typing (Debounce)
        const delayDebounceFn = setTimeout(async () => {
            setLoading(true);
            try {
                if (searchTerm) {
                    // Live Search Mode (API Call)
                    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`);
                    if (!res.ok) throw new Error("Not found");
                    const data = await res.json();
                    setPokemonList([data]);
                } else if (selectedType) {
                    // Filter Mode
                    const res = await fetch(`https://pokeapi.co/api/v2/type/${selectedType}`);
                    const data = await res.json();
                    const sliced = data.pokemon.slice(offset, offset + 20).map(p => p.pokemon);

                    // Fetch details
                    const detailed = await Promise.all(sliced.map(async p => (await fetch(p.url)).json()));
                    setPokemonList(detailed);
                } else {
                    // Default Mode
                    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`);
                    const data = await res.json();

                    // Fetch details
                    const detailed = await Promise.all(data.results.map(async p => (await fetch(p.url)).json()));
                    setPokemonList(detailed);
                }
            } catch (err) {
                setPokemonList([]);
            } finally {
                setLoading(false);
            }
        }, 500); // 500ms delay

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedType, offset, user]);


    const toggleFavorite = (pokemon) => {
        if (favorites.some(f => f.id === pokemon.id)) {
            setFavorites(favorites.filter(f => f.id !== pokemon.id));
        } else {
            // SAVE STATS HERE to prevent crash
            setFavorites([...favorites, {
                id: pokemon.id, name: pokemon.name, types: pokemon.types, sprites: pokemon.sprites, stats: pokemon.stats
            }]);
        }
    };

    // --- LOGIN SCREEN ---
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4 font-sans">
                <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-md w-full">
                    <div className="w-24 h-24 mx-auto bg-red-500 rounded-full mb-6 border-8 border-gray-100 shadow-inner flex items-center justify-center">
                        <div className="w-8 h-8 bg-white rounded-full border-4 border-gray-200"></div>
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-800 mb-2">Pokédex</h1>
                    <p className="text-gray-400 mb-8">Begin your adventure.</p>
                    <button onClick={() => signInWithPopup(auth, provider)} className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-black transition">
                        Login with Google
                    </button>
                </div>
            </div>
        );
    }

    // --- APP VIEW ---
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

            <div className="max-w-7xl mx-auto relative z-10">

                {/* Header */}
                <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Pokédex</h1>
                        <p className="text-gray-500 mt-2 font-medium">Find and track your favorite Pokémon.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm border border-gray-100 pr-6">
                        {user.photoURL && <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full" />}
                        <div className="text-sm">
                            <p className="font-bold text-gray-900">{user.displayName}</p>
                            <button onClick={() => signOut(auth)} className="text-red-500 text-xs hover:underline">Sign Out</button>
                        </div>
                    </div>
                </header>

                {/* --- CONTROLS (Live Search & Visual Filter) --- */}
                <div className="space-y-6 mb-12">
                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto md:mx-0">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search Pokémon by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white border-none rounded-2xl shadow-sm ring-1 ring-gray-100 focus:ring-2 focus:ring-blue-500 focus:shadow-md transition text-lg"
                        />
                    </div>

                    {/* Type Filter (Horizontal Scroll) */}
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                        <button
                            onClick={() => { setSelectedType(""); setOffset(0); }}
                            className={`whitespace-nowrap px-6 py-2 rounded-full font-bold transition-all ${!selectedType ? 'bg-gray-900 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                        >
                            All
                        </button>
                        {allTypes.map(type => {
                            const style = getTypeStyles(type);
                            const isActive = selectedType === type;
                            return (
                                <button
                                    key={type}
                                    onClick={() => { setSelectedType(type); setOffset(0); }}
                                    className={`whitespace-nowrap px-6 py-2 rounded-full font-bold transition-all capitalize ${isActive ? `${style.bg} text-white shadow-lg` : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {type}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* --- FAVORITES DOCK --- */}
                {favorites.length > 0 && (
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">My Team <span className="text-gray-400 text-sm ml-2">({favorites.length})</span></h3>
                            <span className="text-xs text-gray-400 uppercase tracking-wide">Hover to remove</span>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex gap-6 overflow-x-auto min-h-[120px] items-center">
                            {favorites.map(fav => (
                                <motion.div
                                    key={fav.id}
                                    whileHover={{ scale: 1.1, y: -5 }}
                                    className="relative group cursor-pointer shrink-0"
                                    onClick={() => setSelectedPokemon(fav)}
                                >
                                    {/* Remove Button */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleFavorite(fav); }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-10"
                                    >
                                        ×
                                    </button>
                                    <div className={`w-20 h-20 rounded-2xl ${getTypeStyles(fav.types[0].type.name).bg} flex items-center justify-center shadow-lg relative overflow-hidden`}>
                                        <div className="absolute inset-0 bg-white opacity-20 rounded-full scale-150 translate-x-4 translate-y-4"></div>
                                        <img src={fav.sprites.front_default} className="w-16 h-16 relative z-10" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- HERO GRID --- */}
                {loading ? <div className="text-center py-20 opacity-50">Loading Pokémon data...</div> : (
                    <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {pokemonList.length > 0 ? pokemonList.map((p) => {
                            const typeData = getTypeStyles(p.types[0].type.name);
                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ y: -10, transition: { duration: 0.2 } }}
                                    key={p.id}
                                    onClick={() => setSelectedPokemon(p)}
                                    className={`bg-linear-to-br ${typeData.gradient} rounded-3xl p-6 cursor-pointer shadow-sm hover:shadow-2xl transition-all relative overflow-hidden group border border-white`}
                                >
                                    {/* Decorative Background Blob */}
                                    <div className={`absolute -right-8 -bottom-8 w-40 h-40 ${typeData.bg} opacity-20 rounded-full group-hover:scale-110 transition-transform duration-500`}></div>

                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-2xl font-extrabold text-white capitalize leading-none drop-shadow-sm">{p.name}</h3>
                                            <p className="text-sm font-bold text-white mt-1 opacity-80">#{String(p.id).padStart(3, '0')}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col gap-2">
                                            {p.types.map(t => (
                                                <span key={t.type.name} className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold text-white capitalize border border-white/20">
                                                    {t.type.name}
                                                </span>
                                            ))}
                                        </div>
                                        <img
                                            src={p.sprites.front_default}
                                            alt={p.name}
                                            className="w-32 h-32 -mr-4 drop-shadow-md group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                </motion.div>
                            )
                        }) : (
                            <div className="col-span-full text-center py-20">
                                <p className="text-xl text-gray-400 font-bold">No Pokémon found.</p>
                                <button onClick={() => { setSearchTerm(""); setSelectedType(""); }} className="text-blue-500 mt-2 underline">Clear Search</button>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Pagination (Hide during search) */}
                {!searchTerm && pokemonList.length > 0 && (
                    <div className="flex justify-center items-center mt-16 gap-6">
                        <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - 20))} className="px-8 py-3 bg-white text-gray-900 font-bold rounded-full shadow-lg disabled:opacity-50 hover:bg-gray-50 transition">Previous</button>
                        <button onClick={() => setOffset(offset + 20)} className="px-8 py-3 bg-gray-900 text-white font-bold rounded-full shadow-lg hover:bg-black transition">Next Page</button>
                    </div>
                )}

                {selectedPokemon && (
                    <PokemonModal pokemon={selectedPokemon} onClose={() => setSelectedPokemon(null)} isFavorite={favorites.some((f) => f.id === selectedPokemon.id)} toggleFavorite={toggleFavorite} />
                )}
            </div>
        </div>
    );
}