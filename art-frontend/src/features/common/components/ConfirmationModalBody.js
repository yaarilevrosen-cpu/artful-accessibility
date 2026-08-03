import {useDispatch, useSelector} from 'react-redux'
import axios from 'axios'
import { CONFIRMATION_MODAL_CLOSE_TYPES, MODAL_CLOSE_TYPES } from '../../../utils/globalConstantUtil'
import { deleteLead } from '../../leads/leadSlice'
import { showNotification } from '../headerSlice'
import { useTranslation } from '../../../i18n'

function ConfirmationModalBody({ extraObject, closeModal}){

    const dispatch = useDispatch()
    const { t } = useTranslation()

    const { message, type, _id, index} = extraObject


    const proceedWithYes = async() => {
        if(type === CONFIRMATION_MODAL_CLOSE_TYPES.LEAD_DELETE){
            // positive response, call api or dispatch redux function
            dispatch(deleteLead({index}))
            dispatch(showNotification({message : t('modal.leadDeleted'), status : 1}))
        }
        closeModal()
    }

    return(
        <>
        <p className=' text-xl mt-8 text-center'>
            {message}
        </p>

        <div className="modal-action mt-12">

                <button className="btn btn-outline   " onClick={() => closeModal()}>{t('common.cancel')}</button>

                <button className="btn btn-primary w-36" onClick={() => proceedWithYes()}>{t('common.yes')}</button>

        </div>
        </>
    )
}

export default ConfirmationModalBody