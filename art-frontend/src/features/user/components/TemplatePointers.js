import CheckCircleIcon from "@heroicons/react/24/solid/CheckCircleIcon";
import { useTranslation } from "../../../i18n";

function TemplatePointers() {
  const { t } = useTranslation();

  const pointers = [
    t("login.pointer.autoHeight"),
    t("login.pointer.liveMonitoring"),
    t("login.pointer.analytics"),
  ];

  return (
    <ul className="mt-6 space-y-3 text-start">
      {pointers.map((pointer, i) => (
        <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
          <CheckCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <span>{pointer}</span>
        </li>
      ))}
    </ul>
  );
}

export default TemplatePointers;
