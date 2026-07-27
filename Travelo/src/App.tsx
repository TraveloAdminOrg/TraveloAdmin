  import {  Routes, Route } from "react-router-dom";
  import SignIn from "./pages/AuthPages/SignIn";
  import NotFound from "./pages/OtherPage/NotFound";
  // import UserProfiles from "./pages/UserProfiles";
  import Videos from "./pages/UiElements/Videos";
  import Images from "./pages/UiElements/Images";
  import Alerts from "./pages/UiElements/Alerts";
  import Badges from "./pages/UiElements/Badges";
  import Avatars from "./pages/UiElements/Avatars";
  import Buttons from "./pages/UiElements/Buttons";
  import LineChart from "./pages/UiElements/LineChart";
  import PayChart from "./pages/Payment/PaymentBarChart";
  // import Calendar from "./pages/Calendar";
  // import FormElements from "./pages/Forms/FormElements";
  import Blank from "./pages/Blank";
  import AppLayout from "./layout/AppLayout";
  import { ScrollToTop } from "./components/common/ScrollToTop";
  import Home from "./pages/Dashboard/Home";
  import UserTables from "./pages/Community/UserTables";
  import DriverTable from "./pages/Community/DriverTables";
  import Transaction from "./pages/Payment/TransactionHistory";
  import "react-datepicker/dist/react-datepicker.css";
  import ContentManagement from "./pages/ContentManagement/ContentManagement";
  import HelpAndSupport from "./pages/HelpAndSupport/HelpAndSupport";
  import DriverProfiles from "./pages/Community/DriverProfile";
  import RideHistoryPage from "./pages/RideHistoryPage";
  import UserProfiles from "./pages/Community/UserProfile";
  import UserRideHistoryPage from "./pages/UserRideHistoryPage";
  import FareManagement from "./pages/FareManagement/FareManagementPage";
  import CommissionPage from "./pages/Commission/CommissionPage";
  import ExtraChargesPage from "./pages/ExtraCharges/ExtraChargesPage";
  import RegionPage from "./pages/Region/RegionPage";
  // Role Management is hidden — re-enable by uncommenting these imports and
  // the routes below.
  // import RoleManagementPage from "./pages/RoleManagement/RoleManagementPage";
  // import CreateRolePage from "./pages/RoleManagement/CreateRolePage";
  // import AdminProfiles from "./pages/RoleManagement/AdminProfilePage";
  // import EditRolePage from "./pages/RoleManagement/EditRolePage";
  import RideTypesPage from "./pages/RideTypes/RideTypesPage";
  import RidesPage from "./pages/Rides/RidesPage";
  import DriverApprovalsPage from "./pages/DriverApprovals/DriverApprovalsPage";
  import ReviewsPage from "./pages/Reviews/ReviewsPage";
  import NotificationsPage from "./pages/Notifications/NotificationsPage";
  import AdvertsPage from "./pages/Adverts/AdvertsPage";
  import LiveDispatchPage from "./pages/LiveDispatch/LiveDispatchPage";
  import ReportsPage from "./pages/Reports/ReportsPage";
import ProtectedRoute from "./components/common/ProtectedRoute";


  export default function App() {
    return (
      <>
        {/* <Router> */}
          <ScrollToTop />
          <Routes>
            {/* Dashboard Layout */}
            {/* <Route path="/TailAdmin" element={<AppLayout />}>
              <Route index element={<Home />} /> */}
              <Route path="/" element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
            }
              >
              <Route index element={<Home />} />
  

              {/* Others Page */}
              {/* <Route path="profile" element={<UserProfiles />} /> */}
              {/* <Route path="calendar" element={<Calendar />} /> */}
              <Route path="blank" element={<Blank />} />

              {/* Forms */}
              {/* <Route path="form-elements" element={<FormElements />} /> */}

              {/* Community Tables */}
              <Route path="basic-tables" element={<UserTables />} />
              <Route path="driver-tables" element={<DriverTable />} />
              <Route path="DriverProfile/:id" element={<DriverProfiles />} />
              <Route path="DriverProfile/:id/history" element={<RideHistoryPage />} />
              <Route path="UserProfile/:id" element={<UserProfiles />} />
              <Route path="UserProfile/:id/history" element={<UserRideHistoryPage />} />


              {/* Payment Tables */}
              <Route path="payment-chart" element={<PayChart />} />
              <Route path="transaction-history" element={<Transaction />} />

              {/* Fare Management */}
              <Route path="fare-management" element={<FareManagement />} />
              {/* Commission */}
              <Route path="commission" element={<CommissionPage />} />
              {/* Extra Charges (finish-ride surcharges) */}
              <Route path="extra-charges" element={<ExtraChargesPage />} />
              {/* Regions */}
              <Route path="regions" element={<RegionPage />} />

              {/* Ride Types (Vehicle Categories) */}
              <Route path="ride-types" element={<RideTypesPage />} />

              {/* New ride-hailing operations features */}
              <Route path="rides" element={<RidesPage />} />
              <Route path="driver-approvals" element={<DriverApprovalsPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="adverts" element={<AdvertsPage />} />
              <Route path="live-dispatch" element={<LiveDispatchPage />} />
              <Route path="reports" element={<ReportsPage />} />

              {/* Content Management */}
              <Route path="content-management" element={<ContentManagement />} />
              {/* Help and Support */}
              <Route path="help-support" element={<HelpAndSupport />} />

              {/* Role Management — hidden. Uncomment to restore. */}
              {/*
              <Route path="role-management" element={<RoleManagementPage />} />
              <Route path="create-role-page" element={<CreateRolePage />} />
              <Route path="edit-role-page/:id" element={<EditRolePage />} />
              <Route path="AdminProfile/:id" element={<AdminProfiles />} />
              */}


              {/* Ui Elements */}
              <Route path="alerts" element={<Alerts />} />
              <Route path="avatars" element={<Avatars />} />
              <Route path="badge" element={<Badges />} />
              <Route path="buttons" element={<Buttons />} />
              <Route path="images" element={<Images />} />
              <Route path="videos" element={<Videos />} />

              {/* Charts */}
              <Route path="line-chart" element={<LineChart />} />
            </Route>

            {/* Auth Layout */}
            <Route path="/signin" element={<SignIn />} />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        {/* </Router> */}
      </>
    );
  }
