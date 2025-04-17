import { useState, useEffect } from "react";
import axios from "axios";

const Sidebar = ({ onLoadConfig, showSidebar }) => {
  const [configs, setConfigs] = useState([]);


  const fetchConfigs = async () => {
    const res = await axios.get("http://10.116.130.43:8000/list_configs");
    setConfigs(res.data);
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleLoad = async (name) => {
    const res = await axios.get(
      `http://10.116.130.43:8000/load_config/${name}`
    );
    onLoadConfig(name, res.data);
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-white shadow-lg z-50 transition-transform duration-300 ${
        showSidebar ? "translate-x-0" : "-translate-x-full"
      } w-64`}
    >
      <button
        className="absolute top-2 right-2 text-xl"
        onClick={() => setVisible(false)}
      >
        ×
      </button>
      <h2 className="text-lg font-bold p-4">Configurations enregistrées</h2>
      <ul>
        {configs.map((name) => (
          <li
            key={name}
            className="px-4 py-2 border-b hover:bg-slate-200 cursor-pointer"
            onClick={() => handleLoad(name)}
          >
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
