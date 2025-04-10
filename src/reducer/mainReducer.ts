export interface State {
  Token: string[];
  User: any[];
  UserProfile: any[];
  viewAsset: any[];
  createAsset: any[];
}

const JSONStorage = JSON.parse(localStorage.getItem('STATE') || '{}');

const initialState: State = {
  Token: [],
  User: [],
  UserProfile: [],
  viewAsset: [],
  createAsset: [],
  ...JSONStorage,
};

const saveToLocalStorage = (state: State) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('STATE', serializedState);
  } catch (e) {
    console.error("❌ Failed to save state:", e);
  }
};

export const mainReducer = (state = initialState, action: any): State => {
  const newState = { ...state };

  switch (action.type) {
    case 'SET_TOKEN':
      newState.Token = action.payload;
      saveToLocalStorage(newState);
      return newState;
    case 'SET_USER':
      newState.User = action.payload;
      saveToLocalStorage(newState);
      return newState;
    case 'SET_USER_PROFILE':
      newState.UserProfile = action.payload;
      saveToLocalStorage(newState);
      return newState;
    case 'CREATE_ASSET':
      newState.createAsset = action.payload;
      saveToLocalStorage(newState);
      return newState;
    case 'VIEW_ASSET':
      saveToLocalStorage(newState);
      newState.viewAsset = action.payload;
    default:
      return state;
  }
};
