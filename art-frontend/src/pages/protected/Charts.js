import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import Charts from '../../features/charts'
import { setPageTitle } from '../../features/common/headerSlice'
import { useTranslation } from '../../i18n'

function InternalPage(){
    const dispatch = useDispatch()
    const { t } = useTranslation()

    useEffect(() => {
        dispatch(setPageTitle({ title : t('chartsPage.pageTitle')}))
      }, [dispatch, t])


    return(
        <Charts />
    )
}

export default InternalPage