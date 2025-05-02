import { BrowserRouter, Route, Routes } from "react-router-dom";
import { MainPage } from "./mainPage";
import { ProfilePage } from "./profilePage";

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRoutes;