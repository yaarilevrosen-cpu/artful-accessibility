import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { setPageTitle } from '../../features/common/headerSlice'
import FaceFrownIcon  from '@heroicons/react/24/solid/FaceFrownIcon'
import { useTranslation } from '../../i18n'

function InternalPage(){

    const dispatch = useDispatch()
    const { t } = useTranslation()

    useEffect(() => {
        dispatch(setPageTitle({ title : ""}))
      }, [])

    return(
        <div className="hero h-4/5 bg-base-200">
            <div className="hero-content text-accent text-center">
                <div className="max-w-md">
                <FaceFrownIcon className="h-48 w-48 inline-block"/>
                <h1 className="text-5xl  font-bold">{t('notFound.title')}</h1>
                </div>
            </div>
        </div>
    )
}

export default InternalPage
