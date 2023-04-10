import { createSlice } from '@reduxjs/toolkit';

export const initialState = {
  value: {
    isSystemUser: 0,
    userEmail: '',
    uniqueId: 0,
    orgId: 0,
    tokenExpireTime: 0,
    organization: [],
    currentOrganization: 0,
    tokenGeneratedTime: '',
    userName: '',
    token: '',
    selectedOrganization: [],
    permissions: [],
  },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserEmail: (state, action) => {
      state.value.userEmail = action.payload.userEmail;
    },
    setIsSystemUser: (state, action) => {
      state.value.isSystemUser = action.payload.isSystemUser;
    },
    setUniqueId: (state, action) => {
      state.value.uniqueId = action.payload.uniqueId;
    },
    setOrgId: (state, action) => {
      state.value.orgId = action.payload.orgId;
    },
    setTokenExpireTime: (state, action) => {
      state.value.tokenExpireTime = action.payload.tokenExpireTime;
    },
    setOrganization: (state, action) => {
      state.value.organization = action.payload.organization;
    },
    setCurrentOrganization: (state, action) => {
      state.value.currentOrganization = action.payload.currentOrganization;
    },
    setTokenGeneratedTime: (state, action) => {
      state.value.tokenGeneratedTime = action.payload.tokenGeneratedTime;
    },
    setUserName: (state, action) => {
      state.value.userName = action.payload.userName;
    },
    setToken: (state, action) => {
      state.value.token = action.payload.token;
    },
    setSelectedOrganization: (state, action) => {
      state.value.selectedOrganization = action.payload.selectedOrganization;
    },
    setPermissions: (state, action) => {
      state.value.permissions = action.payload.permissions;
    },
    setInitialUserState: (state) => {
      state.value = initialState.value;
    },
  },
});

export const {
  setUserEmail,
  setIsSystemUser,
  setUniqueId,
  setOrgId,
  setTokenExpireTime,
  setOrganization,
  setCurrentOrganization,
  setTokenGeneratedTime,
  setUserName,
  setToken,
  setSelectedOrganization,
  setPermissions,
  setInitialUserState,
} = authSlice.actions;

export const authReducer = authSlice.reducer;
