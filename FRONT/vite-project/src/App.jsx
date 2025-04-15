import { useState, useRef } from "react";
import axios from "axios";

import image from "@assets/tour.webp";


const E5x = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null); // Reference to the file input element

  const updateFile = (e) => {
    setSelectedFiles(e.target.files);
    console.log(e.target.files);
  };



  const sommet = async () => {

  }



  const arrette = async () => {
  }

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
        "http://10.116.130.43:5173/upload",
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
      <div className="h-96">
        <img src={image}></img>



      </div>
      <div className="m-auto">
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
          <p className=" text-2xl">
            {selectedFiles.length} fichiers sélectionnés
          </p>
        </button>
      </div>
      <button
        className="bg-slate-400 rounded-xl p-4 m-2 inline-block   px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white  transition duration-150 ease-in-out   focus:bg-slate-500 focus:shadow-black focus:outline-none focus:ring-0 active:bg-slate-600 active:shadow-black motion-reduce:transition-none dark:shadow-black/30"
        onClick={sendFiles}
      >
        Envoyer les fichiers
      </button>
    </div>
  );
};

export default E5x;
