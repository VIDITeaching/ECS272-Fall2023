let state = {
  country: null, // You can initialize it with a default value or set it to a specific country.
};

export const getState = () => {
  return state;
};

export const setState = nextState => {
  state = {
    ...state,
    ...nextState, // This will update the 'country' property without affecting other properties in 'state'.
  };
};
