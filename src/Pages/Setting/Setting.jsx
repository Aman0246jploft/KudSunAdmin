import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import StaticSettings from "./StaticSettings";
import { termAndPolicy } from "../../features/slices/settingSlice";

export default function Setting() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        const termResult = await dispatch(termAndPolicy()).unwrap();

        // You can handle `termResult` here if needed
      } catch (error) {
        console.error("Unexpected error in fetchData:", error);
        toast.error("Unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  return (
    <div className="p-4 space-y-6">
      {loading && <p>Loading settings...</p>}

      <StaticSettings />
    </div>
  );
}
