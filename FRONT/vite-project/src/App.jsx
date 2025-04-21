import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Sidebar from "@components/Sidebar"; // nouveau composant

import DisplayGraph from "@components/Graph.jsx"; // Import the Graph component


const E5x = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null); // Reference to the file input element
   const [showSidebar, setShowSidebar] = useState(false);

const [configImageUrl, setConfigImageUrl] = useState(null);

  const [configs, setConfigs] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState(null);

  useEffect(() => {
    // Récupérer les configurations depuis le backend
    const fetchConfigs = async () => {
      try {
        const res = await axios.get("http://10.116.130.43:8000/list_configs");
        setConfigs(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des configurations :", error);
      }
    };

    fetchConfigs();
  }, []);

  // Fonction pour gérer la sélection d'une configuration
  const handleConfigSelect = (configName) => {
    setSelectedConfig(configName);
    console.log("Configuration sélectionnée :", configName);
    // Tu peux appeler la fonction pour charger la configuration à partir du backend
    loadConfig(configName);
  };


  const sommet = () => {
    console.log("Ajouter un sommet");
    // Logique pour ajouter un sommet
  };
  const arrette = () => {
    console.log("Ajouter une arrete");
    // Logique pour ajouter une arrete
  };

  const loadConfig = async (configName) => {
    try {
      const res = await axios.get(`http://10.116.130.43:8000/load_config/${configName}`);
      console.log("Configuration chargée :", res.data);
      // Traiter la configuration reçue ici
    } catch (error) {
      console.error("Erreur lors du chargement de la configuration :", error);
    }
  };
  
  const updateFile = (e) => {
    setSelectedFiles(e.target.files);
    console.log(e.target.files);
  };





  const sendFiles = async () => {
    if ("vibrate" in navigator) {
      navigator.vibrate([100]);
    }
    try {
      const formData = new FormData();
      Array.from(selectedFiles).forEach((file) => {
        formData.append("files", file);
      });

      const res = await axios.post(
        "http://10.116.130.43:8000/upload_image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res) {
        console.log(res);
      }
    } catch (error) {
      console.log(error);
    }
    setSelectedFiles([]);
  };

  return (
    <div className="relative">
      <Sidebar
        showSidebar={showSidebar}
        onLoadConfig={(name, data) => {
          setSelectedConfig(name);
          console.log("Configuration sélectionnée :", name);
          // ✅ met à jour le fond de carte ici
          if (data.image) {
            const imageUrl = `http://10.116.130.43:8000/image/${data.image}`;
            setConfigImageUrl(imageUrl);
          }
          // ✅ met à jour les points, arêtes, etc. ici
          // Exemple : setNodes(data.nodes); setEdges(data.edges); (à adapter à ton code)
        }}
      />
      <button
        className="fixed top-4 left-4 z-50 bg-slate-600 text-white px-4 py-2 rounded"
        onClick={() => setShowSidebar((s) => !s)}
      >
        {showSidebar ? "Fermer" : "Configurations"}
      </button>

      <div className="flex flex-col">
        <button
          className="bg-black rounded-xl p-4 m-2 inline-block   px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white  transition duration-150 ease-in-out   focus:bg-slate-500 focus:shadow-black focus:outline-none focus:ring-0 active:bg-slate-600 active:shadow-black motion-reduce:transition-none dark:shadow-black/30"
          onClick={sommet}
        >
          placer les sommets du graphe/ ville a visiter
        </button>{" "}
        <button
          className="bg-blue-400 rounded-xl p-4 m-2 inline-block   px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white  transition duration-150 ease-in-out   focus:bg-slate-500 focus:shadow-black focus:outline-none focus:ring-0 active:bg-slate-600 active:shadow-black motion-reduce:transition-none dark:shadow-black/30"
          onClick={arrette}
        >
          creéer une arette/relier deux ville par une route
        </button>
        <div className="h-[500px] relative border border-slate-400 rounded-xl overflow-hidden shadow-lg">
          {(selectedFiles.length > 0 || configImageUrl) && (
            <img
              className="absolute inset-0 w-full h-full object-contain z-0"
              src={
                selectedFiles.length > 0
                  ? URL.createObjectURL(selectedFiles[0])
                  : configImageUrl
              }
              alt="Image de fond"
            />
          )}
          <div className="absolute inset-0 z-10">
            <DisplayGraph
              backgroundImage={
                selectedFiles.length > 0
                  ? URL.createObjectURL(selectedFiles[0])
                  : configImageUrl
              }
            />
          </div>
        </div>
        <div className="z-30 pt-14 m-auto">
          <input
            type="file"
            multiple
            accept="image/*" // Restrict to image files
            onChange={updateFile}
            ref={fileInputRef}
            style={{ display: "none" }} // Hide the file input element
          />
          <button
            className="plus-button"
            onClick={() => fileInputRef.current.click()} // Trigger the file input click
          >
            <p className=" text-2xl">
              cliquez pour selectionner le fond de carte
            </p>
          </button>
        </div>
        <button
          className="z-30 bg-slate-400 rounded-xl p-4 m-2 inline-block   px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white  transition duration-150 ease-in-out   focus:bg-slate-500 focus:shadow-black focus:outline-none focus:ring-0 active:bg-slate-600 active:shadow-black motion-reduce:transition-none dark:shadow-black/30"
          onClick={sendFiles}
        >
          Envoyer les fichiers
        </button>
      </div>
    </div>
  );
};

export default E5x;
