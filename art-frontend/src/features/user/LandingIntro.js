import TemplatePointers from "./components/TemplatePointers"
import { useTranslation } from "../../i18n"



function LandingIntro(){
    const { t } = useTranslation();

    return(
        <div className="hero min-h-full rounded-l-xl bg-base-200">
            <div className="hero-content py-12">
              <div className="max-w-md">

             
 {/* Logo Section */}
 <div className="flex justify-center mb-6">
          <div
            className="p-2 rounded-full border-4 border-yellow-500 bg-gray-50 dark:bg-gray-700 shadow-lg"
            style={{ width: "160px", height: "160px" }}
          >
            <img
              src="/logo512.png"
              alt={t("sidebar.logoAlt")}
              className="w-full h-full object-contain rounded-full"
            />
          </div>
        </div>

             <div className="text-center mb-8">
  <h1 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 dark:text-gray-100 tracking-tight leading-snug">
     <span className="text-black-600">{t("login.welcome")}</span>
  </h1>
  <p className="text-2xl md:text-3xl font-medium text-gray-700 dark:text-gray-300 mt-2">
    <span className="font-extrabold text-yellow-600">{t("login.systemName")}</span>
  </p>
  <div className="flex justify-center mt-4">
    <div className="w-16 h-1 bg-yellow-600 rounded-full"></div>
  </div>
</div>
              
              {/* Importing pointers component */}
              <TemplatePointers />
              
              </div>

            </div>
          </div>
    )
      
  }
  
  export default LandingIntro