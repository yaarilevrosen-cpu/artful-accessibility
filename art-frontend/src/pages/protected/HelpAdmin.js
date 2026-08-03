import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import Success from '../protected/Photos/SuccessAdd.png';
import Failed from '../protected/Photos/failed.png';
import PencilIcon from "@heroicons/react/24/outline/PencilIcon";
import Update from '../protected/Photos/SuccessUpdate.png';
import TrashIcon from "@heroicons/react/24/outline/TrashIcon";
import Delete from '../protected/Photos/SuccessDelete.png';
import Confirm from '../protected/Photos/confirm.png';
import FailedDelete from '../protected/Photos/failed delete.png';
import StoppedIcon  from "../../features/leads/icons/stopped.svg";
import RunningIcon  from "../../features/leads/icons/running.svg";
import LoadingIcon from "../../features/leads/icons/loading.svg";
import ArrowDownTrayIcon from '@heroicons/react/24/outline/ArrowDownTrayIcon';
import selectdate from '../protected/Photos/select date.png';
import status from '../protected/Photos/Status.png';
import menuButton from '../protected/Photos/button.png';
import { useTranslation } from '../../i18n';
function InternalPage() {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    useEffect(() => {
        dispatch(setPageTitle({ title: t('helpAdmin.pageTitle') }));
    }, [dispatch, t]);

    return (
        <div className="p-6">
            {/* Page Title */}
            <h1 className="text-3xl font-bold mb-6 text-center">{t('helpAdmin.pageTitle')}</h1>

            {/* Help Section */}
            <div className="space-y-8">
 {/* Section 1: Add New Painting */}
<div className="border p-6 rounded-lg shadow-md">
    <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <summary className="text-lg font-semibold cursor-pointer">{t('helpAdmin.section1.title')}</summary>
        <p className="mt-4">{t('helpAdmin.section1.intro')}</p>
        <ul className="list-decimal list-inside mb-4">
            <li>{t('helpAdmin.section1.step1.pre')}<strong>{t('helpAdmin.common.managePaintings')}</strong>{t('helpAdmin.section1.step1.post')}</li>
            <li className="flex items-center gap-4">
                <span>{t('helpAdmin.section1.step2.pre')}<strong>{t('helpAdmin.section1.step2.strong')}</strong>{t('helpAdmin.section1.step2.post')}</span>
                <button
                    className="bg-blue-500 text-black font-medium px-4 py-2 rounded-md shadow-sm hover:bg-blue-600 transition duration-200 ease-in-out flex items-center gap-2"
                >
                    <span className="text-sm">{t('helpAdmin.section1.addNewButton')}</span>
                    <PlusIcon className="w-4 h-4 text-black" />
                </button>
            </li>
            <li>{t('helpAdmin.section1.step3')}</li>
            <ul className="list-disc list-inside pl-6 mb-4">
                <li>
                    <strong>{t('helpAdmin.section1.field.name.label')}</strong>{t('helpAdmin.section1.field.name.mid')}<span className="text-red-500">{t('helpAdmin.common.needed')}</span>
                </li>
                <li>
                    <strong>{t('helpAdmin.section1.field.painter.label')}</strong>{t('helpAdmin.section1.field.painter.mid')}<span className="text-red-500">{t('helpAdmin.common.needed')}</span>
                </li>
                <li>
                    <strong>{t('helpAdmin.section1.field.baseHeight.label')}</strong>{t('helpAdmin.section1.field.baseHeight.mid')}<span className="text-red-500">{t('helpAdmin.common.needed')}</span>
                </li>
                <li>
                    <strong>{t('helpAdmin.section1.field.dimensions.label')}</strong>{t('helpAdmin.section1.field.dimensions.mid')}<span className="text-red-500">{t('helpAdmin.common.needed')}</span>
                </li>
                <li>
                    <strong>{t('helpAdmin.section1.field.microcontroller.label')}</strong>{t('helpAdmin.section1.field.microcontroller.mid')}<span className="text-gray-500">{t('helpAdmin.common.optional')}</span>
                </li>
                <li>
                    <strong>{t('helpAdmin.section1.field.uploadPhoto.label')}</strong>{t('helpAdmin.section1.field.uploadPhoto.mid')}<span className="text-gray-500">{t('helpAdmin.common.optional')}</span>
                </li>
            </ul>
            <li>{t('helpAdmin.section1.step4.pre')}<strong>{t('helpAdmin.common.save')}</strong>{t('helpAdmin.section1.step4.mid')}<strong>{t('helpAdmin.common.cancel')}</strong>{t('helpAdmin.section1.step4.post')}</li>
            <li>
                {t('helpAdmin.section1.step5.pre')}<strong>{t('helpAdmin.section1.step5.strong')}</strong>{t('helpAdmin.section1.step5.post')}
            </li>
            <img
                src={Success}
                alt={t('helpAdmin.common.successMessageAlt')}
                className="w-40 h-16 object-contain rounded-lg shadow-md ml-0"
            />
        </ul>

        {/* Error Explanations Section */}
        <h3 className="text-xl font-semibold mt-6">{t('helpAdmin.common.errorExplanations')}</h3>
        <p className="mt-4">
            {t('helpAdmin.section1.errorIntro')}
        </p>
        <img
            src={Failed}
            alt={t('helpAdmin.common.failedMessageAlt')}
           className="w-40 h-16 object-contain rounded-lg shadow-md ml-0 mt-4"
        />
        <ul className="list-disc list-inside pl-4 mt-4">
            <li>
                <strong>{t('helpAdmin.section1.error.disconnectedBackend.label')}</strong> {t('helpAdmin.section1.error.disconnectedBackend.body')}
            </li>
            <li>
                <strong>{t('helpAdmin.section1.error.disconnectedDatabase.label')}</strong> {t('helpAdmin.section1.error.disconnectedDatabase.body')}
            </li>
            <li>
                <strong>{t('helpAdmin.section1.error.installFailed.label')}</strong> {t('helpAdmin.section1.error.installFailed.body')}
            </li>
            <li>
    <strong>{t('helpAdmin.section1.error.microcontroller.label')}</strong> {t('helpAdmin.section1.error.microcontroller.body')}
</li>



        </ul>
    </details>
</div>



                {/* Section 2: Edit Painting */}
<div className="border p-6 rounded-lg shadow-md">
    <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <summary className="text-lg font-semibold cursor-pointer">{t('helpAdmin.section2.title')}</summary>
        <p className="mb-4 mt-4">{t('helpAdmin.section2.intro')}</p>
        <ul className="list-decimal list-inside mb-4">
            <li>{t('helpAdmin.section2.step1.pre')}<strong>{t('helpAdmin.common.managePaintings')}</strong>{t('helpAdmin.section2.step1.post')}</li>
            <li>
                {t('helpAdmin.section2.step2.pre')}<strong>{t('helpAdmin.section2.step2.strong')}</strong>{t('helpAdmin.section2.step2.post')}
                <button
                    className="flex items-center gap-2 text-blue-500 border border-blue-500 rounded-md px-3 py-1 hover:bg-blue-100 transition duration-200 underline mt-2"
                    onClick={() => console.log("Edit button clicked")}
                >
                    <PencilIcon className="w-5 h-5" />
                    <span>{t('helpAdmin.common.edit')}</span>
                </button>
            </li>
            <li>{t('helpAdmin.section2.step3')}</li>
            <ul className="list-disc list-inside pl-6 mb-4">
            </ul>
            <li>{t('helpAdmin.section2.step4.pre')}<strong>{t('helpAdmin.common.save')}</strong>{t('helpAdmin.section2.step4.mid')}<strong>{t('helpAdmin.common.cancel')}</strong>{t('helpAdmin.section2.step4.post')}</li>
            <li>
                {t('helpAdmin.section2.step5.pre')}<strong>{t('helpAdmin.section2.step5.strong')}</strong>{t('helpAdmin.section2.step5.post')}
            </li>
            <img
                src={Update}
                alt={t('helpAdmin.common.successMessageAlt')}
                className="w-40 h-16 object-contain rounded-lg shadow-md ml-0"
            />
        </ul>

        {/* Error Explanations */}
        <h3 className="text-xl font-semibold mt-6">{t('helpAdmin.common.errorExplanations')}</h3>
        <p className="mt-4">
            {t('helpAdmin.section2.errorIntro')}
        </p>
        <img
            src={Failed}
            alt={t('helpAdmin.common.failedMessageAlt')}
            className="w-40 h-16 object-contain rounded-lg shadow-md ml-0 mt-4"
        />
        <ul className="list-disc list-inside pl-4 mt-4">
            <li>
                <strong>{t('helpAdmin.section2.error.disconnectedDatabase.label')}</strong> {t('helpAdmin.section2.error.disconnectedDatabase.body')}
            </li>
            <li>
                <strong>{t('helpAdmin.section2.error.disconnectedBackend.label')}</strong> {t('helpAdmin.section2.error.disconnectedBackend.body')}
            </li>
        </ul>
    </details>
</div>


                {/* Section 3: Delete Painting */}
<div className="border p-6 rounded-lg shadow-md">
    <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <summary className="text-lg font-semibold cursor-pointer">{t('helpAdmin.section3.title')}</summary>
        <p className="mb-4 mt-4">{t('helpAdmin.section3.intro')}</p>
        <ul className="list-decimal list-inside mb-4">
            <li>{t('helpAdmin.section3.step1.pre')}<strong>{t('helpAdmin.common.managePaintings')}</strong>{t('helpAdmin.section3.step1.post')}</li>
            <li>
                {t('helpAdmin.section3.step2.pre')}<strong>{t('helpAdmin.common.delete')}</strong>{t('helpAdmin.section3.step2.post')}
                <button
                    className="flex items-center gap-2 text-red-500 border border-red-500 rounded-md px-3 py-1 hover:bg-red-100 transition duration-200 underline mt-2"
                >
                    <TrashIcon className="w-5 h-5" />
                    <span>{t('helpAdmin.common.delete')}</span>
                </button>
            </li>
            <li>
                {t('helpAdmin.section3.step3.intro')}
                <img
                    src={Confirm}  // Replace with the correct path to your success message image
                    alt={t('helpAdmin.section3.confirmModalAlt')}
                    className="w-80 h-32 object-contain rounded-lg shadow-lg"
                />
                <ul className="list-disc list-inside pl-6 mb-4">
                    <li>
                        {t('helpAdmin.section3.step3a.pre')}<strong>{t('helpAdmin.common.confirm')}</strong>{t('helpAdmin.section3.step3a.post')}
                    </li>
                    <li>
                        {t('helpAdmin.section3.step3b.pre')}<strong>{t('helpAdmin.common.cancel')}</strong>{t('helpAdmin.section3.step3b.post')}
                    </li>
                </ul>
            </li>
            <li>
                {t('helpAdmin.section3.step4.pre')}<strong>{t('helpAdmin.section3.step4.strong')}</strong>{t('helpAdmin.section3.step4.post')}
                <img
                    src={Delete}  // Replace with the correct path to your success message image
                    alt={t('helpAdmin.common.successMessageAlt')}
                    className="w-40 h-16 object-contain rounded-lg shadow-md ml-0 mt-4"
                />
            </li>
        </ul>

        {/* Error Explanations */}
        <h3 className="text-xl font-semibold mt-6">{t('helpAdmin.common.errorExplanations')}</h3>
        <p className="mt-4">
            {t('helpAdmin.section3.errorIntro')}
        </p>

        <img
            src={FailedDelete}
            alt={t('helpAdmin.common.failedMessageAlt')}
           className="w-40 h-16 object-contain rounded-lg shadow-md ml-0 mt-4"
        />
        <ul className="list-disc list-inside pl-4 mt-4">
            <li>
                <strong>{t('helpAdmin.section3.error.disconnectedDatabase.label')}</strong> {t('helpAdmin.section3.error.disconnectedDatabase.body')}
            </li>
            <li>
                <strong>{t('helpAdmin.section3.error.disconnectedBackend.label')}</strong> {t('helpAdmin.section3.error.disconnectedBackend.body')}
            </li>
            <li>
                <strong>{t('helpAdmin.section3.error.microcontrollerNotFound.label')}</strong> {t('helpAdmin.section3.error.microcontrollerNotFound.body')}
            </li>
            <li>
                <strong>{t('helpAdmin.section3.error.cannotDeleteId.label')}</strong> {t('helpAdmin.section3.error.cannotDeleteId.body')}
            </li>
        </ul>
    </details>
</div>


{/* Section 4: View Painting Information */}
<div className="border p-6 rounded-lg shadow-md">
    <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <summary className="text-lg font-semibold cursor-pointer">{t('helpAdmin.section4.title')}</summary>
        <p className="mb-4 mt-4">{t('helpAdmin.section4.intro')}</p>
        <ul className="list-decimal list-inside mb-4">
            <li>{t('helpAdmin.section4.step1.pre')}<strong>{t('helpAdmin.common.managePaintings')}</strong>{t('helpAdmin.section4.step1.post')}</li>
            <li>
                {t('helpAdmin.section4.step2.pre')}<strong>{t('helpAdmin.common.info')}</strong>{t('helpAdmin.section4.step2.post')}
                <button
                    className="flex items-center gap-2 text-blue-500 border border-blue-500 rounded-md px-3 py-1 hover:bg-blue-100 transition duration-200 underline "

                >
                    <span>{t('helpAdmin.common.info')}</span>
                </button>
            </li>
            <li>
                {t('helpAdmin.section4.step3.intro')}
                <ul className="list-disc list-inside pl-6 mb-4">
                    <li><strong>{t('helpAdmin.section4.field.id.label')}</strong> {t('helpAdmin.section4.field.id.body')}</li>
                    <li><strong>{t('helpAdmin.section4.field.painter.label')}</strong> {t('helpAdmin.section4.field.painter.body')}</li>
                    <li><strong>{t('helpAdmin.section4.field.baseHeight.label')}</strong> {t('helpAdmin.section4.field.baseHeight.body')}</li>
                    <li><strong>{t('helpAdmin.section4.field.height.label')}</strong> {t('helpAdmin.section4.field.height.body')}</li>
                    <li><strong>{t('helpAdmin.section4.field.width.label')}</strong> {t('helpAdmin.section4.field.width.body')}</li>
                    <li><strong>{t('helpAdmin.section4.field.weight.label')}</strong> {t('helpAdmin.section4.field.weight.body')}</li>
                    <li><strong>{t('helpAdmin.section4.field.microcontroller.label')}</strong> {t('helpAdmin.section4.field.microcontroller.body')}</li>
                    <li>
                    <strong>{t('helpAdmin.section4.heightAdjustment.label')}</strong>
<span className="text-gray-500"> {t('helpAdmin.section4.heightAdjustment.calcLabel')}</span>
<div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md mt-2 text-sm">
    {t('helpAdmin.section4.heightAdjustment.formula')}
</div>
<p className="mt-2">
    {t('helpAdmin.section4.heightAdjustment.desc')}
    <ul className="list-disc list-inside mt-2">
        <li><strong>{t('helpAdmin.section4.heightAdjustment.baseHeight.label')}</strong> {t('helpAdmin.section4.heightAdjustment.baseHeight.body')}</li>
        <li><strong>{t('helpAdmin.section4.heightAdjustment.halfHeight.label')}</strong> {t('helpAdmin.section4.heightAdjustment.halfHeight.body')}</li>
        <li><strong>{t('helpAdmin.section4.heightAdjustment.eyeLevel.label')}</strong> {t('helpAdmin.section4.heightAdjustment.eyeLevel.body')}</li>
    </ul>
</p>
<p className="mt-2">
    <span className="text-red-500">
        {t('helpAdmin.section4.heightAdjustment.noAdjustNote')}
    </span>
</p>


                    </li>
                    <li>
                        <strong>{t('helpAdmin.section4.viewingDistance.label')}</strong>
                        <span className="text-gray-500"> {t('helpAdmin.section4.viewingDistance.calcLabel')}</span>
                        <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md mt-2 text-sm">
                            {t('helpAdmin.section4.viewingDistance.formula')}
                        </div>
                        <p className="mt-2">
                            {t('helpAdmin.section4.viewingDistance.desc')}
                            <ul className="list-disc list-inside mt-2">
                                <li>
                                    <strong>{t('helpAdmin.section4.viewingDistance.diagonal.label')}</strong> {t('helpAdmin.section4.viewingDistance.diagonal.body')}
                                </li>
                                <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md mt-2 text-sm">
            {t('helpAdmin.section4.viewingDistance.diagonalFormula')}
        </div>
                                <li>
                                    {t('helpAdmin.section4.viewingDistance.factorNote')}
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
        <summary className="text-lg font-semibold cursor-pointer">{t('helpAdmin.section5.title')}</summary>
        <p className="mt-4">
            {t('helpAdmin.section5.intro.pre')}<strong>{t('helpAdmin.common.managePaintings')}</strong>{t('helpAdmin.section5.intro.post')}
        </p>
        <ul className="list-disc list-inside pl-4 mt-4">
            <li>
                <strong>{t('helpAdmin.section5.systemStatus.label')}</strong>
                <p className="mt-2">
                    {t('helpAdmin.section5.systemStatus.intro')}
                    <ul className="list-disc list-inside pl-6 mt-2">
                        <li className="flex items-center gap-2">
                            <img
                                src={RunningIcon}
                                alt={t('helpAdmin.common.runningIconAlt')}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                {t('helpAdmin.section5.systemStatus.running')}
                            </span>
                        </li>
                        <li className="flex items-center gap-2">
                            <img
                                src={StoppedIcon}
                                alt={t('helpAdmin.common.stoppedIconAlt')}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                {t('helpAdmin.section5.systemStatus.stopped')}
                            </span>
                        </li>
                    </ul>
                </p>


<div className="text-center my-4">

        </div>
        <div className="flex items-center gap-4 mt-2">
    {/* Text and Button Image */}
    <p>
        {t('helpAdmin.section5.menuButtonIntro')}
    </p>
    <img
        src={menuButton} // Replace with the actual path to your menu button image
        alt={t('helpAdmin.section5.menuButtonAlt')}
        className="w-10 h-10 object-contain"
    />
</div>

<p className="mt-2">
    {t('helpAdmin.section5.thisIsMenu')}
</p>

<div className="text-center my-4">
    {/* Status Image */}
    <img
        src={status}
        alt={t('helpAdmin.section5.statusImageAlt')}
        className="w-40 h-28 object-contain rounded-lg shadow-md"
    />
</div>

<ul className="list-disc list-inside pl-6 mt-2">
    <li>
        <strong>{t('helpAdmin.section5.menu.shutdown.label')}</strong> {t('helpAdmin.section5.menu.shutdown.body')}
    </li>
    <li>
        <strong>{t('helpAdmin.section5.menu.restart.label')}</strong> {t('helpAdmin.section5.menu.restart.body')}
    </li>
    <li>
        <strong>{t('helpAdmin.section5.menu.restartProgram.label')}</strong> {t('helpAdmin.section5.menu.restartProgram.body')}
    </li>
</ul>

            </li>
            <li className="mt-4">
                <strong>{t('helpAdmin.section5.sensor.label')}</strong>
                <p className="mt-2">
                    {t('helpAdmin.section5.sensor.intro')}
                    <ul className="list-disc list-inside pl-6 mt-2">
                        <li className="flex items-center gap-2">
                            <img
                                src={RunningIcon}
                                alt={t('helpAdmin.common.runningIconAlt')}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                {t('helpAdmin.section5.sensor.detected')}
                            </span>
                        </li>
                        <li className="flex items-center gap-2">
                            <img
                                src={StoppedIcon}
                                alt={t('helpAdmin.common.stoppedIconAlt')}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                {t('helpAdmin.section5.sensor.notDetected')}
                            </span>
                        </li>
                    </ul>
                    <p className="mt-2">
                        {t('helpAdmin.section5.sensor.viewingDistanceIntro')}
                        <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md mt-2 text-sm">
                            {t('helpAdmin.section5.sensor.viewingDistanceFormula')}
                        </div>
                        <ul className="list-disc list-inside mt-2">
                            <li>
                                <strong>{t('helpAdmin.section5.sensor.diagonal.label')}</strong> {t('helpAdmin.section5.sensor.diagonal.body')}
                                <div className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md mt-2 text-sm">
                                    {t('helpAdmin.section5.sensor.diagonalFormula')}
                                </div>
                            </li>
                            <li>
                                {t('helpAdmin.section5.sensor.ensureNote')}
                            </li>
                        </ul>
                    </p>
                </p>
            </li>
            <li className="mt-4">
                <strong>{t('helpAdmin.section5.wheelchair.label')}</strong>
                <p className="mt-2">
                    {t('helpAdmin.section5.wheelchair.intro')}
                    <ul className="list-disc list-inside pl-6 mt-2">
                        <li className="flex items-center gap-2">
                            <img
                                src={LoadingIcon}
                                alt={t('helpAdmin.common.loadingIconAlt')}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                {t('helpAdmin.section5.wheelchair.detecting')}
                            </span>
                        </li>
                        <li className="flex items-center gap-2">
                            <img
                                src={RunningIcon}
                                alt={t('helpAdmin.common.runningIconAlt')}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                {t('helpAdmin.section5.wheelchair.detected')}
                            </span>
                        </li>
                        <li className="flex items-center gap-2">
                            <img
                                src={StoppedIcon}
                                alt={t('helpAdmin.common.stoppedIconAlt')}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                {t('helpAdmin.section5.wheelchair.notDetected')}
                            </span>
                        </li>
                    </ul>
                </p>
            </li>
            <li className="mt-4">
                <strong>{t('helpAdmin.section5.heightAdjust.label')}</strong>
                <p className="mt-2">
                    {t('helpAdmin.section5.heightAdjust.intro')}
                    <ul className="list-disc list-inside pl-6 mt-2">
                        <li className="flex items-center gap-2">
                            <img
                                src={RunningIcon}
                                alt={t('helpAdmin.common.runningIconAlt')}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                {t('helpAdmin.section5.heightAdjust.inProgress')}
                            </span>
                        </li>
                        <li className="flex items-center gap-2">
                            <img
                                src={StoppedIcon}
                                alt={t('helpAdmin.common.stoppedIconAlt')}
                                className="w-6 h-6"
                            />
                            <span className="text-black-500 font-medium">
                                {t('helpAdmin.section5.heightAdjust.notInProgress')}
                            </span>
                        </li>
                    </ul>
                </p>
            </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6">{t('helpAdmin.section5.troubleshootingTitle')}</h3>
        <p className="mt-4">
            {t('helpAdmin.section5.troubleshootingIntro')}
        </p>
        <ul className="list-disc list-inside pl-4 mt-4">
            <li>
                <strong>{t('helpAdmin.section5.troubleshoot.systemStatus.label')}</strong> {t('helpAdmin.section5.troubleshoot.systemStatus.body')}
            </li>
            <li>
                <strong>{t('helpAdmin.section5.troubleshoot.sensor.label')}</strong> {t('helpAdmin.section5.troubleshoot.sensor.body')}
            </li>
            <li>
                <strong>{t('helpAdmin.section5.troubleshoot.wheelchair.label')}</strong> {t('helpAdmin.section5.troubleshoot.wheelchair.body')}
            </li>
            <li>
                <strong>{t('helpAdmin.section5.troubleshoot.heightAdjust.label')}</strong> {t('helpAdmin.section5.troubleshoot.heightAdjust.body')}
            </li>
        </ul>
    </details>
</div>

{/* Section: Analysis Features */}
<div className="border p-6 rounded-lg shadow-md">
    <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <summary className="text-lg font-semibold cursor-pointer">{t('helpAdmin.section6.title')}</summary>
        <p className="mt-4">
            {t('helpAdmin.section6.intro.pre')}<strong>{t('helpAdmin.section6.analyticsTab')}</strong>{t('helpAdmin.section6.intro.post')}
        </p>
        <ul className="list-disc list-inside pl-4">
            <li>
                <strong>{t('helpAdmin.section6.liveCharts.label')}</strong> {t('helpAdmin.section6.liveCharts.body')}
            </li>
            <li>
                <strong>{t('helpAdmin.section6.history.label')}</strong> {t('helpAdmin.section6.history.body')}
            </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6">{t('helpAdmin.section6.howItWorksTitle')}</h3>
        <p className="mt-4">
            {t('helpAdmin.section6.howItWorksIntro')}
        </p>
        <ul className="list-disc list-inside pl-4">
            <li>
                <strong>{t('helpAdmin.section6.dateRange.label')}</strong> {t('helpAdmin.section6.dateRange.body')}
                <div className="text-center my-4">
                    <img
                        src={selectdate} // Replace with the actual path
                        alt={t('helpAdmin.section6.dateRange.imageAlt')}
                        className="w-full max-w-md rounded-lg shadow-md"
                    />
                </div>
            </li>
            <li>
  <strong>{t('helpAdmin.section6.charts.label')}</strong> {t('helpAdmin.section6.charts.body')}
  <ul className="list-disc list-inside pl-6 mt-2">
    <li>
      <strong>{t('helpAdmin.section6.charts.line.label')}</strong> {t('helpAdmin.section6.charts.line.body')}
    </li>
    <li>
      <strong>{t('helpAdmin.section6.charts.stackedBar.label')}</strong> {t('helpAdmin.section6.charts.stackedBar.body')}
    </li>
    <li>
      {t('helpAdmin.section6.charts.note')}
    </li>
  </ul>
</li>

<li>
  <strong>{t('helpAdmin.section6.keyMetrics.label')}</strong>
  <ul className="list-disc list-inside pl-6 mt-2">
    <li>
      <strong>{t('helpAdmin.section6.keyMetrics.longestViewed.label')}</strong> {t('helpAdmin.section6.keyMetrics.longestViewed.body')}
    </li>
    <li>
      <strong>{t('helpAdmin.section6.keyMetrics.mostViewed.label')}</strong> {t('helpAdmin.section6.keyMetrics.mostViewed.body')}
    </li>
  </ul>
</li>

<li>
  <strong>{t('helpAdmin.section6.downloadReports.label')}</strong> {t('helpAdmin.section6.downloadReports.body')}
  <button

                                className="bg-gradient-to-r from-blue-400 to-blue-600 text-black px-6 py-3 rounded-lg shadow-lg hover:from-blue-500 hover:to-blue-700 flex items-center gap-2 transition duration-300 ease-in-out transform hover:scale-105"
                            >
                                <span className="font-medium">{t('helpAdmin.section6.downloadReports.buttonLabel')}</span>
                                <ArrowDownTrayIcon className="w-5 h-5" />
                            </button>
  <ul className="list-disc list-inside pl-6 mt-2">
    <li>
      {t('helpAdmin.section6.downloadReports.step.pre')}<strong>{t('helpAdmin.section6.downloadReports.buttonLabel')}</strong>{t('helpAdmin.section6.downloadReports.step.post')}
    </li>
    <li>
      {t('helpAdmin.section6.downloadReports.contents')}
    </li>
    <li>
      {t('helpAdmin.section6.downloadReports.useCase')}
    </li>
  </ul>
</li>

        </ul>


        <h3 className="text-xl font-semibold mt-6">{t('helpAdmin.section6.errorTroubleshootingTitle')}</h3>
        <ul className="list-disc list-inside pl-4">
            <li>
                <strong>{t('helpAdmin.section6.error.disconnected.label')}</strong> {t('helpAdmin.section6.error.disconnected.body')}
            </li>
        </ul>


    </details>
</div>








            </div>
        </div>
    );
}

export default InternalPage;
