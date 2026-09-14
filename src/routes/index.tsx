import { createBrowserRouter } from "react-router-dom";

import AdminLayout from "@/layouts/AdminLayout";

import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Product";
import ProductDetail from "@/pages/ProductDetail";
import Login from "@/pages/Login";

import ProtectedRoute from "./ProtectedRoute";
import PublicRoute from "./PublicRoute";
import Categories from "@/pages/Categories";
import Payments from "@/pages/Payments";
import Orders from "@/pages/Orders";
import Returns from "@/pages/Returns";
import Refunds from "@/pages/Refunds";
import Users from "@/pages/Users";
import ProductCreate from "@/pages/ProductCreate";
import UserDetail from "@/pages/UserDetail";
import AdminProfile from "@/pages/AdminProfile";
import Setting from "@/pages/Setting";

export const router = createBrowserRouter([
  // =========================
  // PUBLIC ROUTES
  // =========================
  {
    element: <PublicRoute />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },

  // =========================
  // PROTECTED ADMIN ROUTES
  // =========================
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },

          {
            path: "products",
            element: <Products />,
          },
          {
            path: "products/new",
            element: <ProductCreate />,
          },

          {
            path: "products/:id",
            element: <ProductDetail />,
          },
          {
            path: "categories",
            element: <Categories />,
          },

          {
            path: "orders",
            element: <Orders />,
          },

          {
            path: "payments",
            element: <Payments />,
          },

          {
            path: "returns",
            element: <Returns />,
          },

          {
            path: "refunds",
            element: <Refunds />,
          },

          {
            path: "users",
            element: <Users />,
          },
          {
            path: "users/:id",
            element: <UserDetail />,
          },
          {
            path: "profile",
            element: <AdminProfile />,
          },
          {
            path: "settings",
            element: <Setting />,
          },
        ],
      },
    ],
  },

  // =========================
  // FALLBACK
  // =========================
  {
    path: "*",
    element: <Login />,
  },
]);
