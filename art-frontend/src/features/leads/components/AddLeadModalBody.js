import React, { useState } from "react";
import { useDispatch } from "react-redux";
import InputText from "../../../components/Input/InputText";
import ErrorText from "../../../components/Typography/ErrorText";
import { showNotification } from "../../common/headerSlice";
import imageCompression from "browser-image-compression";
import { useAddPaintingsMutation } from  '../../../utils/apiSlice';
import { ArrowPathIcon } from "@heroicons/react/24/outline";
const INITIAL_PAINTING_OBJ = {
  painter_name: "",
  painting_name: "",
  base_height: "",
  height: "",
  width: "",
  weight: "",
  microcontroller:"",
  photo: null, // Photo file
};

function AddPaintingModalBody({ closeModal }) {
  const dispatch = useDispatch();
  const [errorMessage, setErrorMessage] = useState("");
  const [paintingObj, setPaintingObj] = useState(INITIAL_PAINTING_OBJ);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [addPainting,{data,isLoading,isSuccess}] = useAddPaintingsMutation()

  const saveNewPainting = async () => {
    if (paintingObj.painting_name.trim() === "") {
      return setErrorMessage("Painting Name is required!");
    } else if (paintingObj.base_height === "") {
      return setErrorMessage("Base Height is required!");
    } else if (paintingObj.height === "") {
      return setErrorMessage("Height is required!");
    } else if (paintingObj.width === "") {
      return setErrorMessage("Width is required!");
    }
    else if (paintingObj.weight === "") {
      return setErrorMessage("weight is required!");
    }
    

    const newPaintingObj = {
      name: paintingObj.painting_name,
      base_height: paintingObj.base_height,
      height: paintingObj.height,
      width: paintingObj.width,
      painter_name: paintingObj.painter_name,
      photo: paintingObj.photo,
      weight:paintingObj.weight,
      microcontroller: paintingObj.microcontroller,
    };

    setLoading(true);
    try {
     const result = await addPainting(newPaintingObj).unwrap()
      console.log('success', isSuccess, result)
        if(result.success) {

          dispatch(showNotification({ message: "New Painting Added!", status: 1 }));
          closeModal()
        } else {
          dispatch(showNotification({ message: "New painting didn't add! try again ", status: 0 }));

        }

    } catch (error) {
      dispatch(showNotification({ message: "Failed to save painting. Please try again. \n  Check the Help Page for more explanation.", status: 0 }));
    } finally {
      setLoading(false);
    }
  };

  const updateFormValue = ({ updateType, value }) => {
    setErrorMessage("");
    setPaintingObj({
      ...paintingObj,
      [updateType]: value,
    });
  };

  const handleFileInput = async (event) => {
    const file = event.target.files[0];

    if (file) {
      try {
        const options = {
          maxSizeMB: 0.05,
          maxWidthOrHeight: 800,
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(file, options);

        if (compressedFile.size > 50* 1024) {
          alert("The image is still larger than 50KB after compression. Please use a smaller file.");
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result); // Set preview image
          updateFormValue({ updateType: "photo", value: reader.result });
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error("Error compressing the image:", error);
        alert("Failed to compress the image. Please try again.");
      }
    }
  };

  return (
      <>
        <div style={{ marginBottom: '10px', fontSize: '14px', color: 'gray' }}>
          <span style={{ color: 'red' }}> You need to fill the fields with * </span>
        </div>

        <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '20px',
            }}
        >
          <InputText
              type="text"
              defaultValue={paintingObj.painting_name}
              updateType="painting_name"
              labelTitle={
                <span>
          <span style={{ color: 'red' }}>*</span>Painting Name
        </span>
              }
              updateFormValue={updateFormValue}
          />
          <InputText
              type="text"
              defaultValue={paintingObj.painter_name}
              updateType="painter_name"
              labelTitle={
                <span>
          <span style={{ color: 'red' }}>*</span>Painter Name
        </span>
              }
              updateFormValue={updateFormValue}
          />
          <InputText
              type="number"
              value={paintingObj.base_height}
              updateType="base_height"
              labelTitle={
                <span>
          <span style={{ color: 'red' }}>*</span>Base Height (cm)
        </span>
              }
              updateFormValue={updateFormValue}
          />
          <InputText
              type="number"
              value={paintingObj.height}
              updateType="height"
              labelTitle={
                <span>
          <span style={{ color: 'red' }}>*</span>Height (cm)
        </span>
              }
              updateFormValue={updateFormValue}
          />
          <InputText
              type="number"
              value={paintingObj.width}
              updateType="width"
              labelTitle={
                <span>
          <span style={{ color: 'red' }}>*</span>Width (cm)
        </span>
              }
              updateFormValue={updateFormValue}
          />
          <InputText
              type="number"
              value={paintingObj.weight}
              updateType="weight"
              labelTitle={
                <span>
          <span style={{ color: 'red' }}>*</span>Weight (kg)
        </span>
              }
              updateFormValue={updateFormValue}
          />
          <InputText
              type="text"
              defaultValue={paintingObj.microcontroller}
              updateType="microcontroller"
              labelTitle={<span>Microcontroller</span>}
              updateFormValue={updateFormValue}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            Upload Photo
          </label>
          <div className="mt-2 flex items-center space-x-4">
            <label
                htmlFor="file-upload"
                className="cursor-pointer border border-blue-500 text-blue-500 font-medium py-2 px-4 rounded-md hover:bg-blue-500 hover:text-black transition duration-200"
            >
              Choose File
            </label>
            <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
            />
          </div>
          {previewImage && (
              <div className="mt-4">
                <img
                    src={previewImage}
                    alt="Preview"
                    className="h-32 w-auto rounded shadow"
                />
              </div>
          )}
          {isLoading ? (
              <div className="mt-16 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
                  <p className="text-gray-500">Saving your painting, please wait...</p>
                </div>
              </div>
          ) : (
              <ErrorText styleClass="mt-16">{errorMessage}</ErrorText>
          )}
          <div className="mt-6 flex justify-end space-x-4">
            <button
                className="border border-gray-300 font-medium text-gray-700 rounded-md py-2 px-4 hover:bg-gray-100 transition duration-200"
                onClick={() => closeModal()}
                disabled={loading}
            >
              Cancel
            </button>
            <button
                className="bg-blue-500 text-black font-medium py-2 px-6 rounded-md hover:bg-blue-700 transition duration-200"
                onClick={() => saveNewPainting()}
                disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </>

  );
}

export default AddPaintingModalBody;
