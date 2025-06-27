// utils/navigation.js
let navigate = null;

export const setNavigator = (nav) => {
  navigate = nav;
};

export const navigateToLogin = () => {
  if (navigate) {
    navigate('/login');
  }
};
