import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import Menu from "../pages/Menu";
import React from "react";
import RegisterPage from "../pages/RegisterPage";
import FavoriteFoodPage from "../pages/FavoriteFoodPage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/favorites_food" element={<FavoriteFoodPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/menu" element={<Menu />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
