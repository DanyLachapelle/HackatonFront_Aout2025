import { useEffect, useState } from "react";
import { fileService } from "@/services/file-service";
import type { FileItem } from "@/types/file-types";

export default function FavoritesApp() {
    const [favoriteFiles, setFavoriteFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadFavorites = async () => {
            console.log("Début du chargement des favoris...");
            setLoading(true);
            setError(null);

            try {
                const favorites = await fileService.getFavoriteFiles();
                console.log("Favoris récupérés :", favorites);
                setFavoriteFiles(favorites);
            } catch (err) {
                console.error("Erreur lors du chargement des favoris :", err);
                setError("Erreur lors du chargement des favoris");
            } finally {
                setLoading(false);
                console.log("Fin du chargement des favoris, loading =", false);
            }
        };

        loadFavorites();
    }, []);

    if (loading) {
        console.log("Composant en chargement...");
        return <p>Chargement des favoris...</p>;
    }

    console.log("Rendering, favoriteFiles =", favoriteFiles);

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Mes Favoris</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {favoriteFiles.length === 0 ? (
                <p>Aucun favori pour le moment.</p>
            ) : (
                <ul>
                    {favoriteFiles.map(file => (
                        <li key={file.path}>{file.name}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}
