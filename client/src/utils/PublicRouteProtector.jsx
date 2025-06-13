import { Navigate } from "react-router-dom";

function PublicRouteProtector({ children }) {
    const isAuthenticated = localStorage.getItem("token");
    return isAuthenticated ? <Navigate to="/" /> : children;
}

export default PublicRouteProtector;
