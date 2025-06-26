// src/App.jsx

import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import LayoutWrapper from "./Component/Layout/LayoutWrapper";
import Loader from "./Component/Common/Loader";
import Category from "./Component/Category/Category";
import SubCategory from "./Component/SubCategory/SubCategory";
import AuctionProduct from "./Pages/AuctionProduct/AuctionProduct";
import SubCategoryParemeter from "./Component/SubCategoryParemeter/SubCategoryParemeter";
import Chat from "./Pages/Chat/Chat";

// Lazy-loaded pages
const Login = lazy(() => import("./Pages/Auth/Login"));
const Dashboard = lazy(() => import("./Pages/Dashboard/Dashboard"));
const Home = lazy(() => import("./Pages/Home/Home"));

const SellProduct = lazy(() => import("./Pages/SellProduct/SellProduct"));
const User = lazy(() => import("./Pages/User/User"));

function App() {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Private Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<LayoutWrapper />}>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/user" element={<User />} />
              <Route path="/sellProduct" element={<SellProduct />} />
              <Route path="/auctionProduct" element={<AuctionProduct />} />

              <Route path="/category" element={<Category />} />
              <Route path="/subcategory/:id" element={<SubCategory />} />
              <Route path="/chat" element={<Chat />} />

              
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
