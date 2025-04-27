import { useEffect, useState } from "react";
import {
  fetchConfigs,
  loadConfig,
  deleteConfig,
  EcraserConfig,
  addConfig,
  cheminImage,
} from "@utils/apiConfig";


const Sidebar = ({
  onLoadConfig,
  showSidebar,
  image,
  setConfigImageUrl,
  nodes,
  setNodes,
  edges,
  setEdges,
  selectedFile,
  setSelectedFile,
}) => {
  const [configs, setConfigs] = useState([]);
  const [newConfigName, setNewConfigName] = useState(""); // Etat pour le nom de la nouvelle config
  const [newConfigData, setNewConfigData] = useState(""); // Etat pour les données de la nouvelle config

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchConfigs();
      setConfigs(data);
    };
    fetchData();
  }, []);

  const handleLoadClick = async (name) => {
    const data = await loadConfig(name);

    onLoadConfig(name, data);
    if (data.graph.graph.Nodes.length != 0) {
      setNodes(data.graph.graph.Nodes); // Mettre à jour les nœuds
    }
    if (data.graph.graph.Edges.length != 0) {
      setEdges(data.graph.graph.Edges); // Mettre à jour les arêtes
    }

    setConfigImageUrl(cheminImage(data.image)); // Mettre à jour l'URL de l'image de la config
    setSelectedFile(null)

  };

  const handleDeleteClick = async (name) => {
    const success = await deleteConfig(name);
    if (success) {
      const updated = await fetchConfigs();
      setConfigs(updated);
    }
  };

  const handleEcraserClick = async (name) => {
    const data = await loadConfig(name);


    EcraserConfig(name, data, selectedFile, setSelectedFile,nodes, edges ); // <- ici on passe les vrais fichiers
  };

  const handleAddConfig = async () => {
    if (newConfigName) {
      const success = await addConfig(newConfigName, newConfigData); // Fonction à implémenter côté serveur
      if (success) {
        const updated = await fetchConfigs();
        setConfigs(updated);
        setNewConfigName(""); // Réinitialiser le champ du nom
        setNewConfigData(""); // Réinitialiser le champ des données
      }
    } else {
      alert("Le nom et les données sont nécessaires !");
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-transform duration-300 ${
        showSidebar ? "translate-x-0" : "-translate-x-full"
      } w-64`}
    >
      <h2 className="text-lg font-bold p-4 pt-14">
        Configurations enregistrées
      </h2>

      {/* Formulaire d'ajout d'une nouvelle config */}
      <div className="px-4 py-2 border-b">
        <h3 className="font-semibold">Ajouter une nouvelle config</h3>
        <input
          type="text"
          placeholder="Nom de la config"
          value={newConfigName}
          onChange={(e) => setNewConfigName(e.target.value)}
          className="mt-2 w-full p-2 border border-gray-300 rounded"
        />
        <button
          onClick={handleAddConfig}
          className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
        >
          Ajouter
        </button>
      </div>

      <ul>
        {configs.map((name) => (
          <li key={name} className="px-4 py-2 border-b hover:bg-slate-200">
            {name}
            <button
              onClick={() => handleLoadClick(name)}
              className="ml-2 cursor-pointer bg-blue-500 text-white px-2 py-1 rounded"
            >
              Charger
            </button>
            <button
              onClick={() => handleDeleteClick(name)}
              className="ml-2 cursor-pointer bg-red-500 text-white px-2 py-1 rounded"
            >
              Supprimer
            </button>
            <button
              onClick={() => handleEcraserClick(name)}
              className="ml-2 cursor-pointer bg-purple-500 text-white px-2 py-1 rounded"
            >
              Ecraser
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
