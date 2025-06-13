import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Homepage from "../pages/Homepage";
import Login from "../pages/Login";

import AuthRouteProtector from "../utils/AuthRouteProtector";
import PublicRouteProtector from "../utils/PublicRouteProtector";
import Signup from "../pages/Signup";
import Chat from "../pages/Chat";
import { Origami } from "lucide-react";
import AccountManagement from "../pages/AccountManagement";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "",
                element: (
                    <AuthRouteProtector>
                        <Homepage />
                    </AuthRouteProtector>
                ),
                children: [
                    {
                        path: "",
                        element: (
                            <div className="flex-1 hidden md:flex flex-col mt-80 items-center justify-items-center text-gray-400">
                                <Origami size={"58px"} strokeWidth={1}/>
                                <p>Select a user to start the chat</p>
                            </div>
                        ),
                    },
                    {
                        path: "chat/:id", 
                        element: <Chat />,
                    },
                ],
            },
            {
                path: "/login",
                element: (
                    <PublicRouteProtector>
                        <Login />
                    </PublicRouteProtector>
                ),
            },
            {
                path: "/signup",
                element: (
                    <PublicRouteProtector>
                        <Signup />
                    </PublicRouteProtector>
                ),
            },
            {
                path: "/myAccount",
                element: (
                    <AuthRouteProtector>
                        <AccountManagement />
                    </AuthRouteProtector>
                )
            }
        ],
    },
]);

export default router;
