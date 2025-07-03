// src/App.jsx

import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import LayoutWrapper from "./Component/Layout/LayoutWrapper";
import Loader from "./Component/Common/Loader";
import Category from "./Component/Category/Category";
import SubCategory from "./Component/SubCategory/SubCategory";
import AuctionProduct from "./Pages/AuctionProduct/AuctionProduct";
import SubCategoryParemeter from "./Component/SubCategoryParemeter/SubCategoryParemeter";
import Chat from "./Pages/Chat/Chat";
import ProductInfo from "./Pages/ProductInfo/ProductInfo";
import ForgotPassword from "./Pages/ForgotPassword/ForgotPassword";
import VerifyResetOtp from "./Pages/ForgotPassword/VerifyResetOtp";
import ResetPassword from "./Pages/ForgotPassword/ResetPassword";
import Setting from "./Pages/Setting/Setting";
import Faqs from "./Pages/Faqs/Faqs";
import NetworkStatus from "./Component/NetworkStatus";
import ProfilePage from "./Pages/ProfilePage";




// Lazy-loaded pages
const Login = lazy(() => import("./Pages/Auth/Login"));
const Dashboard = lazy(() => import("./Pages/Dashboard/Dashboard"));
const Home = lazy(() => import("./Pages/Home/Home"));
const ContactUs = lazy(() => import("./Pages/ContactUs/ContactUs"));
const FeeSetting = lazy(() => import("./Pages/FeeSetting/FeeSetting"));
const Location = lazy(() => import("./Pages/Location/Location"));
const Bank = lazy(() => import("./Pages/Bank/Bank"));





const SellProduct = lazy(() => import("./Pages/SellProduct/SellProduct"));
const User = lazy(() => import("./Pages/User/User"));

function App() {
  return (
    <Router>
      <NetworkStatus />
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<LayoutWrapper />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/user" element={<User />} />
              <Route path="/sellProduct" element={<SellProduct />} />
              <Route path="/auctionProduct" element={<AuctionProduct />} />
              <Route path="/productInfo/:id" element={<ProductInfo />} />
              <Route path="/Setting" element={<Setting />} />
              <Route path="/faq" element={<Faqs />} />
              <Route path="/contact_us" element={<ContactUs />} />
              <Route path="/feeSetting" element={<FeeSetting />} />
              <Route path="/location" element={<Location />} />
              <Route path="/bank" element={<Bank />} />


              <Route path="/category" element={<Category />} />
              <Route path="/subcategory/:id" element={<SubCategory />} />
              <Route path="/chat" element={<Chat />} />

              <Route path="/ProfilePage" element={<ProfilePage />} />


              

              <Route
                path="/subcategoryParameter/:id"
                element={<SubCategoryParemeter />}
              />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
