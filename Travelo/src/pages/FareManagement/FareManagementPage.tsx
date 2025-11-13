
import FareSection from "../../components/FareManagement/FareSection";

export default function FareManagement() {
  return (
    <div className="p-6 space-y-10">
      <FareSection
        country="UK"
        currency="£"
        initialFares={[
          { id: 1, title: "Base Fare", amount: 10 },
          { id: 2, title: "Cleaning Service Charges", amount: 5 },
        ]}
        fareOptions={[
          { id: 1, title: "Base Fare" },
          { id: 2, title: "Cleaning Service Charges" },
          { id: 3, title: "Add Stop Charges" },
          { id: 4, title: "Waiting Time Charges" },
          { id: 5, title: "Tunnel Charges" },
        ]}
      />

      <FareSection
        country="Malta"
        currency="€"
        initialFares={[
          { id: 1, title: "Base Fare", amount: 8 },
          { id: 2, title: "Island Surcharge", amount: 3 },
        ]}
        fareOptions={[
          { id: 1, title: "Base Fare" },
          { id: 2, title: "Island Surcharge" },
          { id: 3, title: "Port Charges" },
          { id: 4, title: "Waiting Time Charges" },
        ]}
      />

      <FareSection
        country="Pakistan"
        currency="PKR"
        initialFares={[
          { id: 1, title: "Base Fare", amount: 300 },
          { id: 2, title: "Cleaning Service Charges", amount: 100 },
        ]}
        fareOptions={[
          { id: 1, title: "Base Fare" },
          { id: 2, title: "Cleaning Service Charges" },
          { id: 3, title: "Fuel Charges" },
          { id: 4, title: "Waiting Time Charges" },
        ]}
      />
    </div>
  );
}
