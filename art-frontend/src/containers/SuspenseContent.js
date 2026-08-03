// Rendered as the Suspense fallback before the LanguageProvider (and
// everything below it) has mounted, so it can't call useTranslation() -
// this is the one string in the app that's always English regardless of
// the saved language preference (visible only for a brief flash on load).
function SuspenseContent(){
    return(
        <div className="w-full h-screen text-gray-300 dark:text-gray-200 bg-base-100">
            Loading...
        </div>
    )
}

export default SuspenseContent