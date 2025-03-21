const BASE_URL = "https://api.audius.co/v1";

export const searchMusic = async (query) => {
  try {
    const response = await fetch(`${BASE_URL}/tracks/search?query=${encodeURIComponent(query)}&app_name=MyMusicApp`);
    const data = await response.json();

    if (data && data.data) {
      return data.data.map((track) => ({
        id: track.id,
        title: track.title || "Título Desconhecido",
        author: track.user?.name || "Autor Desconhecido", // ✅ Corrigido: Verifica se `track.user` existe
        thumb: track.artwork?.["150x150"] || null, // ✅ Corrigido: Verifica se `track.artwork` existe
        mp3Url: track.stream_url || null, // ✅ Corrigido: Verifica se `track.stream_url` existe
      }));
    }
    return [];
  } catch (error) {
    console.error("Erro ao buscar músicas:", error);
    return [];
  }
};
