import { createSlice } from '@reduxjs/toolkit'
//import axios from 'axios'

export const leadsSlice = createSlice({
    name: 'leads',
    initialState: {
        isLoading: false,
        leads : []
    },
    reducers: {
        addNewLead: (state, action) => {
            let {newLeadObj} = action.payload
            state.leads = [...state.leads, newLeadObj]
        },
        deleteLead: (state, action) => {
            let {index} = action.payload
            state.leads.splice(index, 1)
        }
    }
})


export const { addNewLead, deleteLead } = leadsSlice.actions

export default leadsSlice.reducer
