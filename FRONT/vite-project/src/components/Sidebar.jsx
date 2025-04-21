import { useState, useEffect } from "react";
import axios from "axios";

const Sidebar = ({ onLoadConfig, showSidebar }) => {
  const [configs, setConfigs] = useState([]);


  const fetchConfigs = async () => {
    const res = await axios.get("http://192.168.1.141:8000/list_configs");
    setConfigs(res.data);
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  
  const handleLoad = async (name) => {
    const res = await axios.get(
      `http://192.168.1.141:8000/load_config/${name}`
    );
    onLoadConfig(name, res.data);
  };

  const deleteConfig = async (configName) => {
    try {
      const response = await fetch(
        `http://localhost:8000/delete_config/${configName}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        console.log(`Configuration ${configName} supprimée avec succès.`);
        // Rafraîchir la liste des configurations après la suppression
        fetchConfigs();
      } else {
        const data = await response.json();
        console.error(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Erreur de réseau ou de serveur", error);
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
      <ul>
        {configs.map((name) => (
          <li key={name} className="px-4 py-2 border-b hover:bg-slate-200 ">
            {name}
            <button
              onClick={() => handleLoad(name)}
              className="ml-2 bg-blue-500 text-white px-2 py-1 rounded cursor-pointer"
            >
              Charger
            </button>

            <button
              onClick={() => deleteConfig(name)}
              className="ml-2 bg-red-500 text-white px-2 py-1 rounded cursor-pointer"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
