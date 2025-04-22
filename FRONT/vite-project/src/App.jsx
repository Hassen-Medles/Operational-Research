import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Sidebar from "@components/Sidebar"; // nouveau composant

import DisplayGraph from "@components/Graph.jsx"; // Import the Graph component



import {
  fetchConfigs,
  loadConfig,
  getImageUrl,
  uploadGraph,
  uploadFiles,
  uploadImage,
} from "@utils/api";
import { toggleMode } from "@utils/graphModes";
import { handleFileUpdate } from "@utils/fileUtils";



const E5x = () => {
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null); // Reference to the file input element
  const [showSidebar, setShowSidebar] = useState(false);
  const [imageRatio, setImageRatio] = useState(0.8625); // par défaut 16/9

  const [configImageUrl, setConfigImageUrl] = useState(null);

  const [configs, setConfigs] = useState([]);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [mode, setMode] = useState(null); // null = aucun mode, "sommet" ou "arrette"

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
      formData.append("graph", JSON.stringify({ Node: nodes, Edges: edges }));
      console.log("FormData:", formData);
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
    <div className="relative ">
      <Sidebar
        showSidebar={showSidebar}
        onLoadConfig={(name, data) => {
          setSelectedConfig(name);
          console.log("Configuration sélectionnée :", name);
          console.log("Données de la configuration :", data);
          // ✅ met à jour le fond de carte ici
          if (data.image) {
            const imageUrl = `http://192.168.1.141:8000/image/${data.image}`;
            setConfigImageUrl(imageUrl);
          }
          if (data.graph) {
            setNodes(data.graph.Node || []);
            setEdges(data.graph.Edges || []);
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
        <div className="grid grid-cols-2 gap-4">
          <button
            className={`${
              mode === "sommet" ? "bg-green-500" : "bg-green-400"
            } rounded-xl p-4 m-2 inline-block px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white transition duration-150 ease-in-out  focus:shadow-black focus:outline-none focus:ring-0 cursor-pointer  active:shadow-black motion-reduce:transition-none dark:shadow-black/30`}
            onClick={() => setMode("supprimerSommet")}
          >
            Placer les sommets du graphe / ville à visiter
          </button>

          <button
            className={`${
              mode === "supprimerSommet" ? "bg-red-500" : "bg-red-400"
            } rounded-xl p-4 m-2 inline-block px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white transition duration-150 ease-in-out  focus:shadow-black focus:outline-none focus:ring-0 cursor-pointer  active:shadow-black motion-reduce:transition-none dark:shadow-black/30`}
            onClick={() => setMode("supprimerSommet")}
          >
            Supprimer des sommets
          </button>

          <button
            className={`${
              mode === "arrette" ? "bg-blue-500" : "bg-blue-400"
            } rounded-xl p-4 m-2 inline-block px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white transition duration-150 ease-in-out  focus:shadow-black focus:outline-none focus:ring-0 cursor-pointer  active:shadow-black motion-reduce:transition-none dark:shadow-black/30`}
            onClick={() => setMode("arrette")}
          >
            Créer une arête / relier deux villes par une route
          </button>

          <button
            className={`${
              mode === "supprimerArrete" ? "bg-orange-500" : "bg-orange-400"
            } rounded-xl p-4 m-2 inline-block px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white transition duration-150 ease-in-out  focus:shadow-black focus:outline-none focus:ring-0 cursor-pointer  active:shadow-black motion-reduce:transition-none dark:shadow-black/30`}
            onClick={() => setMode("supprimerArrete")}
          >
            Supprimer une arête
          </button>
        </div>

        <div
          className="relative border border-slate-400 rounded-xl overflow-hidden shadow-lg w-full"
          style={{ height: `${imageRatio * 100}vw` }} // ou utilise un wrapper responsive
        >
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
              mode={mode} // On passe le mode directement
              backgroundImage={
                selectedFiles.length > 0
                  ? URL.createObjectURL(selectedFiles[0])
                  : configImageUrl
              }
              edges={edges}
              nodes={nodes}
              setEdges={setEdges}
              setNodes={setNodes}
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
            <p className="z-30 bg-yellow-800 rounded-xl p-4 m-2 inline-block   px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white  transition duration-150 ease-in-out   focus:bg-slate-500 focus:shadow-black focus:outline-none focus:ring-0 active:bg-slate-600 active:shadow-black motion-reduce:transition-none dark:shadow-black/30">
              cliquez pour selectionner le fond de carte
            </p>
          </button>
        </div>
        <button
          className="z-30 bg-slate-400 rounded-xl p-4 m-2 inline-block   px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white  transition duration-150 ease-in-out   focus:bg-slate-500 focus:shadow-black focus:outline-none focus:ring-0 active:bg-slate-600 active:shadow-black motion-reduce:transition-none dark:shadow-black/30"
          onClick={uploadImage(selectedConfig, selectedFiles)}


        >
          Envoyer l'image
        </button>

        <button
          className="z-30 bg-slate-400 rounded-xl p-4 m-2 inline-block   px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white  transition duration-150 ease-in-out   focus:bg-slate-500 focus:shadow-black focus:outline-none focus:ring-0 active:bg-slate-600 active:shadow-black motion-reduce:transition-none dark:shadow-black/30"
          onClick={uploadGraph(selectedConfig, nodes, edges)}
        >
          Envoyer le graphe
        </button>
      </div>
    </div>
  );
};

export default E5x;
