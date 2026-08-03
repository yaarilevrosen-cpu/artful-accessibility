import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import InputText from "../../../components/Input/InputText";
import ErrorText from "../../../components/Typography/ErrorText";
import { showNotification } from "../../common/headerSlice";
import {useUpdatePaintingMutation} from '../../../utils/apiSlice';
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "../../../i18n";
const INITIAL_PAINTING_OBJ = {
  name: "",
  painter_name: "",
  base_height: "",
  height: "",
  width: "",
  weight:"",
  photo: null,
  microcontroller:"",

};

function EditPaintingModalBody({ closeModal, extraObject }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [errorMessage, setErrorMessage] = useState("");
  const [paintingObj, setPaintingObj] = useState({ ...extraObject });
  const [loading, setLoading] = useState(false);
  const [updatePainting,{data,isLoading,isSuccess}] = useUpdatePaintingMutation()

  const { name, base_height, height, width, painter_name, photo, status ,weight,microcontroller,camera_device} = paintingObj;

  useEffect(() => {
    setPaintingObj(extraObject);
  }, [extraObject]);

  const saveEditLead = async () => {
    setLoading(true);
    try {
      const { photo, ...newObj } = paintingObj;


      await updatePainting(newObj).unwrap()
      if(!isLoading) {
        dispatch(showNotification({ message: t('modal.editPainting.success'), status: 1 }));
        closeModal()
      }


    } catch (error) {
      dispatch(showNotification({ message: t('modal.editPainting.failure'), status: 0 }));
    ;
    } finally {
      setLoading(false);
    }
  };

  const updateFormValue = ({ updateType, value }) => {
    setErrorMessage("");
    setPaintingObj((prev) => ({
      ...prev,
      [updateType]: value,
    }));
  };

  return (
    <>
      {/* Input Fields */}
      <InputText
        type="text"
        defaultValue={name}
        updateType="name"
        containerStyle="mt-4"
        labelTitle={t('modal.field.paintingName')}
        updateFormValue={updateFormValue}
      />
      <InputText
        type="text"
        defaultValue={painter_name}
        updateType="painter_name"
        containerStyle="mt-4"
        labelTitle={t('modal.field.painterName')}
        updateFormValue={updateFormValue}
      />
      <InputText
        type="number"
        defaultValue={base_height}
        updateType="base_height"
        containerStyle="mt-4"
        labelTitle={t('modal.field.baseHeight')}
        updateFormValue={updateFormValue}
      />
      <InputText
        type="number"
        defaultValue={height}
        updateType="height"
        containerStyle="mt-4"
        labelTitle={t('modal.field.height')}
        updateFormValue={updateFormValue}
      />
      <InputText
        type="number"
        defaultValue={width}
        updateType="width"
        containerStyle="mt-4"
        labelTitle={t('modal.field.width')}
        updateFormValue={updateFormValue}
      />
<InputText
        type="number"
        defaultValue={weight}
        updateType="weight"
        containerStyle="mt-4"
        labelTitle={t('modal.field.weight')}
        updateFormValue={updateFormValue}
      />
 <InputText
        type="text"
        defaultValue={microcontroller}
        updateType="microcontroller"
        containerStyle="mt-4"
        labelTitle={t('modal.field.microcontroller')}
        updateFormValue={updateFormValue}
      />
 <InputText
        type="text"
        defaultValue={camera_device}
        updateType="camera_device"
        containerStyle="mt-4"
        labelTitle={t('modal.field.cameraDevice')}
        updateFormValue={updateFormValue}
      />
     {/* Status Selection Box */}
     <div className="mt-4">
  {/* <label className="block text-sm font-medium text-gray-700">Status</label>
  <div className="mt-2">
    <p className="text-gray-700 py-2 px-3 border border-gray-300 rounded-md bg-gray-100">
      {status || "Active"}
    </p>
  </div> */}
</div>


{/* Loading or Error Message */}
{loading ? (
    <div className="mt-16 text-center">
    <div className="flex items-center justify-center gap-2">
     <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
     <p className="text-gray-500">{t('modal.editPainting.saving')}</p>

    </div>
  </div>
) : (
  <ErrorText styleClass="mt-16">{errorMessage}</ErrorText>
)}

{/* Modal Actions */}
<div className="mt-6 flex justify-end gap-4">
  <button
  className="border border-gray-300  font-medium  text-gray-700 rounded-md py-2 px-4 hover:bg-gray-100 transition duration-200"

    onClick={() => closeModal()}
    disabled={loading}
  >
    {t('common.cancel')}
  </button>
  <button
    className="bg-blue-500 text-black font-medium py-2 px-6 rounded-md hover:bg-blue-700 transition duration-200"
    onClick={() => saveEditLead()}
    disabled={loading}
  >
    {loading ? t('modal.saving') : t('common.save')}
  </button>
</div>

    </>
  );
}

export default EditPaintingModalBody;
