import { configureStore } from '@reduxjs/toolkit'
import headerSlice from '../features/common/headerSlice'
import modalSlice from '../features/common/modalSlice'
import rightDrawerSlice from '../features/common/rightDrawerSlice'
import leadsSlice from '../features/leads/leadSlice'
import {apiSlice} from "../utils/apiSlice";

const combinedReducer = {
  header : headerSlice,
  rightDrawer : rightDrawerSlice,
  modal : modalSlice,
  lead : leadsSlice,
  [apiSlice.reducerPath]: apiSlice.reducer,

}

export default configureStore({
  reducer: combinedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware)
})

