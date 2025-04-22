import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Sidebar from "@components/Sidebar"; // nouveau composant

import DisplayGraph from "@components/Graph.jsx"; // Import the Graph component



import {
  fetchConfigs,
  loadConfig,
  getImageUrl,
  uploadGraph,
  uploadImage,
} from "@utils/api";
import { toggleMode } from "@utils/graphModes";
import { handleFileUpdate } from "@utils/fileUtils";



const E5x = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null); // Reference to the file input element
  const [showSidebar, setShowSidebar] = useState(false);
  const [imageRatio, setImageRatio] = useState(0.8625); // par défaut 16/9

  const [configImageUrl, setConfigImageUrl] = useState(null);

  const [selectedConfig, setSelectedConfig] = useState("default");
  const [mode, setMode] = useState(null); // null = aucun mode, "sommet" ou "arrette"

  const [backgroundImageUrl, setBackgroundImageUrl] = useState(null);


  const updateFile = (e) => {
    const file = e.target.files[0] || null;
    setSelectedFile(file);
    console.log("Image sélectionnée raw", file);
    console.log("Image sélectionnée : envoyee", selectedFile);
  };



  
  return (
    <div className="relative ">
      <Sidebar
        showSidebar={showSidebar}
        onLoadConfig={(name, data) => {
          setSelectedConfig(name);
          console.log("Configuration sélectionnée :", name);
          console.log("Données de la configuration :", data);
          // Assurez-vous que l'image est dans les données de la configuration
          // ✅ met à jour le fond de carte ici

          // ✅ met à jour les points, arêtes, etc. ici
          // Exemple : setNodes(data.nodes); setEdges(data.edges); (à adapter à ton code)
        }}
        setConfigImageUrl={setConfigImageUrl} // Passer la fonction pour mettre à jour l'URL de l'image
        nodes={nodes} // Passer les nœuds
        setNodes={setNodes} // Passer la fonction pour mettre à jour les nœuds
        edges={edges} // Passer les arêtes
        setEdges={setEdges} // Passer la fonction pour mettre à jour les arêtes
        selectedFile={selectedFile} // Passer les fichiers sélectionnés
        setSelectedFile={setSelectedFile} // Passer la fonction pour mettre à jour les fichiers sélectionnés
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
            onClick={() => toggleMode(mode, setMode, "sommet")}
          >
            Placer les sommets du graphe / ville à visiter
          </button>

          <button
            className={`${
              mode === "supprimerSommet" ? "bg-red-500" : "bg-red-400"
            } rounded-xl p-4 m-2 inline-block px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white transition duration-150 ease-in-out  focus:shadow-black focus:outline-none focus:ring-0 cursor-pointer  active:shadow-black motion-reduce:transition-none dark:shadow-black/30`}
            onClick={() => toggleMode(mode, setMode, "supprimerSommet")}
          >
            Supprimer des sommets
          </button>

          <button
            className={`${
              mode === "arrette" ? "bg-blue-500" : "bg-blue-400"
            } rounded-xl p-4 m-2 inline-block px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white transition duration-150 ease-in-out  focus:shadow-black focus:outline-none focus:ring-0 cursor-pointer  active:shadow-black motion-reduce:transition-none dark:shadow-black/30`}
            onClick={() => toggleMode(mode, setMode, "arrette")}
          >
            Créer une arête / relier deux villes par une route
          </button>

          <button
            className={`${
              mode === "supprimerArrete" ? "bg-orange-500" : "bg-orange-400"
            } rounded-xl p-4 m-2 inline-block px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white transition duration-150 ease-in-out  focus:shadow-black focus:outline-none focus:ring-0 cursor-pointer  active:shadow-black motion-reduce:transition-none dark:shadow-black/30`}
            onClick={() => toggleMode(mode, setMode, "supprimerArrete")}
          >
            Supprimer une arête
          </button>

          <button
            className={`${
              mode === "supprimerArrete" ? "bg-purple-500" : "bg-purple-400"
            } col-span-2 rounded-xl p-4 m-2 inline-block px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white transition duration-150 ease-in-out  focus:shadow-black focus:outline-none focus:ring-0 cursor-pointer  active:shadow-black motion-reduce:transition-none dark:shadow-black/30`}
            onClick={() => toggleMode(mode, setMode, "selectionDepot")}
          >
            selectionner le depot
          </button>
        </div>

        <div
          className="relative border border-slate-400 rounded-xl overflow-hidden shadow-lg w-full"
          style={{ height: `${imageRatio * 100}vw` }} // ou utilise un wrapper responsive
        >
          {(selectedFile || configImageUrl) && (
            <img
              className="absolute inset-0 w-full h-full object-contain z-0"
              src={
                selectedFile
                  ? URL.createObjectURL(selectedFile)
                  : configImageUrl
              }
              alt="Image de fond"
            />
          )}
          <div className="absolute inset-0 z-10">
            <DisplayGraph
              mode={mode} // On passe le mode directement
              config={selectedConfig}
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
            accept="image/*"
            onChange={updateFile}
            ref={fileInputRef}
            style={{ display: "none" }}
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
      </div>
    </div>
  );
};

export default E5x;


        // <button
        //   className="z-30 bg-slate-400 rounded-xl p-4 m-2 inline-block   px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white  transition duration-150 ease-in-out   focus:bg-slate-500 focus:shadow-black focus:outline-none focus:ring-0 active:bg-slate-600 active:shadow-black motion-reduce:transition-none dark:shadow-black/30"
        //   onClick={() => uploadImage(selectedConfig, selectedFiles)}
        // >
        //   Envoyer l'image
        // </button>

        // <button
        //   className="z-30 bg-slate-400 rounded-xl p-4 m-2 inline-block   px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white  transition duration-150 ease-in-out   focus:bg-slate-500 focus:shadow-black focus:outline-none focus:ring-0 active:bg-slate-600 active:shadow-black motion-reduce:transition-none dark:shadow-black/30"
        //   onClick={() => uploadGraph(selectedConfig, nodes, edges)}
        // >
        //   Envoyer le graphe
        // </button>