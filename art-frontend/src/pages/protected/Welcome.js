import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../features/common/headerSlice';
import TitleCard from "../../components/Cards/TitleCard";
import logo from '../protected/Photos/logo.png';
import { useTranslation } from "../../i18n";

function ManagerWelcomePage() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(setPageTitle({ title: t('sidebar.welcome') }));
  }, [dispatch, t]);

  return (
    <TitleCard>
    {/* Logo Section */}
    <div className="flex justify-center mb-8">
      <div
        className="p-4 rounded-full border-4 border-yellow-500 bg-gray-100 dark:bg-gray-800 shadow-lg"
        style={{ width: "180px", height: "180px" }}
      >
        <img
          src={logo}
          alt={t('sidebar.logoAlt')}
          className="w-full h-full object-contain rounded-full"
        />
      </div>
    </div>

    {/* Title Section */}
    <div className="text-center mb-10 space-y-6">
      <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 dark:text-gray-100 tracking-tight">
        {t('welcomeAdmin.title')}
      </h1>
      <h2 className="text-2xl md:text-3xl font-serif font-medium text-gray-700 dark:text-gray-300">
        {t('login.systemName')}
      </h2>
      <div className="flex justify-center mt-4">
        <div className="w-32 h-1 bg-yellow-500 rounded-full"></div>
      </div>
    </div>

    {/* About Section */}
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {t('welcomeAdmin.aboutTitle')}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
          {t('welcomeAdmin.aboutBody')}
      </p>
    </section>

    {/* Admin Features Section */}
<section className="mb-10">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
    {t('welcomeAdmin.toolsTitle')}
  </h2>
  <ul className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed space-y-4 list-disc list-inside">
    <li>
      <strong>{t('welcomeAdmin.tool.add.label')}</strong> {t('welcomeAdmin.tool.add.body')}
    </li>
    <li>
      <strong>{t('welcomeAdmin.tool.edit.label')}</strong> {t('welcomeAdmin.tool.edit.body')}
    </li>
    <li>
      <strong>{t('welcomeAdmin.tool.delete.label')}</strong> {t('welcomeAdmin.tool.delete.body')}
    </li>
    <li>
      <strong>{t('welcomeAdmin.tool.analytics.label')}</strong> {t('welcomeAdmin.tool.analytics.body')}
      <ul className="list-disc pl-6 mt-2">
        <li>{t('welcomeAdmin.tool.analytics.live')}</li>
        <li>{t('welcomeAdmin.tool.analytics.history')}</li>
      </ul>
    </li>
    <li>
  <strong>{t('welcomeAdmin.tool.tracking.label')}</strong> {t('welcomeAdmin.tool.tracking.body')}
  <ul className="list-disc list-inside pl-6">
    <li><strong>{t('welcomeAdmin.tool.tracking.system.label')}</strong> {t('welcomeAdmin.tool.tracking.system.body')}</li>
    <li><strong>{t('welcomeAdmin.tool.tracking.sensor.label')}</strong> {t('welcomeAdmin.tool.tracking.sensor.body')}</li>
    <li><strong>{t('welcomeAdmin.tool.tracking.wheelchair.label')}</strong> {t('welcomeAdmin.tool.tracking.wheelchair.body')}</li>
    <li><strong>{t('welcomeAdmin.tool.tracking.height.label')}</strong> {t('welcomeAdmin.tool.tracking.height.body')}</li>
  </ul>
</li>

    <li>
      <strong>{t('welcomeAdmin.tool.export.label')}</strong> {t('welcomeAdmin.tool.export.body')}
    </li>
    <li>
      <strong>{t('welcomeAdmin.tool.dateFilter.label')}</strong> {t('welcomeAdmin.tool.dateFilter.body')}
    </li>
    <li>
      <strong>{t('welcomeAdmin.tool.enlarge.label')}</strong> {t('welcomeAdmin.tool.enlarge.body')}
    </li>
  </ul>
</section>


    {/* Help Section */}
    <section className="mb-10">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {t('welcomeAdmin.helpTitle')}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
        {t('welcomeAdmin.helpBody')}
      </p>
      <ul className="list-disc list-inside pl-4 mt-4 text-gray-700 dark:text-gray-300">
        <li>{t('welcomeAdmin.helpItem.manage')}</li>
        <li>{t('welcomeAdmin.helpItem.reports')}</li>
        <li>{t('welcomeAdmin.helpItem.tracking')}</li>
      </ul>
    </section>

    {/* Call to Action */}
    <div className="text-center">
      <p className="text-lg text-gray-700 dark:text-gray-300 italic font-semibold mb-4">
      {t('welcomeAdmin.callToAction')}
      </p>
    </div>
  </TitleCard>

  );
}

export default ManagerWelcomePage;
