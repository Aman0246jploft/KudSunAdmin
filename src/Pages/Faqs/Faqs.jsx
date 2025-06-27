import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import FaqSettings from "./FaqSettings";
import { getFAQs } from "../../features/slices/settingSlice";

export default function Faqs() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        const faqResult = await dispatch(getFAQs()).unwrap();
        // You can handle `faqResult` here if needed
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
      {loading && <p>Loading FAQs...</p>}

      <FaqSettings />
    </div>
  );
}
