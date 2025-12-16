import axios from "axios";

export default function RentGrid({ tenant, onUpdate }) {
  const currentYear = new Date().getFullYear();
  const currentMonthIndex = new Date().getMonth();

  const joinDate = new Date(tenant.joinDate);
  const joinYear = joinDate.getFullYear();
  const joinMonthIndex = joinDate.getMonth();

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const toggleRent = async (monthStr) => {
    try {
      await axios.post("http://localhost:5000/api/tenants/toggle-rent", {
        tenantId: tenant._id,
        month: monthStr,
      });
      onUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex gap-1">
      {months.map((m, index) => {
        const fullMonthStr = `${m} ${currentYear}`;

        // --- LOGIC ---
        let status = "Pending";
        let isClickable = true;

        if (
          currentYear === new Date().getFullYear() &&
          index > currentMonthIndex
        ) {
          status = "Future";
          isClickable = false;
        } else if (
          currentYear < joinYear ||
          (currentYear === joinYear && index < joinMonthIndex)
        ) {
          status = "N/A";
          isClickable = false;
        } else {
          const record = tenant.rentHistory.find(
            (r) => r.month === fullMonthStr
          );
          if (record && record.status === "Paid") status = "Paid";
        }

        // --- MINIMAL STYLING ---
        let btnClass =
          "w-8 h-8 text-[10px] font-medium rounded-md border flex items-center justify-center transition-all ";

        if (status === "Paid") {
          // Matte Green
          btnClass +=
            "bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600";
        } else if (status === "Pending") {
          // Matte Red
          btnClass +=
            "bg-rose-500 border-rose-600 text-white hover:bg-rose-600";
        } else if (status === "N/A") {
          // Faint Gray (Invisible look)
          btnClass +=
            "bg-base-200 border-transparent text-base-content/20 cursor-not-allowed";
        } else {
          // Future
          btnClass +=
            "bg-transparent border-base-300 text-base-content/30 cursor-not-allowed";
        }

        return (
          <button
            key={m}
            onClick={() => isClickable && toggleRent(fullMonthStr)}
            disabled={!isClickable}
            className={btnClass}
            title={`${m}: ${status}`}
          >
            {m}
          </button>
        );
      })}
    </div>
  );
}
