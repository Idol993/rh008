import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useMESStore } from "@/store/useMESStore";
import { Layout } from "@/components/layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Orders from "@/pages/Orders";
import Planning from "@/pages/Planning";
import WorkOrders from "@/pages/WorkOrders";
import Equipment from "@/pages/Equipment";
import Quality from "@/pages/Quality";
import Warehouse from "@/pages/Warehouse";
import Energy from "@/pages/Energy";
import Cost from "@/pages/Cost";
import Settings from "@/pages/Settings";
import type { RoleType } from "@/types";

function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: RoleType[] }) {
  const currentUser = useMESStore((state) => state.currentUser);
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(currentUser.roleId)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route
          path="/dashboard"
          element={
            <RequireAuth roles={['operator', 'teamLeader', 'workshopDirector', 'factoryManager']}>
              <Dashboard />
            </RequireAuth>
          }
        />
        
        <Route
          path="/orders"
          element={
            <RequireAuth roles={['workshopDirector', 'factoryManager']}>
              <Orders />
            </RequireAuth>
          }
        />
        
        <Route
          path="/planning"
          element={
            <RequireAuth roles={['workshopDirector', 'factoryManager']}>
              <Planning />
            </RequireAuth>
          }
        />
        
        <Route
          path="/workorders"
          element={
            <RequireAuth roles={['operator', 'teamLeader', 'workshopDirector', 'factoryManager']}>
              <WorkOrders />
            </RequireAuth>
          }
        />
        
        <Route
          path="/equipment"
          element={
            <RequireAuth roles={['teamLeader', 'workshopDirector', 'factoryManager']}>
              <Equipment />
            </RequireAuth>
          }
        />
        
        <Route
          path="/quality"
          element={
            <RequireAuth roles={['teamLeader', 'workshopDirector', 'factoryManager']}>
              <Quality />
            </RequireAuth>
          }
        />
        
        <Route
          path="/warehouse"
          element={
            <RequireAuth roles={['teamLeader', 'workshopDirector', 'factoryManager']}>
              <Warehouse />
            </RequireAuth>
          }
        />
        
        <Route
          path="/energy"
          element={
            <RequireAuth roles={['workshopDirector', 'factoryManager']}>
              <Energy />
            </RequireAuth>
          }
        />
        
        <Route
          path="/cost"
          element={
            <RequireAuth roles={['factoryManager']}>
              <Cost />
            </RequireAuth>
          }
        />
        
        <Route
          path="/settings"
          element={
            <RequireAuth roles={['factoryManager']}>
              <Settings />
            </RequireAuth>
          }
        />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
