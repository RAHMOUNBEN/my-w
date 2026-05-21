// Custom auth hook - not using OAuth
// Admin and Buyer use their own auth systems
export function useAuth() {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    logout: () => {
      localStorage.removeItem("adminAuth");
      localStorage.removeItem("buyerKey");
      localStorage.removeItem("buyerData");
    },
  };
}
