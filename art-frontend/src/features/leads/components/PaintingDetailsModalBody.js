import React, { useEffect, useState } from "react";
import { useTranslation } from "../../../i18n";

const PaintingDetailsModalBody = ({ closeModal, extraObject }) => {
    const { t } = useTranslation();
    const height_adjustt = ((extraObject.height / 2) + extraObject.base_height)-125  ;

    return (
        <div className="space-y-3">
            <p>
                <img
                    src={extraObject.photo || "placeholder.jpg"}
                    alt={extraObject.photo ? t('modal.details.photoAlt', { name: extraObject.name }) : t('modal.details.noPhoto')}
                    style={{
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        cursor: extraObject.photo ? "pointer" : "default",
                        margin: "0 auto",
                        display: "block",
                    }}
                />
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 text-black dark:text-white">
                <p>
                    <strong>{t('modal.details.id')}</strong> {extraObject.sys_id || t('common.na')}
                </p>
                <p>
                    <strong>{t('modal.details.painter')}</strong> {extraObject.painter_name || t('common.na')}
                </p>
                <p>
                    <strong>{t('modal.details.baseHeight')}</strong> {extraObject.base_height} {t('modal.details.cm')}
                </p>
                <p>
                    <strong>{t('modal.details.height')}</strong> {extraObject.height} {t('modal.details.cm')}
                </p>
                <p>
                    <strong>{t('modal.details.width')}</strong> {extraObject.width} {t('modal.details.cm')}
                </p>
                <p>
                    <strong>{t('modal.details.weight')}</strong> {extraObject.weight || t('common.na')} {t('modal.details.kg')}
                </p>
                <p>
                    <strong>{t('modal.details.microcontroller')}</strong> {extraObject.microcontroller || t('common.na')}
                </p>

                <p>
                    <strong>{t('modal.details.heightAdjustment')}</strong>
                    {height_adjustt > 0 ? `${height_adjustt} ${t('modal.details.cm')}` : t('modal.details.noAdjust')}
                </p>
                <p>
                    <strong>{t('modal.details.optimalDistance')}</strong>{" "}
                    {Math.round(Math.sqrt(Math.pow(extraObject.width, 2) + Math.pow(extraObject.height, 2)) * 1.5)} {t('modal.details.cm')}
                </p>

            </div>

            <div className="text-end mt-4">
                <button
                    className="bg-blue-500 text-black font-medium py-2 px-6 rounded-md hover:bg-blue-700 transition duration-200"
                    onClick={closeModal}
                >
                    {t('common.close')}
                </button>
            </div>
        </div>
    );
};

export default PaintingDetailsModalBody;
