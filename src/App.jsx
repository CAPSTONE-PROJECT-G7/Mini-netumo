import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import TargetList from "./components/TargetList";
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.interceptors.request.use(cfg => {
  cfg.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  return cfg;
});

export default function App() {
  const { data: targets = [] } = useQuery({
    queryKey: ["targets"],
    queryFn: () => axios.get("/targets").then(r => r.data)
  });
  
  return (
    <main className="p-4">
      <h1 className="text-3xl font-bold mb-4">Mini-Netumo Dashboard</h1>
      <TargetList targets={targets} />
    </main>
  );
}