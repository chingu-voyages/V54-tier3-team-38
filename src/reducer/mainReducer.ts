export interface State {
  Token: string[];
  User: any[];
  UserProfile: any[];
  viewAsset: any[];
  createAsset: any[];
  gridState: any[];
  jsonGridState: object;
  draggedElement: any;
}

interface Action {
  type: string;
  payload?: any;
}

const JSONStorage = JSON.parse(localStorage.getItem('STATE') || '{}');

const initialState: State = {
  Token: [],
  User: [],
  UserProfile: [],
  viewAsset: [],
  createAsset: [],
  gridState: [],
  jsonGridState: {},
  draggedElement: null,
  ...(JSONStorage as Partial<State>),
};

const saveToLocalStorage = (state: State) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('STATE', serializedState);
  } catch (e) {
    console.error("❌ Failed to save state:", e);
  }
};

export const mainReducer = (state = initialState, action: Action): State => {
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
      newState.viewAsset = [...state.viewAsset, action.payload];
      saveToLocalStorage(newState);
      return newState;

    case 'VIEW_ASSET':
      newState.viewAsset = action.payload;
      saveToLocalStorage(newState);
      return newState;

    case 'SET_GRID_STATE':
      newState.gridState = action.payload;
      saveToLocalStorage(newState);
      return newState;

    case 'SET_JSON_GRID_STATE':
      newState.jsonGridState = action.payload;
      saveToLocalStorage(newState);
      return newState;

    case 'SET_DRAGGED_ELEMENT':
      newState.draggedElement = action.payload;
      saveToLocalStorage(newState);
      return newState;

    default:
      return state;
  }
};
