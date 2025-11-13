import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
       title="Travelo Taxi App Dashboard | Manage Rides, Drivers & Earnings Easily"
        description="Travelo Taxi App Admin Dashboard built using React.js and Tailwind CSS, offering powerful tools for ride, driver, and revenue management."
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
