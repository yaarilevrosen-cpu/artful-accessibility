import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import { useTranslation } from '../../i18n';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import Success from '../protected/Photos/SuccessAdd.png';
import Failed from '../protected/Photos/failed.png';
import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import Update from '../protected/Photos/SuccessUpdate.png';
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import Delete from '../protected/Photos/SuccessDelete.png';
import Confirm from '../protected/Photos/confirm.png';
import FailedDelete from '../protected/Photos/failed delete.png';
import LoadingIcon from "../../features/leads/icons/loading.svg";
import  StoppedIcon  from "../../features/leads/icons/stopped.svg";
import  RunningIcon  from "../../features/leads/icons/running.svg";
import status from '../protected/Photos/Status.png';
import menuButton from '../protected/Photos/button.png';
function InternalPage() {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(setPageTitle({ title: t('helpWorker.pageTitle') }));
    }, [dispatch, t]);

    return (
        <div className="p-6">
            {/* Page Title */}
            <h1 className="text-3xl font-bold mb-6 text-center">{t('helpWorker.pageTitle')}</h1>

            {/* Help Section */}
            <div className="space-y-8">
 {/* Section 1: Add New Painting */}
<div className="border p-6 rounded-lg shadow-md">
    <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <summary className="text-lg font-semibold cursor-pointer">{t('helpWorker.section1.summary')}</summary>
        <p className="mt-4">{t('helpWorker.section1.intro')}</p>
        <ul className="list-decimal list-inside mb-4">
            <li>{t('helpWorker.section1.step1.pre')}<strong>{t('helpWorker.common.managePaintings')}</strong>{t('helpWorker.section1.step1.post')}</li>
            <li className="flex items-center space-x-4">
                <span>{t('helpWorker.section1.step2.pre')}<strong>"{t('helpWorker.common.addNew')}"</strong>{t('helpWorker.section1.step2.post')}</span>
                <button
                    className="bg-blue-500 text-black font-medium px-4 py-2 rounded-md shadow-sm hover:bg-blue-600 transition duration-200 ease-in-out flex items-center space-x-2"
                >
                    <span className="text-sm">{t('helpWorker.common.addNew')}</span>
                    <PlusIcon className="w-4 h-4 text-black" />
                </button>
            </li>
            <li>{t('helpWorker.section1.step3')}</li>
            <ul className="list-disc list-inside pl-6 mb-4">
                <li>
                    <strong>{t('helpWorker.field.name.label')}</strong>: {t('helpWorker.field.name.body')} <span className="text-red-500">{t('helpWorker.common.needed')}</span>
                </li>
                <li>
                    <strong>{t('helpWorker.field.painter.label')}</strong>: {t('helpWorker.field.painter.body')} <span className="text-red-500">{t('helpWorker.common.needed')}</span>
                </li>
                <li>
                    <strong>{t('helpWorker.field.baseHeight.label')}</strong>: {t('helpWorker.field.baseHeight.body')} <span className="text-red-500">{t('helpWorker.common.needed')}</span>
                </li>
                <li>
                    <strong>{t('helpWorker.field.dimensions.label')}</strong>: {t('helpWorker.field.dimensions.body')} <span className="text-red-500">{t('helpWorker.common.needed')}</span>
                </li>
                <li>
                    <strong>{t('helpWorker.field.microcontroller.label')}</strong>: {t('helpWorker.field.microcontroller.body')} <span className="text-gray-500">{t('helpWorker.common.optional')}</span>
                </li>
                <li>
                    <strong>{t('helpWorker.field.uploadPhoto.label')}</strong>: {t('helpWorker.field.uploadPhoto.body')} <span className="text-gray-500">{t('helpWorker.common.optional')}</span>
                </li>
            </ul>
            <li> {t('helpWorker.section1.step4.pre')}<strong>{t('helpWorker.common.save')}</strong>{t('helpWorker.section1.step4.mid')}<strong>{t('helpWorker.common.cancel')}</strong>{t('helpWorker.section1.step4.post')}</li>
            <li>
                {t('helpWorker.section1.step5.pre')}<strong>{t('helpWorker.common.successMessage')}</strong>{t('helpWorker.section1.step5.post')}
            </li>
            <img
                src={Success}
                alt={t('helpWorker.common.successAlt')}
                className="w-40 h-16 object-contain rounded-lg shadow-md ml-0"
            />
        </ul>

        {/* Error Explanations Section */}
        <h3 className="text-xl font-semibold mt-6">{t('helpWorker.common.errorExplanationsTitle')}</h3>
        <p className="mt-4">
            {t('helpWorker.section1.errorIntro')}
        </p>
        <img
            src={Failed}
            alt={t('helpWorker.common.failedAlt')}
           className="w-40 h-16 object-contain rounded-lg shadow-md ml-0 mt-4"
        />
        <ul className="list-disc list-inside pl-4 mt-4">
            <li>
                <strong>{t('helpWorker.section1.error.backend.label')}</strong> {t('helpWorker.section1.error.backend.body')}
            </li>
            <li>
                <strong>{t('helpWorker.section1.error.database.label')}</strong> {t('helpWorker.section1.error.database.body')}
            </li>
            <li>
                <strong>{t('helpWorker.section1.error.timeout.label')}</strong> {t('helpWorker.section1.error.timeout.body')}
            </li>
            <li>
    <strong>{t('helpWorker.section1.error.microcontroller.label')}</strong> {t('helpWorker.section1.error.microcontroller.body')}
</li>
        </ul>
    </details>
</div>



                {/* Section 2: Edit Painting */}
<div className="border p-6 rounded-lg shadow-md">
    <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <summary className="text-lg font-semibold cursor-pointer">{t('helpWorker.section2.summary')}</summary>
        <p className="mb-4 mt-4">{t('helpWorker.section2.intro')}</p>
        <ul className="list-decimal list-inside mb-4">
            <li>{t('helpWorker.section2.step1.pre')}<strong>{t('helpWorker.common.managePaintings')}</strong>{t('helpWorker.section2.step1.post')}</li>
            <li>
                {t('helpWorker.section2.step2.pre')}<strong>{t('helpWorker.common.edit')}</strong>{t('helpWorker.section2.step2.post')}
                <button
                    className="flex items-center space-x-2 text-blue-500 border border-blue-500 rounded-md px-3 py-1 hover:bg-blue-100 transition duration-200 underline mt-2"
                    onClick={() => console.log("Edit button clicked")}
                >
                    <PencilIcon className="w-5 h-5" />
                    <span>{t('helpWorker.common.edit')}</span>
                </button>
            </li>
            <li> {t('helpWorker.section2.step3')}</li>
            <ul className="list-disc list-inside pl-6 mb-4">
            </ul>
            <li> {t('helpWorker.section2.step4.pre')}<strong>{t('helpWorker.common.save')}</strong>{t('helpWorker.section2.step4.mid')}<strong>{t('helpWorker.common.cancel')}</strong>{t('helpWorker.section2.step4.post')}</li>
            <li>
                {t('helpWorker.section2.step5.pre')}<strong>{t('helpWorker.common.successMessage')}</strong>{t('helpWorker.section2.step5.post')}
            </li>
            <img
                src={Update}
                alt={t('helpWorker.common.successAlt')}
                className="w-40 h-16 object-contain rounded-lg shadow-md ml-0"
            />
        </ul>

        {/* Error Explanations */}
        <h3 className="text-xl font-semibold mt-6">{t('helpWorker.common.errorExplanationsTitle')}</h3>
        <p className="mt-4">
            {t('helpWorker.section2.errorIntro')}
        </p>
        <img
            src={Failed}
            alt={t('helpWorker.common.failedAlt')}
            className="w-40 h-16 object-contain rounded-lg shadow-md ml-0 mt-4"
        />
        <ul className="list-disc list-inside pl-4 mt-4">
            <li>
                <strong>{t('helpWorker.section2.error.database.label')}</strong> {t('helpWorker.section2.error.database.body')}
            </li>
            <li>
                <strong>{t('helpWorker.section2.error.backend.label')}</strong> {t('helpWorker.section2.error.backend.body')}
            </li>
        </ul>
    </details>
</div>


                {/* Section 3: Delete Painting */}
<div className="border p-6 rounded-lg shadow-md">
    <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <summary className="text-lg font-semibold cursor-pointer">{t('helpWorker.section3.summary')}</summary>
        <p className="mb-4 mt-4">{t('helpWorker.section3.intro')}</p>
        <ul className="list-decimal list-inside mb-4">
            <li>{t('helpWorker.section3.step1.pre')}<strong>{t('helpWorker.common.managePaintings')}</strong>{t('helpWorker.section3.step1.post')}</li>
            <li>
                {t('helpWorker.section3.step2.pre')}<strong>{t('helpWorker.common.delete')}</strong>{t('helpWorker.section3.step2.post')}
                <button
                    className="flex items-center space-x-2 text-red-500 border border-red-500 rounded-md px-3 py-1 hover:bg-red-100 transition duration-200 underline mt-2"
                >
                    <TrashIcon className="w-5 h-5" />
                    <span>{t('helpWorker.common.delete')}</span>
                </button>
            </li>
            <li>
                {t('helpWorker.section3.step3')}
                <img
                    src={Confirm}  // Replace with the correct path to your success message image
                    alt={t('helpWorker.section3.confirmAlt')}
                    className="w-80 h-32 object-contain rounded-lg shadow-lg"
                />
                <ul className="list-disc list-inside pl-6 mb-4">
                    <li>
                        {t('helpWorker.section3.step3a.pre')}<strong>{t('helpWorker.common.confirm')}</strong>{t('helpWorker.section3.step3a.post')}
                    </li>
                    <li>
                        {t('helpWorker.section3.step3b.pre')}<strong>{t('helpWorker.common.cancel')}</strong>{t('helpWorker.section3.step3b.post')}
                    </li>
                </ul>
            </li>
            <li>
                {t('helpWorker.section3.step4.pre')}<strong>{t('helpWorker.common.successMessage')}</strong>{t('helpWorker.section3.step4.post')}
                <img
                    src={Delete}  // Replace with the correct path to your success message image
                    alt={t('helpWorker.common.successAlt')}
                    className="w-40 h-16 object-contain rounded-lg shadow-md ml-0 mt-4"
                />
            </li>
        </ul>

        {/* Error Explanations */}
        <h3 className="text-xl font-semibold mt-6">{t('helpWorker.common.errorExplanationsTitle')}</h3>
        <p className="mt-4">
            {t('helpWorker.section3.errorIntro')}
        </p>
        <img
            src={FailedDelete}
            alt={t('helpWorker.common.failedAlt')}
           className="w-40 h-16 object-contain rounded-lg shadow-md ml-0 mt-4"
        />
        <ul className="list-disc list-inside pl-4 mt-4">
            <li>
                <strong>{t('helpWorker.section3.error.database.label')}</strong> {t('helpWorker.section3.error.database.body')}
            </li>
            <li>
                <strong>{t('helpWorker.section3.error.backend.label')}</strong> {t('helpWorker.section3.error.backend.body')}
            </li>
            <li>
                <strong>{t('helpWorker.section3.error.microcontrollerNotFound.label')}</strong> {t('helpWorker.section3.error.microcontrollerNotFound.body')}
            </li>
            <li>
                <strong>{t('helpWorker.section3.error.cannotDeleteId.label')}</strong> {t('helpWorker.section3.error.cannotDeleteId.body')}
            </li>
        </ul>
    </details>
</div>


{/* Section 4: View Painting Information */}
<div className="border p-6 rounded-lg shadow-md">
    <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <summary className="text-lg font-semibold cursor-pointer">{t('helpWorker.section4.summary')}</summary>
        <p className="mb-4 mt-4">{t('helpWorker.section4.intro')}</p>
        <ul className="list-decimal list-inside mb-4">
            <li>{t('helpWorker.section4.step1.pre')}<strong>{t('helpWorker.common.managePaintings')}</strong>{t('helpWorker.section4.step1.post')}</li>
            <li>
                {t('helpWorker.section4.step2.pre')}<strong>{t('helpWorker.common.info')}</strong>{t('helpWorker.section4.step2.post')}
                <button
                    className="flex items-center space-x-2 text-blue-500 border border-blue-500 rounded-md px-3 py-1 hover:bg-blue-100 transition duration-200 underline "

                >
                    <span>{t('helpWorker.common.info')}</span>
                </button>
            </li>
            <li>
                {t('helpWorker.section4.step3')}
                <ul className="list-disc list-inside pl-6 mb-4">
                    <li><strong>{t('helpWorker.section4.field.id.label')}</strong> {t('helpWorker.section4.field.id.body')}</li>
                    <li><strong>{t('helpWorker.section4.field.painter.label')}</strong> {t('helpWorker.section4.field.painter.body')}</li>
                    <li><strong>{t('helpWorker.section4.field.baseHeight.label')}</strong> {t('helpWorker.section4.field.baseHeight.body')}</li>
                    <li><strong>{t('helpWorker.section4.field.height.label')}</strong> {t('helpWorker.section4.field.height.body')}</li>
                    <li><strong>{t('helpWorker.section4.field.width.label')}</strong> {t('helpWorker.section4.field.width.body')}</li>
                    <li><strong>{t('helpWorker.section4.field.weight.label')}</strong> {t('helpWorker.section4.field.weight.body')}</li>
                    <li><strong>{t('helpWorker.section4.field.microcontroller.label')}</strong> {t('helpWorker.section4.field.microcontroller.body')}</li>
                    <li>
                    <strong>{t('helpWorker.section4.heightAdjustment.label')}</strong>
<span className="text-gray-500"> {t('helpWorker.section4.heightAdjustment.calcIntro')}</span>
<div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md mt-2 text-sm">
    {t('helpWorker.section4.heightAdjustment.formula')}
</div>
<p className="mt-2">
    {t('helpWorker.section4.heightAdjustment.explanation')}
    <ul className="list-disc list-inside mt-2">
        <li><strong>{t('helpWorker.section4.heightAdjustment.baseHeight.label')}</strong> {t('helpWorker.section4.heightAdjustment.baseHeight.body')}</li>
        <li><strong>{t('helpWorker.section4.heightAdjustment.halfHeight.label')}</strong> {t('helpWorker.section4.heightAdjustment.halfHeight.body')}</li>
        <li><strong>{t('helpWorker.section4.heightAdjustment.avgEyeLevel.label')}</strong> {t('helpWorker.section4.heightAdjustment.avgEyeLevel.body')}</li>
    </ul>
</p>
<p className="mt-2">
    <span className="text-red-500">
        {t('helpWorker.section4.heightAdjustment.noAdjustNote')}
    </span>
</p>

                    </li>
                    <li>
                        <strong>{t('helpWorker.section4.viewingDistance.label')}</strong>
                        <span className="text-gray-500"> {t('helpWorker.section4.viewingDistance.calcIntro')}</span>
                        <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md mt-2 text-sm">
                            {t('helpWorker.section4.viewingDistance.formula')}
                        </div>
                        <p className="mt-2">
                            {t('helpWorker.section4.viewingDistance.explanation')}
                            <ul className="list-disc list-inside mt-2">
                                <li>
                                    <strong>{t('helpWorker.section4.viewingDistance.diagonal.label')}</strong> {t('helpWorker.section4.viewingDistance.diagonal.body')}
                                </li>
                                <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md mt-2 text-sm">
            {t('helpWorker.section4.viewingDistance.diagonalFormula')}
        </div>
                                <li>
                                    {t('helpWorker.section4.viewingDistance.factorNote')}
                                </li>

                            </ul>
                        </p>
                    </li>

                </ul>
            </li>
        </ul>
    </details>
</div>



{/* Section 5: System Status Panel */}
<div className="border p-6 rounded-lg shadow-md">
    <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <summary className="text-lg font-semibold cursor-pointer">{t('helpWorker.section5.summary')}</summary>
        <p className="mt-4">
            {t('helpWorker.section5.intro.pre')}<strong>{t('helpWorker.common.managePaintings')}</strong>{t('helpWorker.section5.intro.post')}
        </p>
        <ul className="list-disc list-inside pl-4 mt-4">
            <li>
                <strong>{t('helpWorker.section5.systemStatus.label')}</strong>
                <p className="mt-2">
                    {t('helpWorker.section5.systemStatus.intro')}
                    <ul className="list-disc list-inside pl-6 mt-2">
                        <li className="flex items-center space-x-2">
                            <img
                                src={RunningIcon}
                                alt={t('helpWorker.common.runningIconAlt')}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                {t('helpWorker.section5.systemStatus.running')}
                            </span>
                        </li>
                        <li className="flex items-center space-x-2">
                            <img
                                src={StoppedIcon}
                                alt={t('helpWorker.common.stoppedIconAlt')}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                {t('helpWorker.section5.systemStatus.stopped')}
                            </span>
                        </li>
                    </ul>
                </p>


<div className="text-center my-4">

        </div>
        <div className="flex items-center space-x-4 mt-2">
    {/* Text and Button Image */}
    <p>
        {t('helpWorker.section5.menuIntro')}
    </p>
    <img
        src={menuButton} // Replace with the actual path to your menu button image
        alt={t('helpWorker.section5.menuButtonAlt')}
        className="w-10 h-10 object-contain"
    />
</div>

<p className="mt-2">
    {t('helpWorker.section5.menuDescription')}
</p>

<div className="text-center my-4">
    {/* Status Image */}
    <img
        src={status}
        alt={t('helpWorker.section5.statusImageAlt')}
        className="w-40 h-28 object-contain rounded-lg shadow-md"
    />
</div>

<ul className="list-disc list-inside pl-6 mt-2">
    <li>
        <strong>{t('helpWorker.section5.menu.shutdown.label')}</strong> {t('helpWorker.section5.menu.shutdown.body')}
    </li>
    <li>
        <strong>{t('helpWorker.section5.menu.restart.label')}</strong> {t('helpWorker.section5.menu.restart.body')}
    </li>
    <li>
        <strong>{t('helpWorker.section5.menu.restartProgram.label')}</strong> {t('helpWorker.section5.menu.restartProgram.body')}
    </li>
</ul>



                <strong>{t('helpWorker.section5.sensor.label')}</strong>
                <p className="mt-2">
                    {t('helpWorker.section5.sensor.intro')}
                    <ul className="list-disc list-inside pl-6 mt-2">
                        <li className="flex items-center space-x-2">
                        <img
            src={RunningIcon}
            alt={t('helpWorker.common.runningIconAlt')}
            className="w-6 h-6"
        />
                            <span className="text-black-500 font-medium">
                                {t('helpWorker.section5.sensor.detected')}
                            </span>
                        </li>
                        <li className="flex items-center space-x-2">
                        <img
            src={StoppedIcon}
            alt={t('helpWorker.common.stoppedIconAlt')}
            className="w-6 h-6"
        />
                            <span className="text-black-500 font-medium">
                                {t('helpWorker.section5.sensor.notDetected')}
                            </span>
                        </li>
                    </ul>
                    <p className="mt-2">
                        {t('helpWorker.section5.sensor.viewingDistanceIntro')}
                        <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md mt-2 text-sm">
                            {t('helpWorker.section4.viewingDistance.formula')}
                        </div>
                        <ul className="list-disc list-inside mt-2">
                            <li>
                                <strong>{t('helpWorker.section5.sensor.diagonal.label')}</strong> {t('helpWorker.section5.sensor.diagonal.body')}
                                <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md mt-2 text-sm">
                                    {t('helpWorker.section4.viewingDistance.diagonalFormula')}
                                </div>
                            </li>
                            <li>
                                {t('helpWorker.section5.sensor.interactionNote')}
                            </li>
                        </ul>
                    </p>
                </p>
            </li>
            <li className="mt-4">
                <strong>{t('helpWorker.section5.wheelchair.label')}</strong>


                <p className="mt-2">
                    {t('helpWorker.section5.wheelchair.intro')}

                    <li className="flex items-center space-x-2">
                        <img
            src={LoadingIcon}
            alt={t('helpWorker.common.loadingIconAlt')}
            className="w-6 h-6"
        />
                            <span className="text-black-500 font-medium">
                            {t('helpWorker.section5.wheelchair.detecting')}
                            </span>
                        </li>
                    <ul className="list-disc list-inside pl-6 mt-2">
                        <li className="flex items-center space-x-2">
                        <img
            src={RunningIcon}
            alt={t('helpWorker.common.runningIconAlt')}
            className="w-6 h-6"
        />
                            <span className="text-black-500 font-medium">
                                {t('helpWorker.section5.wheelchair.detected')}
                            </span>
                        </li>
                        <li className="flex items-center space-x-2">
                        <img
            src={StoppedIcon}
            alt={t('helpWorker.common.stoppedIconAlt')}
            className="w-6 h-6"
        />
                            <span className="text-black-500 font-medium">
                                {t('helpWorker.section5.wheelchair.notDetected')}
                            </span>
                        </li>
                    </ul>
                </p>
            </li>
            <li className="mt-4">
                <strong>{t('helpWorker.section5.heightAdjust.label')}</strong>
                <p className="mt-2">
                    {t('helpWorker.section5.heightAdjust.intro')}
                    <ul className="list-disc list-inside pl-6 mt-2">
                        <li className="flex items-center space-x-2">
                        <img
            src={RunningIcon}
            alt={t('helpWorker.common.runningIconAlt')}
            className="w-6 h-6"
        />
                            <span className="text-black-500 font-medium">
                                {t('helpWorker.section5.heightAdjust.inProgress')}
                            </span>
                        </li>
                        <li className="flex items-center space-x-2">
                        <img
            src={StoppedIcon}
            alt={t('helpWorker.common.stoppedIconAlt')}
            className="w-6 h-6"
        />
                            <span className="text-black-500 font-medium">
                                {t('helpWorker.section5.heightAdjust.notInProgress')}
                            </span>
                        </li>
                    </ul>
                </p>
            </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6">{t('helpWorker.section5.troubleshootingTitle')}</h3>
        <p className="mt-4">
            {t('helpWorker.section5.troubleshootingIntro')}
        </p>
        <ul className="list-disc list-inside pl-4 mt-4">
            <li>
                <strong>{t('helpWorker.section5.troubleshoot.systemStatus.label')}</strong> {t('helpWorker.section5.troubleshoot.systemStatus.body')}
            </li>
            <li>
                <strong>{t('helpWorker.section5.troubleshoot.sensor.label')}</strong> {t('helpWorker.section5.troubleshoot.sensor.body')}
            </li>
            <li>
                <strong>{t('helpWorker.section5.troubleshoot.wheelchair.label')}</strong> {t('helpWorker.section5.troubleshoot.wheelchair.body')}
            </li>
            <li>
                <strong>{t('helpWorker.section5.troubleshoot.heightAdjust.label')}</strong> {t('helpWorker.section5.troubleshoot.heightAdjust.body')}
            </li>
        </ul>
    </details>
</div>



            </div>
        </div>
    );
}

export default InternalPage;
