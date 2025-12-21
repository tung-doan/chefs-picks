import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import Menu from "../pages/Menu";
import React from "react";
import RegisterPage from "../pages/RegisterPage";
import DishDetail from "../pages/DishDetail";
import FavoriteFood from "../pages/FavoriteFoodPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import SuggestPage from "../pages/SuggestPage";
import MealHistory from "../pages/MealHistory";


const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/menu/:id" element={<DishDetail />} />
        <Route path="/favorites" element={<FavoriteFood />} />
        <Route path="/suggest" element={<SuggestPage />} />
        <Route path="/history" element={<MealHistory />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
